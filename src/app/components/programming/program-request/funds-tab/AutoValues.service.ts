import { TagsUtils } from '../../../../services/tags-utils.service';
import { UserUtils } from '../../../../services/user.utils';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AutoValuesService {

    constructor(private globalsService: UserUtils,
                private tagsUtils: TagsUtils) {}

    async programElement(ba: string, item: string): Promise<string> {
        const currentCommunity = await this.globalsService.currentCommunity().toPromise();
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

    item(functionalArea: string, ba: string): string {
        if(['BA1','BA2','BA3','BA4','BA5','BA6','BA7'].includes(ba))
            return functionalArea + ba;
        else
            return '';
    }

    baOrBlins(appropriation: string): Promise<string[]> {
        if(appropriation === 'RDT&E') return this.tagsUtils.tagAbbreviationsForBa();
        if(appropriation === 'PROC') return this.tagsUtils.tagAbbreviationsForBlin();
        return of([]).toPromise();
    }
}
