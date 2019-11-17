import { Component, OnInit } from '@angular/core';
import { AppModel } from '../../../projects/shared/src/lib/models/AppModel';
import { DialogService } from '../pfm-coreui/services/dialog.service';
import { PfmHomeService } from './services/pfm-home-service';
import { PfmHomeMockService } from './services/pfm-home-mock.service';
import { UserTask } from './models/UserTask';
import { NewsItem } from './models/NewsItem';

@Component({
  selector: 'app-pfm-home-module',
  templateUrl: './pfm-home-module.component.html',
  styleUrls: ['./pfm-home-module.component.scss']
})
export class PfmHomeModuleComponent implements OnInit {

  busy:boolean;
  userTasks:UserTask[];
  lastestNews:NewsItem[];

  constructor(public appModel:AppModel, private dialogService:DialogService, private homeService:PfmHomeMockService) { }

  ngOnInit() {
    this.busy = true;
    this.homeService.getUserTasks().subscribe(
      data => {
        this.busy = false;
        this.userTasks = (data as any).result;
      },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      }
    );
  }

}
