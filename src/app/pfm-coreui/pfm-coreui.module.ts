import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from '@ag-grid-community/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ToastModule } from 'primeng/toast';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { CardComponent } from './card/card.component';
import { DialogManagerComponent } from './dialog-manager/dialog-manager.component';
import { BusyComponent } from './busy/busy.component';
import { AppHeaderComponent } from './app-header/app-header.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { RadioButtonWrapperComponent } from './form-inputs/radio-button-wrapper/radio-button-wrapper.component';
import { PhoneInputComponent } from './form-inputs/phone-input/phone-input.component';
import { ZipcodeInputComponent } from './form-inputs/zipcode-input/zipcode-input.component';
import { PasswordInputComponent } from './form-inputs/password-input/password-input.component';
import { EmailInputComponent } from './form-inputs/email-input/email-input.component';
import { RadioButtonInputComponent } from './form-inputs/radio-button-input/radio-button-input.component';
import { PrimaryButtonComponent } from './form-inputs/primary-button-input/primary-button.component';
import { DropdownComponent } from './form-inputs/dropdown/dropdown.component';
import { DatagridComponent } from './datagrid/datagrid.component';
import { DisplaydatagridComponent } from './datagrid/renderers/displaydatagrid.component';
import { ActionCellRendererComponent } from './datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { AttachmentCellRendererComponent } from './datagrid/renderers/attachment-cell-renderer/attachment-cell-renderer.component';
import { TextInputComponent } from './form-inputs/text-input/text-input.component';
import { SecondaryButtonComponent } from './form-inputs/secondary-button-input/secondary-button.component';
import { TextCellEditorComponent } from './datagrid/renderers/text-cell-editor/text-cell-editor.component';
import { TextCellRendererComponent } from './datagrid/renderers/text-cell-renderer/text-cell-renderer.component';
import { DisabledActionCellRendererComponent } from './datagrid/renderers/disabled-action-cell-renderer/disabled-action-cell-renderer.component';
import { CustomDialogComponent } from './custom-dialog/custom-dialog.component';
import { CancelCtaComponent } from './form-inputs/cancel-cta/cancel-cta.component';
import { FileUploadComponent } from './file-upload/file-upload/file-upload.component';
import { DatePickerCellEditorComponent } from './datagrid/renderers/date-picker-cell-editor/date-picker-cell-editor.component';
import { DatePickerCellRendererComponent } from './datagrid/renderers/date-picker-cell-renderer/date-picker-cell-renderer.component';
import { IsVisibleDirective } from './directives/is-visible.directive';
import { ToggleInputComponent } from './form-inputs/toggle-input/toggle-input.component';
import { MessageService } from 'primeng/api';
import { DropdownCellRendererComponent } from './datagrid/renderers/dropdown-cell-renderer/dropdown-cell-renderer.component';
import { MpActionCellRendererComponent } from './datagrid/renderers/mp-action-cell-renderer/mp-action-cell-renderer.component';
import { AgGridPaginationComponent } from './datagrid/ag-grid-pagination/ag-grid-pagination.component';
import { AtmActionCellRendererComponent } from './datagrid/renderers/atm-action-cell-renderer/atm-action-cell-renderer.component';
import { MprActionCellRendererComponent } from './datagrid/renderers/mpr-action-cell-renderer/mpr-action-cell-renderer.component';
import { CActionCellRendererComponent } from './datagrid/renderers/c-action-cell-renderer/c-action-cell-renderer.component';
import { WkspActionCellRendererComponent } from './datagrid/renderers/wksp-action-cell-renderer/wksp-action-cell-renderer.component';
import { CheckboxInputComponent } from './form-inputs/checkbox-input/checkbox-input.component';
import { CheckboxCellRendererComponent } from './datagrid/renderers/checkbox-cell-renderer/checkbox-cell-renderer.component';
import { PrsActionCellRendererComponent } from './datagrid/renderers/prs-action-cell-renderer/prs-action-cell-renderer.component';
import { FundingLineActionCellRendererComponent } from './datagrid/renderers/funding-line-action-cell-renderer/funding-line-action-cell-renderer.component';
import { UfrActionCellRendererComponent } from './datagrid/renderers/ufr-action-cell-renderer/ufr-action-cell-renderer.component';

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
    DropdownCellRendererComponent,
    TextCellEditorComponent,
    TextCellRendererComponent,
    DisabledActionCellRendererComponent,
    CustomDialogComponent,
    CancelCtaComponent,
    FileUploadComponent,
    DatePickerCellEditorComponent,
    DatePickerCellRendererComponent,
    DropdownCellRendererComponent,
    IsVisibleDirective,
    ToggleInputComponent,
    MpActionCellRendererComponent,
    AgGridPaginationComponent,
    AtmActionCellRendererComponent,
    MprActionCellRendererComponent,
    CActionCellRendererComponent,
    WkspActionCellRendererComponent,
    CheckboxInputComponent,
    CheckboxCellRendererComponent,
    PrsActionCellRendererComponent,
    FundingLineActionCellRendererComponent,
    UfrActionCellRendererComponent
  ],
  imports: [
    ToastModule,
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    FormsModule,
    NgbModule,
    CKEditorModule,
    AgGridModule.withComponents([
      MpActionCellRendererComponent,
      ActionCellRendererComponent,
      AttachmentCellRendererComponent,
      DropdownCellRendererComponent,
      TextCellEditorComponent,
      TextCellRendererComponent,
      DisabledActionCellRendererComponent,
      DatePickerCellEditorComponent,
      DatePickerCellRendererComponent,
      AtmActionCellRendererComponent,
      DropdownCellRendererComponent,
      CActionCellRendererComponent,
      PrsActionCellRendererComponent,
      FundingLineActionCellRendererComponent
    ]),
    BsDatepickerModule.forRoot()
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
    DropdownCellRendererComponent,
    TextCellEditorComponent,
    TextCellRendererComponent,
    DisabledActionCellRendererComponent,
    CustomDialogComponent,
    CancelCtaComponent,
    FileUploadComponent,
    DatePickerCellEditorComponent,
    DatePickerCellRendererComponent,
    DropdownCellRendererComponent,
    IsVisibleDirective,
    ToggleInputComponent,
    MpActionCellRendererComponent,
    MprActionCellRendererComponent,
    WkspActionCellRendererComponent,
    CheckboxInputComponent,
    CheckboxCellRendererComponent,
    UfrActionCellRendererComponent
  ],
  providers: [MessageService]
})
export class PfmCoreuiModule {}
