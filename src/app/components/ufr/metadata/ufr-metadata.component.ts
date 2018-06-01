import { Component, OnInit, Input } from '@angular/core';
import { Program, ProgramsService, Tag } from '../../../generated';
import { forkJoin } from "rxjs/observable/forkJoin";

import { UFR } from '../../../generated/model/uFR'

@Component({
  selector: 'ufr-metadata',
  templateUrl: './ufr-metadata.component.html',
  styleUrls: ['./ufr-metadata.component.scss']
})
export class UfrMetadataComponent implements OnInit {
  @Input() current: UFR;
  private tagnames: Map<string, Map<string,string>>;

  constructor(private progsvc: ProgramsService) { }

  ngOnInit() {
    var my: UfrMetadataComponent = this;
    this.progsvc.getSearchTags().subscribe(tagtypes => { 
      var calls: any[] = [];
      tagtypes.result.forEach(tagtype => { 
        calls.push(my.progsvc.getTagsByType(tagtype));
      });

      forkJoin(calls).subscribe(data => {
        var tagmap = new Map<string, Map<string, string>>();

        tagtypes.result.forEach((tagtype, idx) => {
          tagmap.set(tagtype, new Map<string, string>());
          data[idx]['result'].forEach( (x: Tag) => { 
            tagmap.get(tagtype).set(x.abbr, x.name);
          });
        });

        my.tagnames = tagmap;
        console.log(my.tagnames);
      });

      console.log(my.current);
    });
  }

}