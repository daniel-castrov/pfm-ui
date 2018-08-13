import { Component, Input } from '@angular/core';
import { HeaderComponent } from '../../../header/header.component';
import { ElevationService } from '../../../../services/elevation.component';

@Component({
  selector: 'j-elevation',
  templateUrl: './elevation.component.html',
  styleUrls: ['./elevation.component.scss']
})
export class ElevationComponent {

  @Input() header: HeaderComponent;

  constructor(private elevationService: ElevationService) {}

}
