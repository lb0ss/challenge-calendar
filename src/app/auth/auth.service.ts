import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
import { throwError, BehaviorSubject, of } from "rxjs";
import { alert } from 'tns-core-modules/ui/dialogs';
import { User } from "./user.model";
import { RouterExtensions } from "nativescript-angular/router";
import  { setString, getString, hasKey, remove } from 'tns-core-modules/application-settings';

const FIREBASE_API_KEY = 'AIzaSyC2OkYfSaeoBOqnQtLqyjIan6f_9U1T14c';

interface AuthResData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    localId: string;
    expiresIn: string;
    registered?: boolean;
}

@Injectable({ providedIn: 'root'})

export class AuthService {
    private _user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: number;

    constructor(
        private http: HttpClient, 
        private routerExtensions: RouterExtensions
        ) { }

    get user() {
        return this._user.asObservable();
    }

    signUp(email: string, password: string) {
       return this.http.post<AuthResData>(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=${FIREBASE_API_KEY}`,
        {email: email, password: password, returnSecureToken: true}
        ).pipe(
            catchError(error => {
            this.handleError(error.error.error.message);
            return throwError(error);   // must return here to ensure the function is still subscribable
        }),
          // taps into the response
          tap(res => {
              if (res && res.idToken) {
                this.handleLogin(email, res.idToken, res.localId, parseInt(res.expiresIn));
              }
          })
        )
    }

    logIn(email: string, password: string) {
       return this.http.post<AuthResData>(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${FIREBASE_API_KEY}`,
        {email: email, password: password, returnSecureToken: true}
        ).pipe(catchError(error => {
            this.handleError(error.error.error.message);
            return throwError(error); // must return to make sure the subscription in component still works
        }),
          tap(res => {
            if (res && res.idToken) {
                this.handleLogin(email, res.idToken, res.localId, parseInt(res.expiresIn));
            }
        })
        )
    }

    logout() {
        this._user.next(null);
        remove('userData');     // removes the User object in 'userData
        // check if timer for autoLogout is set
        // if so, reset timer
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.routerExtensions.navigate(['/auth'], { clearHistory: true });
    }

    autoLogin() {
        if(!hasKey('userData')) {
            return of(false);   //  creates a new observable based on a single value
        }
        // if the user already exists,
        const userData: {
            email: string, 
            id: string, 
            _token: string, 
            _tokenExpirationDate: string
        } = JSON.parse(getString('userData'));  // convets JSOn back to object

        // construct a new User object
        const loadedUser = new User(
            userData.email, 
            userData.id, 
            userData._token, 
            new Date(userData._tokenExpirationDate)
            );

        // if the user is authenticated, emit it as the new currentUser
        if (loadedUser.isAuth) {
            this._user.next(loadedUser);
            this.autoLogout(loadedUser.timeToExpiry);
            return of(true)
        }

        return of (false); // return false with observable if the user is not authenticated  
    }

    autoLogout(expiryDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => this.logout(), expiryDuration);        // use arrow function here to keep 'this' reference to the class, expiryDuration)
    }

    private handleLogin(email: string, token: string, userId: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
        const user = new User(email, userId, token, expirationDate);
        // stores the User object whenever an user is logged in
        setString('userData', JSON.stringify(user));  // stores the User object in the 'userData' string
        this.autoLogout(user.timeToExpiry);
        this._user.next(user);
    }

    private handleError(errorMessage: string) {
        switch(errorMessage) {
            case 'EMAIL_EXISTS':
                alert('This email address already exists');
                break;
            case 'INVALID_PASSWORD':
                    alert('Your password is invalid!');
                    break;
            default: 
                alert('Authentication failed, check your credentials');
        }
    
    }
}