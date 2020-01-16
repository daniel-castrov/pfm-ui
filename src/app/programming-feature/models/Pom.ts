import {TOA} from '../models/TOA';

export class Pom {
    created?: any;
    modified?: any;
    modifiedBy?: any;
    createdBy?: any;
    id?: any;
    fy: number;
    communityId: string;
    startdate: number;
    enddate?: any;
    status: string;
    workspaceId?: any;
    sourceId?: any;
    sourceType: string;
    communityToas: Array<TOA>;
    orgToas: { [key: string]: Array<TOA>; };
    constructor(){}
}
