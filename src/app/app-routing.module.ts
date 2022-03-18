import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './core/page-not-found/page-not-found.component';

const appRoutes: Routes = [
    {path: '', redirectTo: '/map', pathMatch: 'full'},
    {path: 'auth', loadChildren: './auth/auth.module#AuthModule'},
    {path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule'},
    {path: 'map', loadChildren: './map/map.module#MapModule'},
    {path: 'setting', loadChildren: './setting/setting.module#SettingModule'},
    { path: 'not-found',
        component: PageNotFoundComponent,
        data: {message: 'Page not Found'} },
     { path: '**', redirectTo: 'not-found' },
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
