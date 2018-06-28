import { Component, OnInit, ViewChild } from '@angular/core'
import * as $ from 'jquery'

// Other Components
import { HeaderComponent } from '../../../components/header/header.component'
import { Router } from '@angular/router'
import { ExecutionService, Execution, MyDetailsService, Program, ExecutionLine } from '../../../generated'
import { GlobalsService} from '../../../services/globals.service'
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ProgramsService } from '../../../generated/api/programs.service';


declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'funds-update',
  templateUrl: './funds-update.component.html',
  styleUrls: ['./funds-update.component.scss']
})

export class FundsUpdateComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  private exephases: Execution[];
  private selectedexe: Execution;
  private allexelines: ExecutionLine[] = [];
  private filteredexelines: ExecutionLine[] = [];
  private programs: Map<string, string>=new Map<string,string>();
  private appropriations: string[] = [];
  private blins: string[] = [];
  private items: string[] = [];
  private opAgencies: string[] = [];

  private mrid: string;
  private appropriation: string;
  private blin: string;
  private item: string;
  private opAgency: string;

  constructor(private exesvc: ExecutionService, private usersvc: MyDetailsService,
    private progsvc: ProgramsService) { 
  }

  ngOnInit() {
    var my: FundsUpdateComponent = this;
    my.usersvc.getCurrentUser().subscribe(deets => { 
      forkJoin([
        my.progsvc.getIdNameMap(),
        //my.exesvc.getByCommunity(deets.result.currentCommunityId, 'OPEN'),
        my.exesvc.getByCommunity(deets.result.currentCommunityId, 'CREATED')
      ]).subscribe(data => { 
        var lookup: {id:string, name:string}[] = [];
        Object.getOwnPropertyNames(data[0].result).forEach(mrid => { 
          lookup.push( {id:mrid, name: data[0].result[mrid]})
        });

        lookup.sort((a, b) => { 
          if (a.name === b.name) {
            return 0;
          }
          return (a.name < b.name ? -1 : 1);
        });

        for (var i = 0; i < lookup.length; i++ ){
          my.programs.set(lookup[i].id, lookup[i].name);
        }

        my.exephases = data[1].result;
        my.selectedexe = my.exephases[0];
        my.fetchLines();
        my.filteredexelines = my.allexelines;
      });
    });
  }

  fetchLines() {
    var my: FundsUpdateComponent = this;

    my.exesvc.getExecutionLinesByPhase(my.selectedexe.id).subscribe(data => { 
      var apprset: Set<string> = new Set<string>();
      var itemset: Set<string> = new Set<string>();
      var blinset: Set<string> = new Set<string>();
      var agencyset: Set<string> = new Set<string>();

      data.result.forEach((x:ExecutionLine) => { 
        if (x.appropriation) {
          apprset.add(x.appropriation.trim());
        }
        if (x.item) {
          itemset.add(x.item.trim());
        }
        if (x.blin) {
          blinset.add(x.blin.trim());
        }
        if (x.opAgency ){
          agencyset.add(x.opAgency.trim());
        }

        my.allexelines.push(x);
      });

      apprset.forEach(s => { 
        my.appropriations.push(s);
      });
      itemset.forEach(s => {
        my.items.push(s);
      });
      blinset.forEach(s => {
        my.blins.push(s);
      });
      agencyset.forEach(s => {
        my.opAgencies.push(s);
      });

      my.appropriations.sort();
      my.items.sort();
      my.blins.sort();
      my.opAgencies.sort();      
    });
  }

  filter() {
    // filter our existing data based on the various dropdowns
    var my: FundsUpdateComponent = this;
    my.filteredexelines = my.allexelines
      .filter(x => (my.mrid ? x.mrId === my.mrid : true))
      .filter(x => (my.appropriation ? x.appropriation === my.appropriation : true))
      .filter(x => (my.blin ? x.blin === my.blin : true))
      .filter(x => (my.item ? x.item === my.item : true))
      .filter(x => (my.opAgency ? x.opAgency === my.opAgency : true));
    console.log(my.allexelines);
    console.log(my.filteredexelines);
  }
}
