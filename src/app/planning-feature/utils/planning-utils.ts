import { PlanningPhase } from '../models/PlanningPhase';

export class PlanningUtils {

  private static MAX_YEAR_OPTIONS = 11;

  static processPlanningPhase(list: PlanningPhase[]): PlanningPhase[] {
    const defaults: PlanningPhase[] = this.getPlanningPhaseDefaults();
    for (const item of list) {
      const defaultItem = defaults.find(obj => obj.id === item.id);
      if (defaultItem) {
        defaults[defaults.indexOf(defaultItem)] = item;
      }
    }
    return defaults;
  }

  private static getPlanningPhaseDefaults() {
    const list: PlanningPhase[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const minimumYearOut = currentMonth > 0 ? 3 : 2;
    for (let i = today.getFullYear() + minimumYearOut, x = 0; x < this.MAX_YEAR_OPTIONS; i++, x++) {
      const p = new PlanningPhase();
      p.year = i;
      p.name = i + '';
      p.id = i + '_id';
      p.state = undefined;
      list.push(p);
    }
    return list;
  }

}
