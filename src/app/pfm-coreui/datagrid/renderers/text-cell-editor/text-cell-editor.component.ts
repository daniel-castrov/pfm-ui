import { AfterViewInit, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { TextInputComponent } from '../../../form-inputs/text-input/text-input.component';

@Component({
  selector: 'text-cell-editor',
  templateUrl: './text-cell-editor.component.html',
  styleUrls: ['./text-cell-editor.component.scss']
})
export class TextCellEditorComponent implements ICellEditorAngularComp, AfterViewInit{
  @ViewChild(TextInputComponent, {static: false}) input: TextInputComponent;
  private params: any;
  public value: string;
  public id:string;


  onValueChanged(newValue:string):void{
    let p:any = {
      'params': this.params,
      'newValue': newValue
    };
    this.params.colDef.onCellValueChanged(p);
  }

  agInit(params: any): void {
    this.params = params;
    this.value = this.params.value;
    this.id = "TextCellEditorComponent_" + this.params.rowIndex;
    console.info('agInit: ' + this.params.rowIndex);
  }

  getValue(): any {
    return this.value;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.input.setFocus();
    })
  }
}