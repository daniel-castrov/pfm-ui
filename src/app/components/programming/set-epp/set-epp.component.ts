import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import {AgGridNg2} from 'ag-grid-angular';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { EppService } from '../../../generated/api/epp.service';
declare const $: any;

@Component({
  selector: 'set-epp',
  templateUrl: './set-epp.component.html',
  styleUrls: ['./set-epp.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SetEppComponent implements OnInit {

  form: FormGroup;
  loading: boolean = false;
  fileName: string;
  responseError: string;
  data = [];
  currentPage: number;
  totalPages: number;

  @ViewChild(HeaderComponent) header;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild("agGrid") private agGrid: AgGridNg2;

  constructor(private fb: FormBuilder,
              private eppService: EppService) {
    this.createForm();
  }

  ngOnInit() {
    this.eppService.getAll().subscribe(response => {
      if (!response.error) {
        this.data = response.result;
        this.generateFiscalYearColumns(this.data);
      } else {
        alert(response.error);
      }
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
    this.eppService.importFile(formModel.get('name'), formModel.get('file')).subscribe(response => {
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

  onBtFirst() {
    this.agGrid.api.paginationGoToFirstPage();
  }

  onBtLast() {
    this.agGrid.api.paginationGoToLastPage();
  }

  onBtNext() {
    this.agGrid.api.paginationGoToNextPage();
  }

  onBtPrevious() {
    this.agGrid.api.paginationGoToPreviousPage();
  }

  onPaginationChanged() {
    if (this.agGrid.api) {
      this.currentPage = this.agGrid.api.paginationGetCurrentPage() + 1;
      this.totalPages = this.agGrid.api.paginationGetTotalPages();
    }
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

  currencyCellRenderer(value) {
    var usdFormate = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
    return usdFormate.format(value);
  }

  generateFundingLine(params){
    let result = params.data.appropriation !== null? params.data.appropriation : '';
    result = result.concat(params.data.blin !== null? ('/').concat(params.data.blin) : '');
    result = result.concat(params.data.item !== null? ('/').concat(params.data.item) : '');
    result = result.concat(params.data.opAgency !== null? ('/').concat(params.data.opAgency): '');
    return result;
  }

  getFiscalYear(params, year) {
    return this.currencyCellRenderer(params.data.fySums[year]);
  }

  generateFiscalYearColumns(data) {
    if (data && data.length > 0) {
      let keys = Object.keys(data[0].fySums);
      keys.forEach(key => {
        let columnKey = key.replace('20', 'FY')
        let colDef = {
          headerName: columnKey,
          maxWidth: 92,
          type: "numericColumn",
          valueGetter: params => {return this.getFiscalYear(params, key)}
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
    {headerName: 'Program', field: 'programShortName' },
    {headerName: 'Funding Lines', valueGetter: params => {return this.generateFundingLine(params)}}
  ];
}
