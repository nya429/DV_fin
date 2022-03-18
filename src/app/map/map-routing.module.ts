import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MapComponent } from './map.component';
import { MapDemoComponent } from './map-demo/map-demo.component';
import { TrackingMapComponent } from './tracking-map/tracking-map.component';
import { TrackerDetailComponent } from './tracker-detail/tracker-detail.component';

const mapRoutes: Routes = [
    {path: '',
        component: MapComponent,
        children: [
            {path: '', redirectTo: 'tracker', pathMatch: 'full'},
            {path: 'barchart', component: MapDemoComponent},
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
