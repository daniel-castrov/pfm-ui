import { GlobalsService } from './../../../../services/globals.service';
import { Community } from './../../../../generated/model/community';
import { OnInit, Injectable } from '@angular/core';

@Injectable()
export class AutoValuesService {

    private currentCommunity: Community;
    constructor(private globalsService: GlobalsService) {}

    async programElement(ba: string, item: string): Promise<string> {
        const currentCommunity = await this.globalsService.currentCommunity();
        if(currentCommunity.abbreviation === 'CBDP') {
            if(ba === 'BA1') return '0601384BP';
            if(ba === 'BA2') return '0602384BP';
            if(ba === 'BA3') return '0603384BP';
            if(ba === 'BA4') return '0603884BP';
            if(ba === 'BA5') return '0604384BP';
            if(ba === 'BA6') {
                if(item === 'SB6') {
                    return '0605502BP';
                } else {
                    return '0605384BP';
                }
            }
            if(ba === 'BA7') return '0607384BP';
            return '0208384BP'; // for the rest of the BAs
        } else {
            return '';
        }
    }

}