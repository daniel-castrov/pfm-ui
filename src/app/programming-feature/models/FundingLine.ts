import {Variant} from './Variant';
import {IntIntMap} from './IntIntMap';

export class FundingLine {
    created: any;
    createdBy: string;
    modified: any;
    modifiedBy: string;

    emphases: Array<string>;

    id: string;
    appropriation: string;
    baOrBlin: string;
    opAgency: string;
    item: string;
    programElement: string;
    acquisitionType: string;
    userCreated: boolean;
    funds: IntIntMap;
    variants: Array<Variant>;

    constructor() {
    }
}
