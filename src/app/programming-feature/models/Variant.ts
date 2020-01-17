import { ServiceLine } from './serviceLine';

export class Variant {
    shortName: string;
    number: number;
    bulkOrigin: boolean;
    serviceLines: Array<ServiceLine>;
}
