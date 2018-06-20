import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'set-epp',
  templateUrl: './set-epp.component.html',
  styleUrls: ['./set-epp.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SetEppComponent implements OnInit {

  form: FormGroup;
  loading: boolean = false;
  fileName: String;

  @ViewChild(HeaderComponent) header;
  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  ngOnInit() {
    //TODO: initialize the existing EPP data
  }

  onFileChange(event){
    let reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.controls['epp-input-file'].setValue(file.name); 
        this.fileName = file.name
      };
    }
  }

  onSubmit() {
    const formModel = this.form.value;
    this.loading = true;
    
    //TODO: send the file to the server and set loading to false

    this.clearFile() //TODO: don't clear if it fails
  }

  //TODO: capture hidden event from the modal

  private createForm() {
    this.form = this.fb.group({
      'epp-input-file': ['', Validators.required]
    });
  }

  private clearFile() {
    this.fileName = ''
    this.fileInput.nativeElement.value = '';
  }
}
