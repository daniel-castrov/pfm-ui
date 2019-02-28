import {Component, OnInit, ViewChild} from '@angular/core';
import {HeaderComponent} from '../../header/header.component';
import {CurrentPhase} from "../../../services/current-phase.service";
import {Appropriation, BES, BESService, Budget, PB, PBService} from "../../../generated";
import {join} from "../../../utils/join";
import {Notify} from "../../../utils/Notify";
import {AbstractControl, FormControl, ValidationErrors, Validators} from "@angular/forms";

@Component({
  selector: 'copy-budget',
  templateUrl: './copy-budget.component.html',
  styleUrls: ['./copy-budget.component.scss']
})
export class CopyBudgetComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  budget: Budget;
  beses: BES[];
  pbs: PB[];
  filteredScenarios: BES[] | PB[];
  selectedType: 'BES' | 'PB' = 'BES';
  selectedAppropriation = Appropriation.PROC;
  selectedScenario: BES | PB;
  Appropriation = Appropriation;

  newName = new FormControl('', [Validators.required, this.validNewName.bind(this)]);
  modifyType = false;

  constructor( private currentPhase: CurrentPhase,
               private besService: BESService,
               private pbService: PBService ) {}

  async ngOnInit() {
    this.newName.reset();
    this.budget = await this.currentPhase.budget().toPromise();
    [this.beses, this.pbs] = await join( this.besService.getByBudget(this.budget.id),
                                         this.pbService .getByBudget(this.budget.id) ) as [BES[], PB[]];
    this.filterScenarios();
  }

  filterScenarios() {
    this.newName.reset();
    if(this.selectedType == 'BES') {
      this.filteredScenarios = this.beses.filter(bes => bes.appropriation === this.selectedAppropriation)
    } else {
      this.filteredScenarios = this.pbs.filter(pb => pb.appropriation === this.selectedAppropriation)
    }
    this.selectedScenario = this.filteredScenarios && this.filteredScenarios[0];
  }

  async copyBudget() {
    if(this.selectedType == 'BES' && this.modifyType || this.selectedType == 'PB') {
      await this.pbService.createFrom(this.selectedScenario.id, this.newName.value).toPromise();
    } else {
      await this.besService.createFrom(this.selectedScenario.id, this.newName.value).toPromise();
    }
    Notify.success('Scenario ' + this.newName + ' was created')
    this.ngOnInit();
  }

  private validNewName(control: AbstractControl): ValidationErrors | null {
    if(!this.beses || !this.pbs) return null; // if ngOnInit(...) has not been called yet there cannot be any validation

    if(this.selectedType == 'BES' && this.modifyType || this.selectedType == 'PB') {
      if (this.pbs.find(pb => pb.name === this.newName.value)) return {alreadyExists: true};
    } else {
      if (this.beses.find(bes => bes.name === this.newName.value)) return {alreadyExists: true};
    }
    return null;
  }

  onModifyType() {
    this.newName.updateValueAndValidity();
  }
}
