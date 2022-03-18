import { SettingService } from './setting/setting.service';
import { AuthGuard } from './auth/auth-guard.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { MapModule } from './map/map.module';
import { AppComponent } from './app.component';
import { DashboardModule } from './dashboard/dashboard.module';
// import { ParticipantManagementModule } from './participant-management/participant-management.module';
import { SettingModule } from './setting/setting.module';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth/auth.service';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    HttpModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule,
    AuthModule,
    SharedModule,
    MapModule,
    DashboardModule,
    // ParticipantManagementModule,
    SettingModule
  ],
  providers: [AuthGuard, AuthService, SettingService],
  bootstrap: [AppComponent]
})
export class AppModule {}
