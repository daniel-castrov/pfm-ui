import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';

// Generated
import { AuthUser } from '../../generated/model/authUser';
import { RestResult } from '../../generated/model/restResult';
import { BlankService } from '../../generated/api/blank.service';
import { HeaderUserComponent } from './header-user/header-user.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [NgbTooltipConfig]
})
export class HeaderComponent implements OnInit {

  @ViewChild(HeaderUserComponent) headerUserComponent;
  isAuthenticated: boolean = false;
  authUser: AuthUser;

  constructor(
    private blankService: BlankService,
    private config: NgbTooltipConfig
  ) {
      config.placement = 'left';
  }

  async ngOnInit(): Promise<void> {
    const httpResponse: HttpResponse<RestResult> = await this.blankService.blank("response", true).toPromise();
    const authHeader = httpResponse.headers.get('Authorization');
    this.authUser = JSON.parse(atob(authHeader));
    this.isAuthenticated = true;
  }

}
