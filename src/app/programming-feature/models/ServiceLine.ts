import { IntIntMap } from './IntIntMap';

export class ServiceLine {
  branch: string;
  contractor: string;
  unitCost: number;
  bulkOrigin: boolean;
  quantity: IntIntMap;
}
