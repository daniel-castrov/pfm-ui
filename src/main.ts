import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import {LicenseManager} from "ag-grid-enterprise/main";

LicenseManager.setLicenseKey("pExchange,_LLC_JSCBIS_3Devs3_August_2019__MTU2NDc4NjgwMDAwMA==1b97cc91a7cc9d4a42a9816ea46e7e04");

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
