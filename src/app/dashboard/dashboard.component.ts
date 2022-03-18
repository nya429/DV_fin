import { AuthService } from './../auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('fadeIn', [
            state('default',  style({transform: 'scale(1)', opacity: 1})),
            state('fadedInit',  style({transform: 'scale(2)', opacity: 0})),
            transition('fadedInit => default', animate('200ms 10ms ease-out'))
    ])]
})

export class DashboardComponent implements OnInit {
  fadeInState: string;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.setState();
  }

  setState() {
    if (this.authService.authFaded ) {
      return;
    }
    this.authService.authFaded = true;
    this.fadeInState = 'fadedInit';
    setTimeout(() => {
      this.fadeInState = 'default';
    }, 100);
  }

}
