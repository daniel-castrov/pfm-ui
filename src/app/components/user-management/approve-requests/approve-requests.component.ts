import { Component, ViewChild, OnInit } from '@angular/core';
import { Request } from '../../../services/request';

// Other Components
import { HeaderComponent } from '../../header/header.component';
import { Injectables } from '../../../services/injectables';
import { RequestsService } from '../../../services/requests.service';
import { AgGridNg2 } from 'ag-grid-angular';
import {PrChangeNotification, PrChangeNotificationsService, RolesPermissionsService} from "../../../generated";
import { Notify } from '../../../utils/Notify';
import {FormatterUtil} from "../../../utils/formatterUtil";

@Component({
  selector: 'approve-requests',
  templateUrl: './approve-requests.component.html',
  styleUrls: ['./approve-requests.component.scss']
})
export class ApproveRequestsComponent implements OnInit {

  @ViewChild(HeaderComponent) header: HeaderComponent;
  @ViewChild("agGrid") private agGrid: AgGridNg2;

  requests: Request[];
  prChangeNotifications: PrChangeNotification[];
  isUserApprover: boolean = false;

  constructor( injectables: Injectables, // initilizes the static members on the class Injectables
               private requestsService: RequestsService,
               private prChangeNotificationsService: PrChangeNotificationsService,
               private rolesvc: RolesPermissionsService
  ){}

  async ngOnInit() {
    this.rolesvc.getRoles().subscribe(async data => {
      if (data.result.includes('Funds_Requestor')) {
        this.prChangeNotifications = (await this.prChangeNotificationsService.getByOrganization().toPromise()).result;
      }
      if (data.result.includes('User_Approver')) {
        this.isUserApprover = true;
        this.requests = await this.requestsService.getRequests().toPromise();
      }
    });
  }

  async approve(request: Request) {
    this.submit(()=>request.approve(), "approved");
  }

  async deny(request: Request) {
    this.submit(()=>request.deny(), "denied");
  }

  async dismiss(notification: PrChangeNotification) {
    notification.dismissed = true;
    this.prChangeNotificationsService.update(notification).subscribe(async response => {
      if (!response.error) {
        this.prChangeNotifications = (await this.prChangeNotificationsService.getByOrganization().toPromise()).result;
      }
    });
  }


  async submit(action: any, message: string) {
    try {
      await action();
      Notify.success("The request has been " + message);
      this.ngOnInit();
      this.header.refresh();
    } catch(e) {
      Notify.exception(e.message);
    }
  }

 onGridReady(params) {
   params.api.sizeColumnsToFit();
   window.addEventListener("resize", function() {
     setTimeout(() => {
       params.api.sizeColumnsToFit();
     });
   });
 }
}
