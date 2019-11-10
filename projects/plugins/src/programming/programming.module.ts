import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'shared';
import { ProgrammingComponent } from './programming.component';
import { ProgrammingCoreModule } from '../../../programming-core/src/lib/programming-core.module';

@NgModule({
  imports: [CommonModule, SharedModule, ProgrammingCoreModule],
  declarations: [ProgrammingComponent],
  entryComponents: [ProgrammingComponent]
})
export class ProgrammingModule {
  static entry = ProgrammingComponent;
}
