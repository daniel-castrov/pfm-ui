import { Component } from '@angular/core';
import { AppModel } from '../../../../../../src/app/pfm-common-models/AppModel';

@Component({
  selector: 'pfm-plugin-create-planning',
  templateUrl: './create-planning.component.html'
})
export class CreatePlanningComponent {
  constructor(public appModel: AppModel) {}
}
