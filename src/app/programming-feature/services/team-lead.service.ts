import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export abstract class TeamLeadService extends BaseRestService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  abstract getByProgram(programId: string): Observable<object>;
  abstract createTeamLead(data: any): Observable<object>;
  abstract updateTeamLead(data: any): Observable<object>;
  abstract deleteTeamLead(id: any): Observable<object>;
}
