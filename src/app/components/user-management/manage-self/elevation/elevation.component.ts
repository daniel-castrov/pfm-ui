import { Component, Input } from '@angular/core';
import { JHeaderComponent } from '../../../header/j-header/j-header.component';
import { ElevationService } from '../../../../services/elevation.component';

@Component({
  selector: 'j-elevation',
  templateUrl: './elevation.component.html',
  styleUrls: ['./elevation.component.scss']
})
export class ElevationComponent {

  @Input() header: JHeaderComponent;

  constructor(private elevationService: ElevationService) {}

}
