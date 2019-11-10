import {
  BrowserModule,
  BrowserTransferStateModule
} from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { PluginLoaderService } from './services/plugin-loader/plugin-loader.service';
import { ClientPluginLoaderService } from './services/plugin-loader/client-plugin-loader.service';
import { PluginsConfigProvider } from './services/plugins-config.provider';
import { TransferStateService } from './services/transfer-state.service';
import { AppRoutingModule } from './app-routing.module';
import { PfmCoreuiModule } from './pfm-coreui/pfm-coreui.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppModel } from '../../projects/shared/src/lib/models/AppModel';
import { PfmAuthModuleModule } from './pfm-auth-module/pfm-auth-module.module';
import { DialogService } from './pfm-coreui/services/dialog.service';
import { AuthorizationService } from './pfm-auth-module/services/authorization.service';
import { AuthGuard } from './pfm-auth-module/services/auth-guard';
import { MaterialModule } from './material.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    HttpClientModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserTransferStateModule,
    AppRoutingModule,
    MaterialModule,
    PfmCoreuiModule,
    PfmAuthModuleModule,
    BrowserAnimationsModule
  ],
  providers: [
    { provide: PluginLoaderService, useClass: ClientPluginLoaderService },
    PluginsConfigProvider,
    {
      provide: APP_INITIALIZER,
      useFactory: (provider: PluginsConfigProvider) => () =>
        provider
          .loadConfig()
          .toPromise()
          .then(config => (provider.config = config)),
      multi: true,
      deps: [PluginsConfigProvider]
    },
    AppModel,
    DialogService,
    AuthorizationService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(transferStateService: TransferStateService) {}
}
