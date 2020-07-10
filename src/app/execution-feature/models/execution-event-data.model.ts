import { ExecutionSubtype } from './execution-subtype.model';

export class ExecutionEventData {
  type: string; // equivalent of ExecutionSubtype
  fromId: string;
  fromIsSource: boolean;
  reason: string;
  toIdAmtLkp: { [key: string]: number };
  fileIds: string[];
  other: string;

  created?: any;
  modified?: any;
  modifiedBy?: string;
  createdBy?: string;
  typeInstance: ExecutionSubtype;

  constructor() {}

  static setuptypeInstance(executionEventData: ExecutionEventData): void {
    // ExecutionSubtype is class not an enum as in the backend so we recieve type as a string and use it as a
    // property to get the real type instance.
    executionEventData.typeInstance = ExecutionSubtype[executionEventData.type];
  }
}
