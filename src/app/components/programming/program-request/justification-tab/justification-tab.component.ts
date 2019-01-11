import {Component, Input, OnInit} from '@angular/core';
import {Program, Pom, RolesPermissionsService, ProgramStatus} from "../../../../generated";

@Component({
  selector: 'justification-tab',
  templateUrl: './justification-tab.component.html',
  styleUrls: ['./justification-tab.component.scss']
})
export class JustificationTabComponent implements OnInit {

  @Input() pr: Program;
  @Input() pom: Pom;
  private ismgr: boolean = false;
  private fundsRequestorCanEdit: boolean = false;

  constructor( private rolesvc:RolesPermissionsService) { }

  ngOnInit() {
    this.rolesvc.getRoles().subscribe(data => {
      this.ismgr = (data.result.includes('POM_Manager'));
      this.fundsRequestorCanEdit = (data.result.includes('Funds_Requestor')) && this.pr.programStatus === ProgramStatus.SAVED;
    });
  }

  get readonly(): boolean {
    return !this.fundsRequestorCanEdit && !this.ismgr && (this.pom ? Pom.StatusEnum.RECONCILIATION === this.pom.status : false);
  }
}
