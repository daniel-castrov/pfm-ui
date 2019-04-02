import {Workspace} from "../../../../generated";
import {Injectable} from "@angular/core";

export enum Operation {
  DUPLICATE=1,RENAME,EXPORT,IMPORT,UNLOCK
}

@Injectable()
export class WorkspaceStateService {

  selectedRowIndex: number;
  Operation = Operation;
  operation: Operation;
  workspaces: Workspace[];

  get selectedWorkspace() {
    if(isNaN(this.selectedRowIndex)) {
      return null;
    } else {
      return this.workspaces[this.selectedRowIndex];
    }
  }

}
