import { Component, OnInit, ViewChild, Input, ElementRef, Renderer } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import * as $ from 'jquery';

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
  loading: boolean = false
  fileName: string
  responseError: string

  @ViewChild(HeaderComponent) header
  @ViewChild('fileInput') fileInput: ElementRef


  constructor(private fb: FormBuilder,
     private eppService: EppService) {
    this.createForm();
  }

  ngOnInit() {
    //TODO: initialize the existing EPP data
  }

  onFileChange(event){
    let reader = new FileReader()
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.controls['epp-input-file'].setValue(file); 
        this.fileName = file.name
      };
    }
  }

  onSubmit() {
    const formModel = this.prepareSave();
    this.loading = true;
    this.eppService.importFile(formModel.get('name'), formModel.get('file')).subscribe(response => {  
      if (!response.error) {
        $("#epp-modal").modal("hide");
        //TODO: update EPP table
      } else {
        this.responseError = response.error
      }
      this.loading = false
    });
  }
  
  clearFile() {
    this.fileName = ''
    this.responseError = ''
    this.fileInput.nativeElement.value = '';
    this.form.get('epp-input-file').setValue(null);
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
}
