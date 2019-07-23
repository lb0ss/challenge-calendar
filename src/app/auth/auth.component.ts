import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field';
import { AuthService } from './auth.service';

@Component({
  selector: 'ns-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  moduleId: module.id
})
export class AuthComponent implements OnInit {
  constructor(private router: RouterExtensions, private authService: AuthService) {}
  form: FormGroup;
  emailCtrlIsValid = true;
  passwordCtrlIsValid = true;
  isLogin = true;
  isLoading = false;

  @ViewChild('emailEl') emailEl: ElementRef<TextField>;
  @ViewChild('passwordEl') passwordEl: ElementRef<TextField>;

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, 
        {
          updateOn: 'blur', 
          validators: [Validators.required, Validators.email]
        }),
      password: new FormControl(null, 
        {
        updateOn: 'blur',
        validators: [Validators.required, Validators.minLength(6)]
      })
    })

    this.form.get('email').statusChanges.subscribe(status => {
      this.emailCtrlIsValid = status === 'VALID';
    });

    this.form.get('password').statusChanges.subscribe(status => {
      this.passwordCtrlIsValid = status === 'VALID';
    });
  }

  onSwitch() {
    this.isLogin = !this.isLogin;
  }

  // onDone() {
  //   this.emailEl.nativeElement.focus();
  //   this.passwordEl.nativeElement.focus(); // required here becasue the user may enter password first
  //   this.passwordEl.nativeElement.dismissSoftInput(); // dimisses the input of whichever is focused last and closes the keyboard
  // }

  onSubmit() {
    this.emailEl.nativeElement.focus();
    this.passwordEl.nativeElement.focus(); // required here becasue the user may enter password first
    this.passwordEl.nativeElement.dismissSoftInput(); // dimisses the input of whichever is focused last and closes the keyboard

    if (!this.form.valid) {
      return;
    }
    
    const email = this.form.get('email').value;
    const password = this.form.get('password').value;
    this.form.reset();
    this.emailCtrlIsValid = true;
    this.passwordCtrlIsValid = true;
    console.log(email, password);
    this.isLoading = true;
    if (this.isLogin) {
      this.authService.logIn(email, password).subscribe(res => {
        this.isLoading = false;
        console.log(`logging in`);
        this.router.navigate(['/challenges'], { clearHistory: true });
      }, err => {
        console.log(err);
        this.isLoading = false;
      })
    } else {
      this.authService.signUp(email, password).subscribe(res => {
        this.isLoading = false;
        this.router.navigate(['/challenges'], { clearHistory: true });
      }, err => {
        console.log(err);
        this.isLoading = false;
      })
    }
  }

  onDone() {
    this.emailEl.nativeElement.focus();
    this.passwordEl.nativeElement.focus();
    this.passwordEl.nativeElement.dismissSoftInput();
  }

}
