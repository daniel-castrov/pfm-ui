import { ServiceLine } from './ServiceLine';

export class Variant {
  shortName: string;
  number: number;
  bulkOrigin: boolean;
  serviceLines: Array<ServiceLine>;
}
