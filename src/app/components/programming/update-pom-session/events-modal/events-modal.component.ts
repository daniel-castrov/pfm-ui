import {Component, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import {Pom, RowUpdateEvent, User, UserService, WorksheetService} from "../../../../generated";
import {FormatterUtil} from "../../../../utils/formatterUtil";
import {AgGridNg2} from "ag-grid-angular";
import {Notify} from "../../../../utils/Notify";
import {ValueChangeRenderer} from "../../../renderers/value-change-renderer/value-change-renderer.component";
import {ViewEventsRenderer} from "../../../renderers/view-events-renderer/view-events-renderer.component";
import {CheckboxCellRenderer} from "../../../renderers/anchor-checkbox-renderer/checkbox-cell-renderer.component";

declare const $: any;

@Component({
  selector: 'events-modal',
  templateUrl: './events-modal.component.html',
  styleUrls: ['./events-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EventsModalComponent {

  @ViewChild("agGridEvents") agGridEvents: AgGridNg2;

  @Input() pom: Pom;
  @Input() selectedWorksheet;
  eventsColumnDefs;
  detailCellRendererParams;
  @Input() columnKeys;
  eventsRowData;
  frameworkComponents = {
    valueChangeRenderer: ValueChangeRenderer,
    viewEventsRenderer: ViewEventsRenderer,
    checkboxCellRenderer: CheckboxCellRenderer};
  context = { parentComponent: this };

  constructor( private worksheetService: WorksheetService,
               private userService: UserService ) {}


  async viewEvents(params){
    let data: Array<any> = [];
    let worksheetRowEvents : RowUpdateEvent[] = (await this.worksheetService.getWorksheetRowEvents(
      this.selectedWorksheet.id, params.data.fundingLine.id).toPromise()).result;

    for(let wre of worksheetRowEvents) {
      let user = (await this.userService.getByCn(wre.userCN).toPromise()).result;
      let date = new Date(wre.timestamp.year, wre.timestamp.monthValue-1, wre.timestamp.dayOfMonth);
      let dataRow = {
        date: date,
        user: user.firstName + ' ' + user.lastName,
        reasonCode: wre.value.reasonCode,
        notes: wre.value.notes,
        programId: wre.value.programId,
        previousFundingLine: wre.value.previousFundingLine,
        newFundingLine: wre.value.newFundingLine
      };
      data.push(dataRow);
    }
    if(data.length > 0){
      this.eventsRowData = data;
      this.agGridEvents.api.sizeColumnsToFit();
      $('#events-modal').modal('show');
    } else {
      Notify.info('There are no transactions registered for this funding line')
    }
  }

  generateEventsColumns(){
    this.eventsColumnDefs = [
      {
        headerName: 'Reason Code',
        field: 'reasonCode',
        cellRenderer: 'agGroupCellRenderer',
        maxWidth: 200,
        minWidth: 200
      },
      {
        headerName: 'Notes',
        field: 'notes',
        tooltipField: 'notes'
      },
      {
        headerName: 'User',
        field: 'user',
        maxWidth: 125,
        minWidth: 125
      },
      {
        headerName: 'Date',
        filter: 'agDateColumnFilter',
        field: 'date',
        valueFormatter: params => FormatterUtil.dateFormatter(params),
        maxWidth: 200,
        minWidth: 200
      }
    ];

    let detailColumnDefs: any[] = [
      {
        headerName: 'Program ID',
        field: 'programId'
      }];
    this.columnKeys.forEach(key => {
      if (key >= this.pom.fy) {
        let columnKey = key.toString().replace('20', 'FY')
        let colDef = {
          headerName: columnKey,
          colId: key,
          suppressToolPanel: true,
          cellRenderer: 'valueChangeRenderer',
          cellClass: ['funding-line-default']
        };
        detailColumnDefs.push(colDef);
      }
    });

    this.detailCellRendererParams = {
      detailGridOptions: {
        columnDefs: detailColumnDefs,
        frameworkComponents: this.frameworkComponents,
        context: this.context,
        gridAutoHeight: true,
        toolPanelSuppressSideButtons: true,
        onGridReady(params) {
          params.api.sizeColumnsToFit();
        }
      },
      getDetailRowData: function(params) {
        let data = [{programId: params.data.programId,
          newFundingLine: params.data.newFundingLine,
          previousFundingLine: params.data.previousFundingLine}];
        params.successCallback(data);
      }
    };
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
