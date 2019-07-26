import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthComponent } from "./auth.component";
import { NativeScriptRouterModule } from "nativescript-angular/router";

@NgModule({
    declarations: [AuthComponent],
    imports: [
        NativeScriptCommonModule,
        NativeScriptRouterModule.forChild([{
            path: '',
            component: AuthComponent
        }]),
        NativeScriptFormsModule, 
        ReactiveFormsModule
    ],
    schemas: [NO_ERRORS_SCHEMA]
})
export class AuthModule {

}