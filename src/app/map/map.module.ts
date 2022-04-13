// import { ParticipantService } from './../participant-management/participant.service';
// import { CompanyService } from './../participant-management/company.service';
import { SharedModule } from './../shared/shared.module';
import { MapRoutingModule } from './map-routing.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';

import { PriorityPipe } from './priorityStatus.pipe';
import { MapService } from './map.service';
import { MapComponent } from './map.component';
import { MapMenuComponent } from './map-menu/map-menu.component';
import { MapDemoComponent } from './map-demo/map-demo.component';
import { TrackingMapComponent } from './tracking-map/tracking-map.component';
import { TrackerListComponent } from './tracker-list/tracker-list.component';
import { TrackerListItemComponent } from './tracker-list/tracker-list-item/tracker-list-item.component';
import { MapControlPenalComponent } from './map-control-penal/map-control-penal.component';
import { TrackerDetailComponent } from './tracker-detail/tracker-detail.component';
import { TrackerDetailEditComponent } from './tracker-detail/tracker-detail-edit/tracker-detail-edit.component';
import { SearchResultListComponent } from './search-result-list/search-result-list.component';
import { FilterPriorityListComponent } from './filter-priority-list/filter-priority-list.component';
import { FilterCompanyDropdownComponent } from './filter-company-dropdown/filter-company-dropdown.component';
import { MapTooltipComponent } from './map-tooltip/map-tooltip.component';
import { MapPieComponent } from './map-pie/map-pie.component';
import { MapLineComponent } from './map-line/map-line.component';


@NgModule({
  declarations: [
    PriorityPipe,
    MapComponent,
    MapMenuComponent,
    MapDemoComponent,
    TrackingMapComponent,
    TrackerListComponent,
    TrackerListItemComponent,
    MapControlPenalComponent,
    TrackerDetailComponent,
    TrackerDetailEditComponent,
    SearchResultListComponent,
    FilterPriorityListComponent,
    FilterCompanyDropdownComponent,
    MapTooltipComponent,
    MapPieComponent,
    MapLineComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpModule,
    MapRoutingModule,
    SharedModule
  ],
  providers: [MapService],
})
export class MapModule { }
