import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ProgramsService, Program, ProgramFilter, UFR, UFRsService, POMService, MyDetailsService, Pom } from '../../../generated';
import { ViewEncapsulation } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../header/header.component';
import { Router, ActivatedRoute, ParamMap, Params, UrlSegment } from '@angular/router';

import { Status } from '../status.enum';
import { Disposition } from '../disposition.enum';

@Component({
  selector: 'app-ufr-view',
  templateUrl: './ufr-view.component.html',
  styleUrls: ['./ufr-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UfrViewComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  private current: UFR;
  private qtyok: boolean = false;
  private canedit: boolean = false;

  constructor(private usvc: UFRsService, private pomsvc: POMService,
    private usersvc:MyDetailsService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    var my: UfrViewComponent = this;
    this.route.url.subscribe((segments: UrlSegment[]) => {
      var ufrid = segments[segments.length - 1].path;
      console.log('ufrid: ' + ufrid);

      my.usvc.getUfrById(ufrid).subscribe(data => { 
        my.current = data.result;
        my.setQtyOk();
      });

      my.usersvc.getCurrentUser().subscribe(data => {
        my.canedit = false;
        my.pomsvc.getByCommunityId(data.result.currentCommunityId).subscribe(d2 => {
          d2.result.forEach( (pommy:Pom) => { 
            if ('CREATED' === pommy.status || 'OPEN' === pommy.status) {
              my.canedit = true;
            }
          });
        });
      });
    });
  }

  save() {
    var my: UfrViewComponent = this;
    if (my.current) {
      console.log(my.current);
      my.setQtyOk();
      my.usvc.update(my.current).subscribe();
    }
  }

  setQtyOk() {
    var my: UfrViewComponent = this;
    var ok: boolean = false;
    my.current.fundingLines.forEach(fl => {
      //console.log(fl);
      if ('PROC' === fl.appropriation) {
        ok = true;
      }
    });

    my.qtyok = ok;
    //console.log(my.qtyok);
  }

  submit() {
    console.log('submittal is not yet implemented');
  }
}
