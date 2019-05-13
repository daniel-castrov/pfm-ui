import {Injectable} from '@angular/core';
import {BES, BESService, PB, PBService} from '../generated';


@Injectable({
  providedIn: 'root'
})
export class ScenarioService {

  constructor( private besService: BESService,
               private pbService: PBService ) {}

  /**
   * returns a BES or PB, depending what the containerId is for
    * @param scenarioId
   */
  async scenario(scenarioId: string): Promise<PB | BES> {
    const bes: BES = (await this.besService.getById(scenarioId).toPromise()).result;
    if(bes) return bes;
    return (await this.pbService.getById(scenarioId).toPromise()).result;
  }

}
