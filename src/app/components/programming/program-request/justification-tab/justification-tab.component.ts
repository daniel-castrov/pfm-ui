import {Component, Input, OnInit} from '@angular/core';
import {ProgrammaticRequest, Pom, RolesPermissionsService} from "../../../../generated";

@Component({
  selector: 'justification-tab',
  templateUrl: './justification-tab.component.html',
  styleUrls: ['./justification-tab.component.scss']
})
export class JustificationTabComponent implements OnInit {

  @Input() pr: ProgrammaticRequest;
  @Input() pom: Pom;
  private ismgr: boolean = false;

  constructor( private rolesvc:RolesPermissionsService) { }

  ngOnInit() {
    this.rolesvc.getRoles().subscribe(data => {
      this.ismgr = (data.result.includes('POM_Manager'));
    });
  }

  get readonly(): boolean {
    return (this.pom ? Pom.StatusEnum.RECONCILIATION === this.pom.status : false);
  }
}
