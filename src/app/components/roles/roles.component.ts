import { Component, OnInit } from '@angular/core';
import { PickListModule } from 'primeng/picklist';
import { AccordionModule } from 'primeng/accordion';
import { MenuItem } from 'primeng/api';


@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent  {

  status: any = {
     isFirstOpen: true,
     isFirstDisabled: false
   };
  }
