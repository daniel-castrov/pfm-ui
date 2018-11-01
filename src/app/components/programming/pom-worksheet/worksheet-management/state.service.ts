import {Worksheet} from "../../../../generated";
import {Injectable} from "@angular/core";

export enum Operation {
  DUPLICATE=1,RENAME,EXPORT,IMPORT,UNLOCK
}

@Injectable()
export class StateService {

  selectedRowIndex: number;
  Operation = Operation;
  operation: Operation;
  worksheets: Worksheet[];

  get selectedWorksheet() {
    if(isNaN(this.selectedRowIndex)) {
      return null;
    } else {
      return this.worksheets[this.selectedRowIndex];
    }
  }

}
