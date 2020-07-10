import { ExecutionSubtype } from './execution-subtype.model';

export class ExecutionEventData {
  type: string; // equivalent of ExecutionSubtype
  fromId: string;
  fromIsSource: boolean;
  reason: string;
  toIdAmtLkp: { [key: string]: number };
  fileIds: string[];
  other: string;

  typeInstance: ExecutionSubtype;
  constructor() {
    // ExecutionSubtype is class not an enum as in the backend so we recieve type as a string and use it as a
    // property to get the real type instance.
    this.typeInstance = ExecutionSubtype[this.type];
  }
}
