import {Injectable} from "@angular/core";

export enum Operation {
  DUPLICATE=1,RENAME,EXPORT,IMPORT
}

@Injectable()
export class StateService {
    selectedRowIndex: number;

    operation: Operation;

}
