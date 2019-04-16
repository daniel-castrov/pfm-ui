import {NewProgramComponent} from './new-program-request/new-program-request.component';
import {ProgramAndPrService} from '../../../services/program-and-pr.service';
import {UserUtils} from '../../../services/user.utils';
import {POMService} from '../../../generated/api/pOM.service';
import {Component, OnInit, ViewChild, Input} from '@angular/core';
import { PBService, Pom, Program, RestResult, ProgramStatus, OrganizationService} from '../../../generated';
import {Notify} from "../../../utils/Notify";
import { GoogleChartComponent, ChartSelectEvent } from 'ng2-google-charts';
import { UiProgramRequest, FilterCriteria } from './UiProgramRequest';
import  * as _ from 'lodash';

import {CurrentPhase} from "../../../services/current-phase.service";
import { ActivatedRoute } from '@angular/router';
import { WorkspaceService } from '../../../generated';
import { Workspace } from '../../../generated';

@Component({
  selector: 'app-select-program-request',
  templateUrl: './select-program-request.component.html',
  styleUrls: ['./select-program-request.component.scss']
})
export class SelectProgramRequestComponent implements OnInit {
  @ViewChild(NewProgramComponent) newProgramComponent: NewProgramComponent;
  @ViewChild(GoogleChartComponent) comchart: GoogleChartComponent;

  private currentCommunityId: string;
  public pom: Pom;
  public pomPrograms: Program[];
  public pbPrograms: Program[];
  public thereAreOutstandingPRs: boolean;
  private charTitle = "";
  private chartdata;
  private charty;
  private rowsData: any[];
  private filterIds: string[];
  private filters: FilterCriteria[];
  private selectedFilter: FilterCriteria;
  private orgMap: Map<string, string> = new Map<string, string>();
  private _currworkspace: Workspace;
  private workspaces: Workspace[];

  constructor(private orgsvc: OrganizationService,
              private pomService: POMService,
              private currentPhase: CurrentPhase,
              private programAndPrService: ProgramAndPrService,
              private userUtils: UserUtils,
              private activatedRoute: ActivatedRoute,
              private wkspsvc: WorkspaceService,
              private pbService: PBService ) {
                this.filters = [FilterCriteria.ALL, FilterCriteria.ORG, FilterCriteria.BA, FilterCriteria.PR_STAT];
                this.selectedFilter = FilterCriteria.ALL;
              }

  async ngOnInit() {
    await this.populateOrgMap();
    this.currentCommunityId = (await this.userUtils.user().toPromise()).currentCommunityId;
    await this.resolvePomAndWorkspaces();
    await this.initPbPrs(this.pom.fy - 1);
    //await this.reloadPrs();
  }

  @Input() set currworkspace(w: Workspace) {
    this._currworkspace = w;
    this.reloadPrs();
  }

  get currworkspace(): Workspace {
    return this._currworkspace;
  }

  async reloadPrs() {
    await this.initPomPrs();
    this.thereAreOutstandingPRs = this.pomPrograms.filter(pr => pr.programStatus === 'OUTSTANDING').length > 0;
  }

  initPomPrs(): Promise<void> {
    return new Promise(async (resolve) => {
      delete this.pomPrograms;
      this.pomPrograms = (await this.programAndPrService.programRequests(this.currworkspace.id));
      resolve();
    });
  }

  async initPbPrs(year: number) {
    this.pbPrograms = (await this.pbService.getFinalByYear(year).toPromise()).result;
  }

  onDeletePr() {
    this.reloadPrs();
    this.newProgramComponent.addNewPrForMode = null;
  }

  async submit() {
    let data:RestResult = await this.pomService.submit(this.pom.id).toPromise();
    if (data.error) {
      Notify.error('No Program requests were submitted.\n' + data.error);
    } else {
      Notify.success('All Program requests were submitted.\n' + data.result);
      this.reloadPrs();
    } 
  }

  private async populateOrgMap() {
    this.userUtils.user().subscribe(user => {
      this.orgsvc.getByCommunityId(user.currentCommunityId).subscribe(data => {

        let orgs = [];
        this.orgMap.clear();
        orgs = data.result;
        orgs.forEach(org => this.orgMap.set(org.id, org.abbreviation));
      });
    });
  }

  private async resolvePomAndWorkspaces(): Promise<void> {
    // if we get a workspaceId as part of the route, fetch that workspace, and
    // set the pom according to the workspace.
    // if we don't get a workspaceId in the route, then fetch the current pom
    // and set the workspace based on the pom.

    var workspaceId;
    return new Promise<void>((resolve, reject) => {
      this.activatedRoute.params.subscribe(params => { 
        if (params.workspaceId) {
          workspaceId = params.workspaceId;
          this.pomService.getByWorkspaceId(params.workspaceId).subscribe(d => { 
            if (d.error) {
              reject(d.error);
            }
            this.pom = d.result;
            resolve();
          });
        }
        else {
          this.currentPhase.pom().subscribe(p => { 
            this.pom = p;
            workspaceId = p.workspaceId;
            resolve();
          });
        }
      });
    }).then(() => { 
      return new Promise<void>((resolve, reject) => { 
        this.wkspsvc.getByPhaseId(this.pom.id).subscribe(d => { 
          if (d.error) {
            reject(d.error);
          }

          this.workspaces = d.result;
          this.currworkspace = this.workspaces.filter(wksp => wksp.id === workspaceId)[0];
          resolve();
        });
      });
    });
  }
}
