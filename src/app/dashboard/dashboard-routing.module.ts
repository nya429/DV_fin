import { AuthGuard } from './../auth/auth-guard.service';
import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { DashboardChartComponent } from './dashboard-chart/dashboard-chart.component';
import { DashboardTrackersManageComponent } from './dashboard-trackers-manage/dashboard-trackers-manage.component';
import { DashboardBarchartComponent } from './dashboard-barchart/dashboard-barchart.component';
import { DashboardPiechartComponent } from './dashboard-piechart/dashboard-piechart.component';
import { DashboardLinechartComponent } from './dashboard-linechart/dashboard-linechart.component';


const dashboardRoutes: Routes = [
    {path: '', component: DashboardComponent,
        children: [
            {path: '', redirectTo: 'overview', pathMatch: 'full'},
            {path: 'overview', component: DashboardOverviewComponent,
             children: [
                {path: '', redirectTo: 'barchart', pathMatch: 'full'},
                {path: 'linechart', component: DashboardLinechartComponent},
                {path: 'barchart', component: DashboardBarchartComponent},
                {path: 'piechart', component: DashboardPiechartComponent}]},
            {path: 'chart', component: DashboardChartComponent},
            {path: 'trackers', component: DashboardTrackersManageComponent}
        ]
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(dashboardRoutes)
    ],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }
