import { TagsService } from '../../../../services/tags.service';
import { UserUtils } from '../../../../services/user.utils.service';
import { Injectable } from '@angular/core';
import { of } from 'rxjs/observable/of';


@Injectable()
export class AutoValuesService {

    constructor(private globalsService: UserUtils,
                private tagsService: TagsService) {}

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

    item(functionalArea: string, ba: string): string {
        if(['BA1','BA2','BA3','BA4','BA5','BA6','BA7'].includes(ba))
            return functionalArea + ba;
        else
            return '';
    }

    baOrBlins(appropriation: string): Promise<string[]> {
        if(appropriation === 'RDTE') return this.tagsService.tagAbbreviationsForBa();
        if(appropriation === 'PROC') return this.tagsService.tagAbbreviationsForBlin();
        return of([]).toPromise();
    }
}
