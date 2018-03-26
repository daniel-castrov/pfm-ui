import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
  selector: 'app-program-export',
  templateUrl: './program-export.component.html',
  styleUrls: ['./program-export.component.scss']
})
export class ProgramExportComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  private startyear: number = 2018;
  constructor() { }

  ngOnInit() {
  }


  onExportClick() {
    var url = environment.apiUrl + '/programs/' + this.startyear + '/export';
    window.open( url );
  }
}
