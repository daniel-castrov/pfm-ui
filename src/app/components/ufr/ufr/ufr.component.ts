import { Component, OnInit, Input } from '@angular/core';
import { Program, ProgramsService, Tag } from '../../../generated';

import { UFR } from '../../../generated/model/uFR'

@Component({
  selector: 'ufr-progmetas',
  templateUrl: './ufr.component.html',
  styleUrls: ['./ufr.component.scss']
})
export class UfrComponent implements OnInit {
  @Input() current: UFR;
  private tagnames: Map<string, Map<string,string>> = new Map<string, Map<string,string>>();

  constructor(private progsvc: ProgramsService) { }

  ngOnInit() {
    var my: UfrComponent = this;
    this.progsvc.getSearchTags().subscribe(tagtypes => { 
      tagtypes.result.forEach(function (tagtype: string) {
        
        var map: Map<string, string> = new Map<string, string>();
        my.progsvc.getTagsByType(tagtype).subscribe(data => {
          data.result.forEach(function (x: Tag) {
            map.set(x.abbr, x.name);
          });
        });

        my.tagnames.set(tagtype, map);
      });
    });
  }

}
