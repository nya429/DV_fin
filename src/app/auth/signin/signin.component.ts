import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { AuthService } from './../auth.service';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
  animations: [
    trigger('scale', [
            state('fail',  style({  })),
            state('default',  style({ })),
            state('authed',  style({transform: 'scale(0)'})),
            transition('fail => default', animate('500ms', keyframes([
              style({transform: 'scale(1.0)'}),
              style({transform: 'scale(1.1)'}),
              style({transform: 'scale(1.0)'}),
              style({transform: 'scale(1.1)'}),
              style({transform: 'scale(1.0)'}),
            ]) )),
            transition('default => authed', animate('400ms 100ms ease-out', keyframes([
              style({transform: 'scale(1.1)', offset: 0.7}),
              style({transform: 'scale(0)', offset: 1}),
            ])))
      ])
    ]
})

export class SigninComponent implements OnInit, OnDestroy {
  required: boolean;
  scaleState: string;
  Subscription: Subscription;

  constructor(private authService: AuthService,
  private route: ActivatedRoute,
  private router: Router) { }

  ngOnInit() {
    this.scaleState = 'default';
    this.Subscription = this.authService.signInScaleChanged.subscribe((bigger: boolean) => {
      if (bigger) {
        this.scaleState = 'fail';
        setTimeout(() => {
          this.scaleState = 'default';
        }, 100);
      }
    });
  }

  ngOnDestroy() {
    this.Subscription.unsubscribe();
  }

  onSignIn() {
    this.authService.setToken();
    this.scaleState = 'authed';
    setTimeout(() => {
      this.authService.authedNav();
    }, 400);
  }

  isRequired() {

  }
}
