import { Component, ViewChild, OnInit } from '@angular/core';
import { Request } from '../../../services/request';

// Other Components
import { HeaderComponent } from '../../header/header.component';
import { Injectables } from '../../../services/injectables';
import { RequestsService } from '../../../services/requests.service';
import { AgGridNg2 } from 'ag-grid-angular';
import { PrChangeNotification, PrChangeNotificationsService } from "../../../generated";
import { Notify } from '../../../utils/Notify';

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

  columnDefs = [
    {
      headerName: 'Date',
      field: 'date'
    },
    {
      headerName: 'Timestamp',
      field: 'timestamp'
    },
    {
      headerName: 'Type',
      field: 'type'
    },
    {
      headerName: 'Originator',
      field: 'originator',
      width: 280;
    },
    {
      headerName: 'Approve',
      field: 'approve'
    },
    {
      headerName: 'Deny',
      field: 'deny'
    }
     ];

  rowData = [
      {date: '3', timestamp: '12:00', type: 'Assign Role', originator: 'Bill', approve: 'button', deny: 'button' },
      {date: '1', timestamp: '12:00', type: 'Assign Role', originator: 'Beth',  approve: 'button', deny: 'button' },
      {date: '4', timestamp: '12:00', type: 'Assign Role', originator: 'Mary', approve: 'button', deny: 'button' },
      {date: '24', timestamp: '12:00', type: 'Assign Role', originator: 'John', approve: 'button', deny: 'button' },
      {date: '5', timestamp: '12:00', type: 'Assign Role', originator: 'Sally',  approve: 'button', deny: 'button' }
     ];

  constructor( injectables: Injectables, // initilizes the static members on the class Injectables
               private requestsService: RequestsService,
               private prChangeNotificationsService: PrChangeNotificationsService
  ){}

  async ngOnInit() {
    this.requestsService.getRequests().subscribe(
      (allRequests) => {
        this.requests = allRequests;
      });
    this.prChangeNotifications = (await this.prChangeNotificationsService.getByOrganization().toPromise()).result;
  }

  async approve(request: Request) {
    this.submit(()=>request.approve(), "approved");
  }

  async deny(request: Request) {
    this.submit(()=>request.deny(), "denied");
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

 onGridReadyOrgs(params) {
   params.api.sizeColumnsToFit();
   window.addEventListener("resize", function() {
     setTimeout(() => {
       params.api.sizeColumnsToFit();
     });
   });
 }
}
