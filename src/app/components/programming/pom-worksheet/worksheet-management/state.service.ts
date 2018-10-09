import {Worksheet} from "../../../../generated";

enum Operation {
  DUPLICATE=1,RENAME,EXPORT,IMPORT
}

export class StateService {

  private static selectedRowIndex_: number;
  get selectedRowIndex() { return StateService.selectedRowIndex_; }
  set selectedRowIndex(selectedRowIndex: number) {
    StateService.selectedRowIndex_ = selectedRowIndex;
    if(isNaN(this.selectedRowIndex)) {
      StateService.selectedWorksheet_ = null;
    } else {
      StateService.selectedWorksheet_ = StateService.worksheets[selectedRowIndex];
    }
  }

  get Operation() { return Operation; } // allows Angular templates to use expressions like <button (click)="operation=Operation.DUPLICATE">

  private static operation_: Operation;
  get operation() { return StateService.operation_ }
  set operation(operation: Operation) { StateService.operation_ = operation; }

  static worksheets: Worksheet[];

  private static selectedWorksheet_: Worksheet;
  get selectedWorksheet() {
    return StateService.selectedWorksheet_;
  }

}
