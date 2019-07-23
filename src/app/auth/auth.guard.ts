import { CanLoad, UrlSegment, Route } from "@angular/router";
import { Injectable } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { AuthService } from "./auth.service";
import { Observable, of } from "rxjs";
import { take, switchMap, tap } from "rxjs/operators";

@Injectable()
export class AuthGuard implements CanLoad {
    constructor(private authService: AuthService, private router: RouterExtensions) {
         }
        
    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.user.pipe(
            take(1), 
            switchMap(currentUser => {
                // check if an active user is present
                if (!currentUser || !currentUser.token) {
                    return this.authService.autoLogin();   // automatically decides whether to log the user in or not
                }
                return of(true) // active user is present, allows the navigation to challenges
        }), 
            // if isAuth is false, then navigate to the auth screen
            tap(isAuth => {
                if (!isAuth) {
                    this.router.navigate(['/auth']);
                }
            })
        );        
    }

}