import { DatePipe } from '@angular/common';
import { ElementRef, NgModule, Renderer2 } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { GoogleChartComponent } from 'ng2-google-charts';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ActivatedRoute, Router } from '@angular/router';
import { MockActivatedRoute, MockRouter } from './helpers/mock-route.service';
import { ProgrammingService } from '../../app/programming-feature/services/programming-service';
import { ProgrammingServiceImpl } from '../../app/programming-feature/services/programming-service-impl.service';
import { RequestSummaryNavigationHistoryService } from '../../app/programming-feature/requests/requests-summary/requests-summary-navigation-history.service';

@NgModule({
  providers: [
    DatePipe,

    {
      provide: ActivatedRoute,
      useValue: new MockActivatedRoute({ id: 123 })
    },
    {
      provide: Router,
      useClass: MockRouter
    },
    {
      provide: ElementRef,
      useValue: null
    },
    {
      provide: Renderer2,
      useValue: null
    },
    {
      provide: TabsetComponent,
      useValue: null
    },
    {
      provide: GoogleChartComponent,
      useValue: null
    },
    {
      provide: TabDirective,
      useValue: null
    },
    {
      provide: FontAwesomeModule,
      useValue: null
    },
    {
      provide: ProgrammingService,
      useClass: ProgrammingServiceImpl
    },
    {
      provide: RequestSummaryNavigationHistoryService,
      useValue: null
    }
  ],
  imports: [HttpClientTestingModule]
})
export class PfmTestModule {}
