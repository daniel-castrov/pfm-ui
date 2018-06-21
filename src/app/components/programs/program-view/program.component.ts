import { Component, OnInit, Input } from '@angular/core';
import { Program, ProgramsService, Tag } from '../../../generated';

@Component({
  selector: 'program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.scss']
})
export class ProgramComponent implements OnInit {
  @Input() current: Program;
  @Input() startyear: number;

  private tagnames: Map<string, Map<string,string>> = new Map<string, Map<string,string>>();

  constructor(private progsvc: ProgramsService) {
  }

  ngOnInit() {
    var my: ProgramComponent = this;
    this.progsvc.getTags().subscribe(tagtypes => { 
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
