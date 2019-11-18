import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppHeaderComponent } from './app-header/app-header.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { RouterModule } from '@angular/router';
import { DialogManagerComponent } from './dialog-manager/dialog-manager.component';
import { MaterialModule } from '../material.module';
import { BusyComponent } from './busy/busy.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { CardComponent } from './card/card.component';
import { InputWrapperComponent } from './form-inputs/input-wrapper/input-wrapper.component';
import { RadioButtonWrapperComponent } from './form-inputs/radio-button-wrapper/radio-button-wrapper.component';
import { PasswordWrapperComponent } from './form-inputs/password-wrapper/password-wrapper.component';
import { SecondaryButtonWrapperComponent } from './form-inputs/secondary-button-wrapper/secondary-button-wrapper.component';
import { DropdownWrapperComponent } from './form-inputs/dropdown-wrapper/dropdown-wrapper.component';
import { PhoneInputComponent } from './form-inputs/phone-input/phone-input.component';
import { FirstnameInputComponent } from './form-inputs/firstname-input/firstname-input.component';
import { ZipcodeInputComponent } from './form-inputs/zipcode-input/zipcode-input.component';
import { UsernameInputComponent } from './form-inputs/username-input/username-input.component';
import { PasswordInputComponent } from './form-inputs/password-input/password-input.component';
import { EmailInputComponent } from './form-inputs/email-input/email-input.component';
import { LastnameInputComponent } from './form-inputs/lastname-input/lastname-input.component';
import { DropdownInputComponent } from './form-inputs/dropdown-input/dropdown-input.component';
import { SecondaryButtonInputComponent } from './form-inputs/secondary-button-input/secondary-button-input.component';
import { RadioButtonInputComponent } from './form-inputs/radio-button-input/radio-button-input.component';
import { FormsModule } from '@angular/forms';
import { PrimaryButtonComponent } from './form-inputs/primary-button-input/primary-button.component';

@NgModule({
  declarations: [
    InputWrapperComponent,
    RadioButtonWrapperComponent,
    PasswordWrapperComponent,
    SecondaryButtonWrapperComponent,
    DropdownWrapperComponent,
    AppHeaderComponent,
    MenuBarComponent,
    DialogManagerComponent,
    BusyComponent,
    CardComponent,
    PhoneInputComponent,
    FirstnameInputComponent,
    ZipcodeInputComponent,
    UsernameInputComponent,
    PasswordInputComponent,
    EmailInputComponent,
    LastnameInputComponent,
    DropdownInputComponent,
    PrimaryButtonComponent,
    SecondaryButtonInputComponent,
    RadioButtonInputComponent
  ],
  imports: [
    CommonModule, RouterModule, MaterialModule, AngularFontAwesomeModule, FormsModule
  ],
  exports: [
    AppHeaderComponent,
    MenuBarComponent,
    DialogManagerComponent,
    BusyComponent,
    CardComponent,
    PhoneInputComponent,
    FirstnameInputComponent,
    ZipcodeInputComponent,
    UsernameInputComponent,
    PasswordInputComponent,
    EmailInputComponent,
    LastnameInputComponent,
    DropdownInputComponent,
    PrimaryButtonComponent,
    SecondaryButtonInputComponent,
    RadioButtonInputComponent
  ]
})
export class PfmCoreuiModule { }
