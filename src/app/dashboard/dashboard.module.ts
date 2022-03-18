import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardNavComponent } from './dashboard-nav/dashboard-nav.component';
import { DashboardChartComponent } from './dashboard-chart/dashboard-chart.component';
import { DashboardTrackersManageComponent } from './dashboard-trackers-manage/dashboard-trackers-manage.component';
import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview.component';
import { DashboardBarchartComponent } from './dashboard-barchart/dashboard-barchart.component';
import { DashboardPiechartComponent } from './dashboard-piechart/dashboard-piechart.component';
import { DashboardLinechartComponent } from './dashboard-linechart/dashboard-linechart.component';

@NgModule({
    declarations: [
        DashboardComponent,
        DashboardNavComponent,
        DashboardChartComponent,
        DashboardTrackersManageComponent,
        DashboardOverviewComponent,
        DashboardBarchartComponent,
        DashboardPiechartComponent,
        DashboardLinechartComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        HttpModule,
        DashboardRoutingModule
    ],
    exports: [

    ],
    providers: []
})
export class DashboardModule {}

