import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppHeaderComponent } from './app-header/app-header.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { RouterModule } from '@angular/router';
import { DialogManagerComponent } from './dialog-manager/dialog-manager.component';
import { BusyComponent } from './busy/busy.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { CardComponent } from './card/card.component';
import { RadioButtonWrapperComponent } from './form-inputs/radio-button-wrapper/radio-button-wrapper.component';
import { PhoneInputComponent } from './form-inputs/phone-input/phone-input.component';
import { ZipcodeInputComponent } from './form-inputs/zipcode-input/zipcode-input.component';
import { PasswordInputComponent } from './form-inputs/password-input/password-input.component';
import { EmailInputComponent } from './form-inputs/email-input/email-input.component';
import { RadioButtonInputComponent } from './form-inputs/radio-button-input/radio-button-input.component';
import { FormsModule } from '@angular/forms';
import { PrimaryButtonComponent } from './form-inputs/primary-button-input/primary-button.component';
import { DropdownComponent } from './form-inputs/dropdown/dropdown.component';
import { DatagridComponent } from './datagrid/datagrid.component';
import { DisplaydatagridComponent } from './datagrid/renderers/displaydatagrid.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { ActionCellRendererComponent } from './datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { AttachmentCellRendererComponent } from './datagrid/renderers/attachment-cell-renderer/attachment-cell-renderer.component';
import { TextInputComponent } from './form-inputs/text-input/text-input.component';
import { SecondaryButtonComponent } from './form-inputs/secondary-button-input/secondary-button.component';
import { TextCellEditorComponent } from './datagrid/renderers/text-cell-editor/text-cell-editor.component';
import { TextCellRendererComponent } from './datagrid/renderers/text-cell-renderer/text-cell-renderer.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DisabledActionCellRendererComponent } from './datagrid/renderers/disabled-action-cell-renderer/disabled-action-cell-renderer.component';
import { CustomDialogComponent } from './custom-dialog/custom-dialog.component';
import { CancelCtaComponent } from './form-inputs/cancel-cta/cancel-cta.component';

@NgModule({
  declarations: [
    RadioButtonWrapperComponent,
    AppHeaderComponent,
    MenuBarComponent,
    DialogManagerComponent,
    BusyComponent,
    CardComponent,
    TextInputComponent,
    PhoneInputComponent,
    ZipcodeInputComponent,
    PasswordInputComponent,
    EmailInputComponent,
    DropdownComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    RadioButtonInputComponent,
    DatagridComponent,
    DisplaydatagridComponent,
    ActionCellRendererComponent,
    AttachmentCellRendererComponent,
    TextCellEditorComponent,
    TextCellRendererComponent,
    DisabledActionCellRendererComponent,
    CustomDialogComponent,
    CancelCtaComponent
  ],
  imports: [
    CommonModule, RouterModule, AngularFontAwesomeModule, FormsModule, NgbModule, AgGridModule.withComponents([ActionCellRendererComponent, AttachmentCellRendererComponent, TextCellEditorComponent, TextCellRendererComponent, DisabledActionCellRendererComponent])
  ],
  exports: [
    AppHeaderComponent,
    MenuBarComponent,
    DialogManagerComponent,
    BusyComponent,
    CardComponent,
    TextInputComponent,
    PhoneInputComponent,
    ZipcodeInputComponent,
    PasswordInputComponent,
    EmailInputComponent,
    DropdownComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    RadioButtonInputComponent,
    DatagridComponent,
    DisplaydatagridComponent,
    ActionCellRendererComponent,
    AttachmentCellRendererComponent,
    TextCellEditorComponent,
    TextCellRendererComponent,
    DisabledActionCellRendererComponent,
    CustomDialogComponent,
    CancelCtaComponent
  ]
})
export class PfmCoreuiModule { }
