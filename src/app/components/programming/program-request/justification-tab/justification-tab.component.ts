import {Component, Input} from '@angular/core';
import {ProgrammaticRequest, POMService, Pom} from "../../../../generated";

@Component({
  selector: 'justification-tab',
  templateUrl: './justification-tab.component.html',
  styleUrls: ['./justification-tab.component.scss']
})
export class JustificationTabComponent {
  private _pr: ProgrammaticRequest;
  private readonly: boolean;

  @Input() set pr(p: ProgrammaticRequest) {
    this._pr = p;

    if (this._pr && this._pr.phaseId) {
      this.pomsvc.getById(this._pr.phaseId).subscribe(d => {
        if (d.error) {
          this.readonly = true;
        }
        else {
          this.readonly = (Pom.StatusEnum.RECONCILIATION === d.result.status);
        }
      });
    }
  }

  get pr(): ProgrammaticRequest {
    return this._pr;
  }

  constructor(private pomsvc:POMService) { }


}
