enum Operation {
  DUPLICATE=1,RENAME,EXPORT,IMPORT
}

export class StateService {

  private static selectedRowIndex_: number;
  get selectedRowIndex() { return StateService.selectedRowIndex_; }
  set selectedRowIndex(selectedRowIndex: number) { StateService.selectedRowIndex_ = selectedRowIndex; }

  get Operation() { return Operation; } // allows Angular templates to use expressions like <button (click)="operation=Operation.DUPLICATE">

  private static operation_: Operation;
  get operation() { return StateService.operation_ }
  set operation(operation: Operation) { StateService.operation_ = operation; }

}
