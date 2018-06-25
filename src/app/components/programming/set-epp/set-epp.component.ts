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
  data: any = [];
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

  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }

  currencyCellRenderer(value) {
    var usdFormate = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
    return usdFormate.format(value);
  }

  generateFundingLine(params){
    return params.data.appropriation + '/' + params.data.blin + '/' + params.data.item + '/' + params.data.opAgency;
  }

  getFiscalYear(params, year) {
    return this.currencyCellRenderer(params.data.fySums[year]);
  }

  columnDefs = [
    {headerName: 'Program', field: 'mrId' },
    {headerName: 'Funding Lines', valueGetter: params => {return this.generateFundingLine(params)}},
    {headerName: 'FY24', valueGetter: params => {return this.getFiscalYear(params, 2024)}},
    {headerName: 'FY25', valueGetter: params => {return this.getFiscalYear(params, 2025)}},
    {headerName: 'FY26', valueGetter: params => {return this.getFiscalYear(params, 2026)}},
    {headerName: 'FY27', valueGetter: params => {return this.getFiscalYear(params, 2027)}},
    {headerName: 'FY28', valueGetter: params => {return this.getFiscalYear(params, 2028)}},
    {headerName: 'FY29', valueGetter: params => {return this.getFiscalYear(params, 2029)}},
    {headerName: 'FY30', valueGetter: params => {return this.getFiscalYear(params, 2030)}},
    {headerName: 'FY31', valueGetter: params => {return this.getFiscalYear(params, 2031)}},
    {headerName: 'FY32', valueGetter: params => {return this.getFiscalYear(params, 2032)}}
  ];
}
