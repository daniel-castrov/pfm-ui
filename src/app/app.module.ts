import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { TransferStateService } from './services/transfer-state.service';
import { AppRoutingModule } from './app-routing.module';
import { PfmCoreuiModule } from './pfm-coreui/pfm-coreui.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppModel } from './pfm-common-models/AppModel';
import { PfmAuthModuleModule } from './pfm-auth-module/pfm-auth-module.module';
import { DialogService } from './pfm-coreui/services/dialog.service';
import { AuthorizationService } from './pfm-auth-module/services/authorization.service';
import { AuthGuard } from './pfm-auth-module/services/auth-guard';
import { ToastModule } from 'primeng/toast';
import { VisibilityService } from './services/visibility-service';
import { VisibilityServiceImpl } from './services/visibility-service-impl.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    HttpClientModule,
    BrowserTransferStateModule,
    AppRoutingModule,
    PfmCoreuiModule,
    PfmAuthModuleModule,
    BrowserAnimationsModule,
    ToastModule
  ],
  providers: [
    AppModel,
    DialogService,
    AuthorizationService,
    AuthGuard,
    [{ provide: VisibilityService, useClass: VisibilityServiceImpl }]
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(transferStateService: TransferStateService) {}
}
