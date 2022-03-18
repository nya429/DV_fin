// import { AuthService } from './../auth/auth.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './header/header.component';
// import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AppRoutingModule } from '../app-routing.module';
import { LandpageService } from './landpage.service';

@NgModule({
    declarations: [
        HeaderComponent,
        PageNotFoundComponent,
    ],
    imports: [
        CommonModule,
        AppRoutingModule
    ],
    exports: [
        AppRoutingModule,
        HeaderComponent,
    ],
    providers: [ LandpageService ]
})
export class CoreModule {}
