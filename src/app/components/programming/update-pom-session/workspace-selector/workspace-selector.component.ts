import {Component, Input, OnInit} from '@angular/core';
import {POMService, WorkspaceService} from "../../../../generated";
import {UserUtils} from "../../../../services/user.utils";
import {ActivatedRoute} from "@angular/router";
import {UpdatePomSessionComponent} from "../update-pom-session.component";

@Component({
  selector: 'workspace-selector',
  templateUrl: './workspace-selector.component.html',
  styleUrls: ['./workspace-selector.component.scss'],
})
export class WorkspaceSelectorComponent implements OnInit {

  @Input() parent: UpdatePomSessionComponent;

  constructor(private userUtils: UserUtils,
              private pomService: POMService,
              private workspaceService: WorkspaceService,
              private route: ActivatedRoute) {}

  ngOnInit() {
    const workspaceId = this.route.snapshot.params['id'];
    this.userUtils.user().subscribe( user => {
      this.pomService.getOpen(user.currentCommunityId).subscribe( pom => {
        this.parent.pom = pom.result;
        this.parent.columnKeys = [
          this.parent.pom.fy - 3,
          this.parent.pom.fy -2,
          this.parent.pom.fy - 1,
          this.parent.pom.fy,
          this.parent.pom.fy + 1,
          this.parent.pom.fy + 2,
          this.parent.pom.fy + 3,
          this.parent.pom.fy + 4];
        this.workspaceService.getByPhaseId(pom.result.id).subscribe( workspaces => {
          this.parent.workspaces = workspaces.result;
          this.parent.selectedWorkspace = this.parent.workspaces.find(workspace => workspace.id === workspaceId);
          if (this.parent.selectedWorkspace !== undefined) {
            this.onWorkspaceSelected();
          }
        });
      });
    });
  }

  onWorkspaceSelected(){
    setTimeout(() => {
      this.parent.workspaceComponent.initRowClass();

      this.parent.workspaceComponent.initDataRows();
      this.parent.workspaceComponent.generateColumns();

      this.parent.gridToaComponent.initToaDataRows();
      this.parent.gridToaComponent.generateToaColumns();

      this.parent.eventsModalComponent.generateEventsColumns();
    });
  }

}
