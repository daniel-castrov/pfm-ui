import {Component, ViewChild} from '@angular/core';
import {Selection} from './program-selector/program-and-item-selector.component';
import {
  BPI, RdteProgramData, RdteProgramDataService, RolesPermissionsService
} from '../../../generated';
import {Notify} from '../../../utils/Notify';
import { R4aTabComponent } from './r4a-tab/r4a-tab.component';
import {RdteProgramContextService} from './rdte-program-context.service';
import {R3TabComponent} from './r3-tab/r3-tab.component';
import {R2aTabComponentOnProgramDetails} from './r2a-tab/r2a-tab-component-on-program-details.component';

@Component({
  selector: 'edit-program-details',
  templateUrl: './edit-program-details.component.html',
  styleUrls: ['./edit-program-details.component.scss']
})
export class EditProgramDetailsComponent {

  @ViewChild(R4aTabComponent) r4aTabComponent: R4aTabComponent;
  @ViewChild(R3TabComponent) r3TabComponent: R3TabComponent;
  @ViewChild(R2aTabComponentOnProgramDetails) r2aTabComponent: R2aTabComponentOnProgramDetails;

  userRoles: any[];
  hasPermissions: boolean;
  scenarioId: string;
  rdteProgramData: RdteProgramData;
  bpi: BPI;

  constructor( private rdteProgramDataService: RdteProgramDataService,
               private rdteProgramContextService: RdteProgramContextService,
               private roleService: RolesPermissionsService) {}

  async onItemSelected(selection: Selection) {
    // Unfortunately, the score of the `await` in the `try{}` block is limited to the `try{}` block.
    // This following complicated code ensures that `rdteProgramDataService.getByProgramId(..)` is
    // executed before the code after the `await new Promise(...)`.
    await new Promise( async (resolve) => {
      try {
        this.rdteProgramData = null;
        this.rdteProgramData = (await this.rdteProgramDataService.getByProgramId(selection.program.id).toPromise()).result;
      } catch (e) {
      }
      resolve();
    });
    if (!this.rdteProgramData) {
      this.rdteProgramData = {};
      this.rdteProgramData.programId = selection.program.id;
      this.rdteProgramData.bpis = [];
    }

    this.bpi = this.rdteProgramData.bpis.find(r2AData => r2AData.pe === selection.pe &&
                                                      r2AData.item === selection.item );
    if(!this.bpi) {
      this.bpi  = {};
      this.bpi.ba = selection.ba;
      this.bpi.pe = selection.pe;
      this.bpi.item = selection.item;
      this.bpi.r2AData = {};
      this.bpi.r3Data = {};
      this.bpi.r4Data = [];
      this.rdteProgramData.bpis.push(this.bpi);
    }

    this.rdteProgramContextService.init(this.scenarioId, selection.program, selection.ba, selection.pe, selection.item);

    this.roleService.getRoles().subscribe(data => {
      this.userRoles = data.result;
      this.hasPermissions = this.userRoles.includes('Budget_Manager') ||
        (this.userRoles.includes('Program_Manager') && !this.rdteProgramData.submitted );
    });
  }

  onItemUnselected() {
    this.rdteProgramData = null;
    this.bpi = null;
    this.rdteProgramContextService.reset();
  }

  async onSave() {
    this.rdteProgramData.submitted = false;

    if ( this.rdteProgramData.id ) {
      await this.rdteProgramDataService.update( this.rdteProgramData ).toPromise();
    } else {
      await this.rdteProgramDataService.create( this.rdteProgramData ).toPromise();
    }
    Notify.success( 'Program Details saved successfully' );
  }

  async onSubmit() {
    const tabs = [
      {tabName: 'R-2A', invalid: this.r2aTabComponent.invalid()}];
    if (this.containsR4Data()) {
      tabs.push({tabName: 'R-4A', invalid: this.r4aTabComponent.invalid()});
    }
    if ( this.containsR3Data()){
      tabs.push({tabName: 'R-3', invalid: this.r3TabComponent.invalid()});
    }
    const invalidTabs = tabs.filter(tab => tab.invalid);
    if (invalidTabs.length === 0) {
      this.rdteProgramData.submitted = true;
      if (this.rdteProgramData.id) {
        await this.rdteProgramDataService.update(this.rdteProgramData).toPromise();
      } else {
        await this.rdteProgramDataService.create(this.rdteProgramData).toPromise();
      }
      this.hasPermissions = this.userRoles.includes('Budget_Manager') ||
        (this.userRoles.includes('Program_Manager') && !this.rdteProgramData.submitted);
      Notify.success('Program Details submitted successfully');
    } else {
      Notify.error('The following tabs contain errors or unfilled required fields: ' +
        invalidTabs.map(tab => tab.tabName).join(', '));
    }
  }

  containsR3Data(): boolean {
    return ['BA1', 'BA2', 'BA3', 'BA6'].includes(this.rdteProgramContextService.ba().toUpperCase()) ? false : true;
  }

  containsR4Data(): boolean {
    return ['BA4', 'BA5', 'BA7'].includes(this.rdteProgramContextService.ba().toUpperCase()) ? true : false;
  }

}
