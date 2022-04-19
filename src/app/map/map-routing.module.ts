import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MapComponent } from './map.component';
import { MapDemoComponent } from './map-demo/map-demo.component';
import { TrackingMapComponent } from './tracking-map/tracking-map.component';
import { TrackerDetailComponent } from './tracker-detail/tracker-detail.component';
import { MapLineComponent } from './map-line/map-line.component';

const mapRoutes: Routes = [
    {path: '',
        component: MapComponent,
        children: [
            {path: '', redirectTo: 'lineChart', pathMatch: 'full'},
            {path: 'barchart', component: MapDemoComponent},
            {path: 'lineChart', component: MapLineComponent},
            {path: 'tracker',
             component: TrackerDetailComponent,
            //  children: [
            //     {path: ':id', component: TrackerDetailComponent}
            // ]
        },
        ]
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(mapRoutes)
    ],
    exports: [RouterModule]
})
export class MapRoutingModule { }
