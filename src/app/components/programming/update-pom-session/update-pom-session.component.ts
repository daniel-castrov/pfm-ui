import {ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {Observable, Subject} from 'rxjs';
import {merge} from 'rxjs/observable/merge';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {HeaderComponent} from '../../../components/header/header.component';
import {Pom, POMService, User, UserService, Worksheet, WorksheetEvent, WorksheetService} from "../../../generated";
import {UserUtils} from "../../../services/user.utils";
import {Notify} from "../../../utils/Notify";
import {RowNode} from "ag-grid";
import {ActivatedRoute} from "@angular/router";
import {RowUpdateEventData} from "../../../generated/model/rowUpdateEventData";
import {TagsService} from "../../../services/tags.service";
import {GridToaComponent} from "./grid-toa/grid-toa.component";
import {EventsModalComponent} from "./events-modal/events-modal.component";
import {WorksheetComponent} from "./worksheet/worksheet.component";

@Component({
  selector: 'update-pom-session',
  templateUrl: './update-pom-session.component.html',
  styleUrls: ['./update-pom-session.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpdatePomSessionComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  @ViewChild(WorksheetComponent) private worksheetComponent: WorksheetComponent;
  @ViewChild(GridToaComponent) private gridToaComponent: GridToaComponent;
  @ViewChild(EventsModalComponent) private eventsModalComponent: EventsModalComponent;
  @ViewChild("instance") instance: NgbTypeahead;

  pom: Pom;
  user: User;
  columnDefs;
  columnKeys;
  filterText;
  bulkType: string;
  bulkAmount: number;
  worksheets: Array<Worksheet>;
  selectedWorksheet: Worksheet;
  reasonCode;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  tags: any[];
  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;
    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.tags
        : this.tags.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  };

  constructor(private userUtils: UserUtils,
              private pomService: POMService,
              private worksheetService: WorksheetService,
              private route: ActivatedRoute,
              private userService: UserService,
              private tagService: TagsService,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
    let worksheetId = this.route.snapshot.params['id'];
    this.userUtils.user().subscribe( user => {
      this.user = user;
      this.pomService.getOpen(user.currentCommunityId).subscribe( pom => {
        this.pom = pom.result;
        this.columnKeys = [
          this.pom.fy - 3,
          this.pom.fy -2,
          this.pom.fy - 1,
          this.pom.fy,
          this.pom.fy + 1,
          this.pom.fy + 2,
          this.pom.fy + 3,
          this.pom.fy + 4];
        this.worksheetService.getByPomId(pom.result.id).subscribe( worksheets => {
          this.worksheets = worksheets.result.filter(worksheet => !worksheet.locked);
          this.selectedWorksheet = this.worksheets.find(worksheet => worksheet.id === worksheetId);
          if (this.selectedWorksheet !== undefined) {
            this.onWorksheetSelected();
          }
        });
      });
    });
    this.initReasonCode();
  }

  initReasonCode(){
    this.tagService.tagAbbreviationsForReasonCode().then(tags => {
      this.tags = tags;
    });
  }

  update(final: boolean){
    let updateData: RowUpdateEventData [] = [];
    let modifiedRows: RowNode [] = this.worksheetComponent.agGrid.api.getSelectedNodes();
    if (modifiedRows.length === 0 && !final) {
      Notify.error('No changes detected.')
    } else {
      if(!this.reasonCode){
        Notify.error('You must select or create a reason code.')
      } else {
        this.worksheetComponent.agGrid.api.getSelectedNodes().forEach(node => {
          let modifiedRow : RowUpdateEventData = {};
          modifiedRow.notes = node.data.notes;
          modifiedRow.newFundingLine = node.data.fundingLine;
          modifiedRow.previousFundingLine = this.worksheetComponent.unmodifiedFundingLines.find(ufl =>
            ufl.fundingLine.id === node.data.fundingLine.id).fundingLine;
          modifiedRow.reasonCode = this.reasonCode;
          modifiedRow.worksheetId = this.selectedWorksheet.id;
          modifiedRow.programId = node.data.programId
          modifiedRow.fundingLineId = node.data.fundingLine.id;
          updateData.push(modifiedRow);

          node.data.modified = false;
          node.setSelected(false);
          node.data.notes = '';
        });
        this.reasonCode = null;
        this.worksheetComponent.agGrid.api.refreshCells();
        let body: WorksheetEvent = {rowUpdateEvents: updateData, worksheet: this.selectedWorksheet};
        this.worksheetService.updateRows(body).subscribe(response => {
          if (!response.error) {
            this.worksheetComponent.generateUnmodifiedFundingLines();
            this.initReasonCode();
            Notify.success('Worksheet updated successfully');
          } else {
            Notify.error('Something went wrong while trying to update the worksheet');
            console.log(response.error);
          }
        });
        if (final) {
          this.worksheets.forEach(worksheet => {
            this.worksheetService.update({...worksheet, locked: true}).toPromise();
          });
          this.worksheetService.update({...this.selectedWorksheet, isFinal: true, locked: true}).subscribe(response => {
            this.worksheetService.updateProgramRequests(this.selectedWorksheet.id).subscribe(response => {
              this.pomService.updatePomStatus(this.pom.id, Pom.StatusEnum.RECONCILIATION).subscribe(response => {
                this.selectedWorksheet.isFinal = true;
                Notify.success('Worksheet marked as final successfully')
              })
            });
          });
        }
      }
    }
  }

  applyBulkChange(){
    this.worksheetComponent.agGrid.api.forEachNodeAfterFilterAndSort((rowNode: RowNode) => {
      if (rowNode.rowIndex <= this.worksheetComponent.agGrid.api.getLastDisplayedRow()) {
        this.columnKeys.forEach(year => {
          let additionalAmount = 0;
          if (this.bulkType === 'percentage') {
            additionalAmount = rowNode.data.fundingLine.funds[year] * (this.bulkAmount / 100);
          } else {
            additionalAmount = this.bulkAmount;
          }
          rowNode.data.fundingLine.funds[year] = (isNaN(rowNode.data.fundingLine.funds[year])? 0 : rowNode.data.fundingLine.funds[year]) + additionalAmount;
          rowNode.data.modified = true;
          rowNode.setSelected(true);
          if (rowNode.data.fundingLine.funds[year] < 0) {
            rowNode.data.fundingLine.funds[year] = 0;
          }
        });
      }
    });

    this.worksheetComponent.topPinnedData.forEach(row => {
      this.columnKeys.forEach(year => {
        let additionalAmount = 0;
        if (this.bulkType === 'percentage') {
          additionalAmount = row.fundingLine.funds[year] * (this.bulkAmount / 100);
        } else {
          additionalAmount = this.bulkAmount;
        }
        row.fundingLine.funds[year] = (isNaN(row.fundingLine.funds[year])? 0 : row.fundingLine.funds[year]) + additionalAmount;
        row.modified = true;
        if (row.fundingLine.funds[year] < 0) {
          row.fundingLine.funds[year] = 0;
        }
      });
    });

    this.bulkAmount = null;
    this.worksheetComponent.agGrid.api.redrawRows();
    this.gridToaComponent.initToaDataRows();
  }

  onWorksheetSelected(){
    setTimeout(() => {
      this.worksheetComponent.initRowClass();

      this.worksheetComponent.initDataRows();
      this.worksheetComponent.generateColumns();

      this.gridToaComponent.initToaDataRows();
      this.gridToaComponent.generateToaColumns();

      this.eventsModalComponent.generateEventsColumns();
    });
    this.cd.detectChanges();
  }

  onFilterTextBoxChanged() {
    this.worksheetComponent.agGrid.gridOptions.api.setQuickFilter( this.filterText );
  }

  onGridReady(params) {
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    });
    window.addEventListener("resize", () => {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }
}
