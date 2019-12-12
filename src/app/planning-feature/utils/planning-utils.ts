import { PlanningPhase } from '../models/PlanningPhase';

export class PlanningUtils {

    private static currentFiscalYear:number = 2019;
    private static maxYearsOut:number = 10;

    public static processPlanningPhase(list:PlanningPhase[]):PlanningPhase[]{

      //get a list of defaults
      let defaults:PlanningPhase[] = this.getPlanningPhaseDefaults();

      //replace defaults with values from service (passed in) if they exist
      for(let i=0; i<list.length; i++){
        let item = list[i];
        let defaultItem = defaults.find( obj => obj.id == item.id);
        if(defaultItem){
          defaults[defaults.indexOf(defaultItem)] = item;
        }
      }

      return defaults;
    }

    private static getPlanningPhaseDefaults():PlanningPhase[]{
      let list:PlanningPhase[] = [];
      for(let i=this.currentFiscalYear; i<this.currentFiscalYear + this.maxYearsOut; i++){
        let p:PlanningPhase = new PlanningPhase();
        p.year = i;
        p.name = i + "";
        p.id = i + "_id";
        p.state = undefined;
        list.push(p);
      }

      return list;
    }
}