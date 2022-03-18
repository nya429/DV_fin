
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router,
                private authService: AuthService) {}

    canActivate(route: ActivatedRouteSnapshot,
                state: RouterStateSnapshot): boolean {
                    if (this.authService.isAuthenticated()) {
                        return true;
                    } else {
                        this.authService.changeSigninScale();
                        this.router.navigate(['/auth/signin']);
                        return false;
                    }
                }
    // canActivateChild(route: ActivatedRouteSnapshot,
    //     state: RouterStateSnapshot): boolean {
    //         if (this.authService.isAuthenticated()) {
    //             return true;
    //         } else {
    //             this.router.navigate(['/signin']);
    //             return false;
    //         }
    // }
}
