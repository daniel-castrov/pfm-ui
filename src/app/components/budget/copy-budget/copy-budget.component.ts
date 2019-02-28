import {Component, OnInit, ViewChild} from '@angular/core';
import {HeaderComponent} from '../../header/header.component';
import {CurrentPhase} from "../../../services/current-phase.service";
import {Appropriation, BES, BESService, Budget, PB, PBService} from "../../../generated";
import {join} from "../../../utils/join";
import {Notify} from "../../../utils/Notify";

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

  newName: string;
  modifyType: boolean;

  constructor( private currentPhase: CurrentPhase,
               private besService: BESService,
               private pbService: PBService ) {}

  async ngOnInit() {
    this.budget = await this.currentPhase.budget().toPromise();
    [this.beses, this.pbs] = await join( this.besService.getByBudget(this.budget.id),
                                         this.pbService .getByBudget(this.budget.id) ) as [BES[], PB[]];
    this.filterScenarios();
  }

  filterScenarios() {
    if(this.selectedType == 'BES') {
      this.filteredScenarios = this.beses.filter(bes => bes.appropriation === this.selectedAppropriation)
    } else {
      this.filteredScenarios = this.pbs.filter(pb => pb.appropriation === this.selectedAppropriation)
    }
    this.selectedScenario = this.filteredScenarios && this.filteredScenarios[0];
  }

  async copyBudget() {
    if(this.selectedType == 'BES' && this.modifyType || this.selectedType == 'PB') {
      await this.pbService.createFrom(this.selectedScenario.id, this.newName).toPromise();
    } else {
      await this.besService.createFrom(this.selectedScenario.id, this.newName).toPromise();
    }
    Notify.success('Scenario ' + this.newName + ' was created')
    this.ngOnInit();
  }
}
