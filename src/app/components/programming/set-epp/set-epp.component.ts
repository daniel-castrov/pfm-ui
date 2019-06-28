import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {AgGridNg2} from 'ag-grid-angular';
// Other Components
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EppService} from '../../../generated/api/epp.service';
import {UserUtils} from '../../../services/user.utils';
import { GridOptions } from 'ag-grid-community';

declare const $: any;

@Component({
  selector: 'set-epp',
  templateUrl: './set-epp.component.html',
  styleUrls: ['./set-epp.component.scss']
})

export class SetEppComponent implements OnInit {

  form: FormGroup;
  loading: boolean = false;
  fileName: string;
  responseError: string;
  data = [];
  communityId:string;
  menuTabs = ['filterMenuTab'];
  agOptions: GridOptions;

  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild("agGrid") private agGrid: AgGridNg2;

  constructor(private fb: FormBuilder,
              private eppService: EppService,
              private globalsSvc:UserUtils) {
    this.createForm();
    this.agOptions = <GridOptions>{
      defaultColDef: {
        sortable: true
      },    
      pagination: true,
      paginationPageSize: 15,
      suppressDragLeaveHidesColumns: true,
      suppressMovableColumns: true
    }
  }

  ngOnInit() {
    this.globalsSvc.user().subscribe( user => {
      this.communityId=user.currentCommunityId;
      this.eppService.getByCommunityId(this.communityId).subscribe(response => {
        if (!response.error) {
          this.data = response.result;
          this.generateFiscalYearColumns(this.data);
        } else {
          alert(response.error);
        }
      });
    });
  }

  onFileChange(event){
    let reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.controls['epp-input-file'].setValue(file);
        this.fileName = file.name;
      }
    }
  }

  onSubmit() {
    const formModel = this.prepareSave();
    this.loading = true;
    this.eppService.importFile(formModel.get('file')).subscribe(response => {
      if (!response.error) {
        this.data = response.result;
        this.generateFiscalYearColumns(this.data);
        this.agGrid.api.sizeColumnsToFit();
        $("#epp-modal").modal("hide");
      } else {
        this.responseError = response.error;
      }
      this.loading = false;
    });
  }

  clearFile() {
    this.fileName = '';
    this.responseError = '';
    this.fileInput.nativeElement.value = '';
    this.form.get('epp-input-file').setValue(null);
  }

  onPageSizeChanged(event) {
    var selectedValue = Number(event.target.value);
    this.agGrid.api.paginationSetPageSize(selectedValue);
    this.agGrid.api.sizeColumnsToFit();
  }

  private prepareSave(): any {
    let input = new FormData();
    input.append('name', this.fileName);
    input.append('file', this.form.get('epp-input-file').value);
    return input;
  }

  private createForm() {
    this.form = this.fb.group({
      'epp-input-file': ['', Validators.required]
    });
  }

  currencyFormatter(value) {
    if(isNaN(value.value)) {
      value.value = 0;
    }
    var usdFormate = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
    return usdFormate.format(value.value);
  }

  generateFundingLine(params){
    let result = params.data.appropriation !== null? params.data.appropriation : '';
    result = result.concat(params.data.blin !== null? ('/').concat(params.data.blin) : '');
    result = result.concat(params.data.item !== null? ('/').concat(params.data.item) : '');
    result = result.concat(params.data.opAgency !== null? ('/').concat(params.data.opAgency): '');
    return result;
  }

  getFiscalYear(params, year) {
      return params.data.fySums[year];
  }

  generateFiscalYearColumns(eppList) {
    if (eppList && eppList.length > 0) {
      let columnKeys = [];
      eppList.forEach(epp => {
        Object.keys(epp.fySums).forEach(year => {
          columnKeys.push(year);
          })
      });
      columnKeys.sort();
      Array.from(new Set(columnKeys)).forEach(key => {
        let columnKey = key.replace('20', 'FY')
        let colDef = {
          headerName: columnKey,
          maxWidth: 92,
          type: "numericColumn",
          filter: "agNumberColumnFilter",
          menuTabs: this.menuTabs,
          valueGetter: params => {return this.getFiscalYear(params, key)},
          valueFormatter: params => {return this.currencyFormatter(params)}
        };
        if(!this.exist(this.columnDefs, colDef)) {
          this.columnDefs.push(colDef);
        }
      });
      this.agGrid.api.setColumnDefs(this.columnDefs);
      this.agGrid.api.sizeColumnsToFit();
    }
  }

  private exist(arr, value) {
    for(var i = 0; i < arr.length; i++) {
      if (arr[i].headerName === value.headerName) {
        return true;
      }
    }
    return false;
  }

  columnDefs = [
    {headerName: 'Program', field: 'shortName', filter: 'agTextColumnFilter', menuTabs: this.menuTabs},
    {headerName: 'Funding Lines', filter: 'agTextColumnFilter', menuTabs: this.menuTabs, valueGetter: params => {return this.generateFundingLine(params)}}
  ];
}
