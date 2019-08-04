import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DayStatus } from '../day.model';

@Component({
  selector: 'ns-challenge-actions',
  templateUrl: './challenge-actions.component.html',
  styleUrls: ['./challenge-actions.component.scss'],
  moduleId: module.id,
})
export class ChallengeActionsComponent implements OnChanges {
  @Output() actionSelect = new EventEmitter<DayStatus>();
  @Input() cancelText = 'Cancel';
  @Input() chosen: 'complete' | 'fail' = null;  // used to get the current status of the challenge and update the UI accordingly
  @Input() startDone = false;
  action: 'complete' | 'fail' = null;
  done = false; 

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    // change the value of action based on what is received 
    // from chosen
    if (changes.chosen) {
      // initialize action with the 'chosen' value
      this.action = changes.chosen.currentValue;
      // if the challenge is neither complete nor fail
      if (changes.chosen.currentValue === null) {
        this.done = false;
      }
    }
    if (changes.startDone) {
      if (changes.startDone.currentValue) {
        this.done = true;
      }
    }
  }

  onAction(action: 'complete' | 'fail' | 'cancel') {
    // if done is true, disable the buttons,
    // forcing the user to click reset before changing value
    this.done = true;
    let status = DayStatus.Open;
    if (action === 'complete') {
      status = DayStatus.Completed;
      this.action = 'complete';
    } else if (action === 'fail') {
      status = DayStatus.Failed;
      this.action = 'fail';
    } else if (action === 'cancel') {
      this.action = null;
      this.done = false;
    }
    this.actionSelect.emit(status);
  }
 
}
