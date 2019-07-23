import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageRoute, RouterExtensions } from 'nativescript-angular/router';
import { ChallengeService } from '../challenge.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'ns-challenge-edit',
  templateUrl: './challenge-edit.component.html',
  styleUrls: ['./challenge-edit.component.scss'],
  moduleId: module.id
})
export class ChallengeEditComponent implements OnInit {
  isCreating = true;
  title = ''
  desc = ''

  constructor(
    private routerExtensions: RouterExtensions,
    private activatedRoute: ActivatedRoute,
    private pageRoute: PageRoute,
    private challengeService: ChallengeService
  ) {}

  ngOnInit() {
    // this.activatedRoute.paramMap.subscribe(paramMap => {
    //   console.log(paramMap.get('mode'));
    // });
    this.pageRoute.activatedRoute.subscribe(activatedRoute => {
      activatedRoute.paramMap.subscribe(paramMap => {
        if (!paramMap.has('mode')) {
          this.isCreating = true;
        } else {
          this.isCreating = paramMap.get('mode') !== 'edit';
        }
        // in edit mode, pre-populate the challenge form data with the latest data
        if (!this.isCreating) {
          this.challengeService.currentChallenge.pipe(take(1)).subscribe(challenge => {
            this.title = challenge.title;
            this.desc = challenge.desc;
          });
        }
      });
    });
  }

  onSubmit(title: string, desc: string) {
    console.log('onSubmit clicked: ' + title + desc);
    if (this.isCreating) {
      this.challengeService.createNewChallenge(title, desc);
    } else {
      this.challengeService.updateChallenge(title, desc);
    }
    this.routerExtensions.backToPreviousPage();
  }
}
