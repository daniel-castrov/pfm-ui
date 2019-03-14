import {Component, Input} from '@angular/core';
import {ElevationService} from '../../../../services/elevation.component';
import {AppHeaderComponent} from "../../../header/app-header/app-header.component";

@Component({
  selector: 'j-elevation',
  templateUrl: './elevation.component.html',
  styleUrls: ['./elevation.component.scss']
})
export class ElevationComponent {

  @Input() header: AppHeaderComponent;

  constructor(private elevationService: ElevationService) {}

}
