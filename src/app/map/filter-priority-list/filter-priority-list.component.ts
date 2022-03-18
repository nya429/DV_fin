import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-filter-priority-list',
  templateUrl: './filter-priority-list.component.html',
  styleUrls: ['./filter-priority-list.component.css']
})
export class FilterPriorityListComponent implements OnInit {
  priorityList = ['All', 'Vip', 'Visitor'];
  @Output() prioritySelected = new EventEmitter<number> ();

  constructor() { }

  ngOnInit() {
  }

  onSelect(event, id: number) {
    this.prioritySelected.emit(id);
    event.stopPropagation();
  }

}
