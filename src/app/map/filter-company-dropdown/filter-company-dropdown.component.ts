// import { CompanyService } from './../../participant-management/company.service';
import { NgForm } from '@angular/forms';
import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';

import { MapService } from './../map.service';
// import { ParticipantService } from './../../participant-management/participant.service';
import { listItemFadeSlideStateTrigger } from '../map.animation';

@Component({
  selector: 'app-filter-company-dropdown',
  templateUrl: './filter-company-dropdown.component.html',
  styleUrls: ['./filter-company-dropdown.component.css'],
  animations: [ listItemFadeSlideStateTrigger ]
})
export class FilterCompanyDropdownComponent implements OnInit {
  serchTimer: any;
  companysLookingUp: boolean;
  companyTimer;
  companyFocused: boolean;
  companys: object[];
  inputFocus: boolean;

  constructor(
    // private pmService: ParticipantService,
    //           private companySerivce: CompanyService,
             private mapService: MapService) { }

  ngOnInit() {
    // this.companySerivce.getCompanys(' ').subscribe(
    //   result => {
    //     this.companys = result['data'];
    //   });
  }

  onSelect(event, company: object) {
    // this.pmService.companySelected.next(company);
    this.onClose(event);
    event.stopPropagation();
  }

  onClose(event) {
    this.mapService.onCompanyDropdownFolded(true);
    event.stopPropagation();
  }

  getCompanys(form: NgForm) {
    clearTimeout(this.serchTimer);
    const term = form.value.term;
    if (!term || term.length === 0) {
      this.companys = null;
      this.companysLookingUp = false;
      return;
    }
     this.companyFocused = true;
     this.companysLookingUp = true;
    //  this.serchTimer = setTimeout(() => this.companySerivce.getCompanys(term).subscribe(
    //   result => {
    //     this.companysLookingUp = false;
    //     this.companys = result['data'];
    //    }), 300);
  }
}
