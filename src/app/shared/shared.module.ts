import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { ActionBarComponent } from './ui/action-bar/action-bar.component';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { NativeScriptRouterModule } from 'nativescript-angular/router';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptRouterModule],
  declarations: [ActionBarComponent],
  exports: [ActionBarComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class SharedModule {}
