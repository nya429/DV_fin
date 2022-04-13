import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs/Subscription';
import { MapService } from '../map.service';

@Component({
  selector: 'app-map-pie',
  templateUrl: './map-pie.component.html',
  styleUrls: ['./map-pie.component.css']
})
export class MapPieComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pieChart') private chartContainer: ElementRef;
  @Input() private editedTrackerIndex: number;


  private dataset: number[] = [0, 0, 0, 0];

  private element;
  private svg: any;
  private piedata: any;
  private pie: any;
  private arc = d3.arc();
  private arcG: any;
  private textG: any;

  private width: number;
  private height: number;
  // private margin: any = { top: 20, bottom: 20, left: 20, right: 20};
  private circleWidth = 40;
  private innerRadius;
  private outerRadius;
  private color = d3.scaleOrdinal().range(['#1E90FF', '#00CED1', '#4682B4', '#87CEEB', '#4169E1', '#7B68EE']);
  private onTrackerAccVisit$: Subscription;

  constructor(private mapService: MapService) { }

  ngOnInit() {

    this.dataset = this.mapService.getAccVisitByTracker(this.editedTrackerIndex);
    this.createBase();
    this.scaleSize();
    this.createChart();
    setTimeout(() => {
      this.onTrackerAccVisit$ = this.mapService.onTrackerAccVisit.subscribe(d => this.onTrackerAccVisit(d));
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.onTrackerAccVisit$) {
      this.onTrackerAccVisit$.unsubscribe();
    }
  }

  ngAfterViewInit() {

  }

  updateChart(_current) {
    this.arcG.data(this.piedata).selectAll('path').data(d => d);
    this.textG.data(this.piedata).selectAll('text').data(d => d);
    // this.texts.data(this.dataset).selectAll('text').data(d => d);
    const self = this;
    this.arcG
      .transition()
      // .ease(d3.easeLinear)
      // .delay((d, i) =>  200 + i * 50)
      .duration(800)
      .attrTween('d', function(d, i) { return self.arcTween(d, _current[i], self); })

      this.textG
        .transition()
        .duration(1000)
        .attr('transform', d => 'translate(' + this.arc.centroid(d) + ')')
        .text(d => d.data === 0 ? '' : d.data);
        // .tween('text', function (d) {
        //   const node = this;
        //   const _cur = node.textContent;
        //   const i = d3.interpolateNumber(_cur, d.data);
        //   return function (t) {
        //     node.textContent = i(t).toFixed(1);
        //   };
        // });
  }

  onTrackerAccVisit(d: number[]) {
    this.dataset = [...d];
    const _current = this.piedata;
    this.piedata = this.pie(this.dataset);
    this.updateChart(_current);
  }

  createBase() {
    this.element = this.chartContainer.nativeElement;

    // if (this.element.parentNode.parentNode.getBoundingClientRect().height === 300) {
    //   console.log('here');
    //   this.height = 300;
    //   this.circleWidth = 50;
    // }
     /* ----------create svg------------*/
    this.svg = d3.select(this.element).append('svg');
    this.svg.attr('class', 'chartBase')
              .attr('width', this.element.offsetWidth)
              .attr('height', this.height);
  }

  createChart() {
     /* ----------create piedata------------*/
    this.pie = d3.pie().sort(null);
    this.piedata = this.pie(this.dataset);
     /* ----------create arc generator------------*/
    this.arc.innerRadius(this.innerRadius)
            .outerRadius(this.outerRadius)
            .padAngle(.03)
            .cornerRadius(5);



    const g = this.svg.append('g');
    g.attr('transform', 'translate(' + (this.width / 2) + ',' + (this.height / 2) + ')');

    g.selectAll('g').data(this.piedata).enter().append('g').attr('class', 'arc-g');

    this.arcG = this.svg.selectAll('.arc-g').data(this.piedata).append('path');

    const self = this;

    this.arcG
      .style('fill', (d, i) => this.color(i))
      .attr('transform', 'rotate(-90, 0, 0)')
      // .each(function(d) {this._current = d; })
      .transition()
      .ease(d3.easeLinear)
      .delay((d, i) =>  100 + i * 50)
      .duration(400)
      .attrTween('d', function(d, i) { return self.arcTween(d, {startAngle: 0, endAngle: 0}, self); })
      .attr('transform', 'rotate(0, 0, 0)');

    /* ----------append text------------*/
    this.textG = g.selectAll('.arc-g')
      .append('text');
    this.textG
      .transition()
      .ease(d3.easeLinear)
      .delay((d, i) =>  100 + i * 50)
      .duration(400)
      .attr('transform', d => 'translate(' + this.arc.centroid(d) + ')')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .text(d => d.data === 0 ? '' : d.data);

    /* ----------append  middle text------------*/
    // g.append('text')
    //   .attr('text-anchor', 'middle').attr('fill', '#31708f').text(d => '');
  }

  scaleSize() {
    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;

    this.svg.attr('height', this.element.offsetHeight);
    // the differ between element.offsetHeight and svg.height
    this.outerRadius = d3.min([this.element.offsetWidth, this.element.offsetHeight]) / 2 - 5;

    this.width = this.element.offsetWidth;
    this.innerRadius = this.outerRadius - this.circleWidth;
  }

  arcTween(d, _current, self) {
      return (t) => {
      const interpolate = d3.interpolate(_current, d);
      return self.arc(interpolate(t));
    };
  }

}
