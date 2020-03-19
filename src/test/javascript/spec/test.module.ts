import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

@NgModule({
  providers: [
    DatePipe
  ],
  imports: [HttpClientTestingModule]
})
export class PfmTestModule {}
