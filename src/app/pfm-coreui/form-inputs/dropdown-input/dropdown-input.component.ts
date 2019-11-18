import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { DropdownWrapperComponent } from '../dropdown-wrapper/dropdown-wrapper.component';
import { ValidatedComponent } from '../../models/validated-component';

@Component({
  selector: 'pfm-dropdown-input',
  templateUrl: './dropdown-input.component.html',
  styleUrls: ['./dropdown-input.component.scss']
})
export class DropdownInputComponent implements OnInit, ValidatedComponent {

  @ViewChild(DropdownWrapperComponent, {static: false}) inputComponent: DropdownWrapperComponent;

  @Input() dataModel:any;
  @Input() id:string;
  @Input() fieldName:string;
  @Input() enabled:boolean = true;
  @Input() inputLabel:string;
  @Input() dropdownOptions:Array<any>;

  errorMessage: string;
  isValidFlag:boolean;

  constructor() { }

  ngOnInit() {
  }

  isValid(): boolean {

      this.isValidFlag = this.inputComponent.isValid();
      this.errorMessage = "";

      if(!this.dataModel[this.fieldName]){
          this.isValidFlag = false;
          this.errorMessage = "Please select an option from the dropdown"
      }


      return this.isValidFlag;
  }

}
