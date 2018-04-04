import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { ProgramsService } from '../../../generated/api/programs.service';
import { RestResult } from '../../../generated/model/restResult';

@Component({
  selector: 'app-program-export',
  templateUrl: './program-export.component.html',
  styleUrls: ['./program-export.component.scss']
})
export class ProgramExportComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  private startyear: number = 2018;
  private years: number[] = [];

  constructor(private programs: ProgramsService) {
    var my: ProgramExportComponent = this;
    programs.getExportYears().subscribe((data: RestResult) => {
      my.years = data.result.sort();
      my.startyear = my.years[my.years.length - 1];
    });
  }

  ngOnInit() {

  }


  onExportClick() {
    var url = environment.apiUrl + '/programs/' + this.startyear + '/export';
    window.open( url );
  }
}
