import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProcessPrioritizationService } from './process-prioritization.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessPrioritizationServiceImpl extends ProcessPrioritizationService {

  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getByProgram(programId: string): Observable<object> {
    return this.get('processPrioritization/programId/' + programId);
  }

  createProcessPrioritization(data: any): Observable<object> {
    return this.post('processPrioritization', data);
  }

  updateProcessPrioritization(data: any): Observable<object> {
    return this.put('processPrioritization', data);
  }

  deleteProcessPrioritization(id: any): Observable<object> {
    return this.delete('processPrioritization/' + id);
  }

}
