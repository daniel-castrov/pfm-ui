import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamLeadService } from './team-lead.service';

@Injectable({
  providedIn: 'root'
})
export class TeamLeadServiceImpl extends TeamLeadService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getByProgram(programId: string): Observable<object> {
    return this.get('teamLead/programId/' + programId);
  }

  createTeamLead(data: any): Observable<object> {
    return this.post('teamLead', data);
  }

  updateTeamLead(data: any): Observable<object> {
    return this.put('teamLead', data);
  }

  deleteTeamLead(id: any): Observable<object> {
    return this.delete('teamLead/' + id);
  }
}
