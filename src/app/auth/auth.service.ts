import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
import { Injectable, EventEmitter, Output } from '@angular/core';

@Injectable()
export class AuthService {
  errorEmiiter = new EventEmitter<string> ();
  token: string = null;
  authFaded = false;
  errorMessage: string = null;
  signInScaled: boolean;
  signInScaleChanged = new Subject<boolean> ();

  constructor(private router: Router) { }

  isAuthenticated() {
      // return this.token !== null;
       return true;
  }

  setToken() {
    this.token = 'true';
  }

  authedNav() {
    this.router.navigate(['/dashboard']);
  }

  logOut() {
    this.token = null;
    this.authFaded = false;
    this.router.navigate(['/home']);
  }

  changeSigninScale() {
    this.signInScaleChanged.next(true);
  }
}
