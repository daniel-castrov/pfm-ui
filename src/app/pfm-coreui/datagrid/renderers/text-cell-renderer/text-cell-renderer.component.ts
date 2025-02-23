import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { TextInputComponent } from '../../../form-inputs/text-input/text-input.component';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';

@Component({
  selector: 'text-cell-renderer',
  templateUrl: './text-cell-renderer.component.html',
  styleUrls: ['./text-cell-renderer.component.scss']
})
export class TextCellRendererComponent implements ICellEditorAngularComp, AfterViewInit {
  @ViewChild(TextInputComponent) input: TextInputComponent;
  params: any;
  value: string;
  id: string;

  agInit(params: any): void {
    this.params = params;
    this.value = this.params.value;
    this.id = 'TextCellRendererComponent' + this.params.rowIndex;
  }

  getValue(): any {
    return this.value;
  }

  ngAfterViewInit() {}
}
