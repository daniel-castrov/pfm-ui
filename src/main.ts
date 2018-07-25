import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import {LicenseManager} from "ag-grid-enterprise/main";

LicenseManager.setLicenseKey("Evaluation_License_Valid_Until__30_September_2018__MTUzODI2MjAwMDAwMA==b0211b0a791ee130b75eaa29a676124a");

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
