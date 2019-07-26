import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, of, Subscription } from "rxjs";
import { Challenge } from './challenge.model';
import { DayStatus, Day } from "./day.model";
import { take, last, tap, switchMap } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../auth/auth.service";

@Injectable({providedIn: 'root'})

export class ChallengeService implements OnDestroy{
    // BehaviorSubject always yields the latest value
    // and yields a new value whenever an event is emitted.
    private _currentChallenge = new BehaviorSubject<Challenge>(null);
    private userSub: Subscription;

    constructor(
        private http: HttpClient, 
        private authService: AuthService) {
        this.userSub = this.authService.user.subscribe(user => {
            if (!user) {
                this._currentChallenge.next(null);       // clean up and reset the current challenge in memory to prevent loading the same data for different users            
            }
        })
    }

    // exposes the _currentChallenges as an read-only
    // observable. An event cannot be emitted.
    get currentChallenge() {
        return this._currentChallenge.asObservable(); // converts it into a mere Observable where next() can be called
    }

    fetchCurrentChallenge() {
        return this.authService.user.pipe(
            take(1),    // only get the latest value and unsub automatically
            switchMap(currentUser => {  // switchMap takes the value of the previous observable and maps the value into the next observable
                if (!currentUser || !currentUser.isAuth) {  // extra check to ensure no data is posted when user is not present or is not authenticated
                    return of(null);
                }
                return this.http.get<{
                    title: string, 
                    desc: string, 
                    month: number, 
                    year: number, 
                    _days: Day[]
                }>(`https://ns-challenge-calendar.firebaseio.com/challenge/${currentUser.id}.json?auth=${currentUser.token}`) // retrieve the token and append it to post request
            })).pipe(
                // extract data
                    tap(res => {
                        if (res) {
                            const loadedChallenge = new Challenge(
                                res.title, 
                                res.desc, 
                                res.year, 
                                res.month, 
                                res._days
                                );
                                this._currentChallenge.next(loadedChallenge);    
                        };
         
            }));
    }

    createNewChallenge(title: string, desc: string) {
        const newChallenge = new Challenge(
            title, 
            desc, 
            new Date().getFullYear(), 
            new Date().getMonth()
            );
            // save it to server
            this.saveToServer(newChallenge);
            this._currentChallenge.next(newChallenge);
    }

    updateChallenge(title: string, desc: string) {
        this._currentChallenge.pipe(take(1)).subscribe(challenge => {
            const updatedChallenge = new Challenge(title, desc, challenge.year, challenge.month, challenge.days);
            this.saveToServer(updatedChallenge);
            this._currentChallenge.next(updatedChallenge);
        });
    }

    updateDayStatus(dayInMonth: number, dayStatus: DayStatus) {
        this._currentChallenge.pipe(take(1)).subscribe(challenge => {   // this will then unsubscribe automatically
            if (!challenge || challenge.days.length < dayInMonth) {
                return;
            }
            const dayIndex = challenge.days.findIndex(d => d.dayInMonth === dayInMonth);
            challenge.days[dayIndex].status = dayStatus;
            this._currentChallenge.next(challenge);
            console.log('dayIndex is: ' + JSON.stringify(challenge.days[dayIndex]));
            this.saveToServer(challenge);
        }) 
    }

    ngOnDestroy() {
        this.userSub.unsubscribe();
    }

    private saveToServer(challenge: Challenge) {
        this.authService.user
          .pipe(
            take(1),
            switchMap(currentUser => {
            if (!currentUser || !currentUser.isAuth) {  // extra check to ensure no data is posted when user is not present or is not authenticated
                return of(null);
            }
            return this.http
            .put(`https://ns-challenge-calendar.firebaseio.com/challenge/${currentUser.id}.json?auth=${currentUser.token}`, challenge)
            })
        )
        .subscribe(res => {
            console.log(res);
        })
    }
}