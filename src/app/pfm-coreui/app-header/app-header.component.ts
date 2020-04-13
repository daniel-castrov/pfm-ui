import { Component, OnInit } from '@angular/core';
import { AppModel } from '../../pfm-common-models/AppModel';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'pfm-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  providers: [MessageService]
})
export class AppHeaderComponent implements OnInit {
  constructor(public appModel: AppModel, private messageService: MessageService) {}

  // TODO - fix the menu drop down on the header - conflict with materail vs bootstrap
  ngOnInit() {}
}
