import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-map-line',
  templateUrl: './map-line.component.html',
  styleUrls: ['./map-line.component.css']
})
export class MapLineComponent implements OnInit {
  @ViewChild('lineChart') private chartContainer: ElementRef;

  private dataset = [
    {'year' : '2011', 'value': 774100},
    {'year' : '2012', 'value': 726700},
    {'year' : '2013', 'value': 737100},
    {'year' : '2014', 'value': 689200},
    {'year' : '2015', 'value': 652300},
    {'year' : '2016', 'value': 727100},
    {'year' : '2017', 'value': 708200},
];


private dataset2 = [
  {'year' : '2011', 'value': 671100},
  {'year' : '2012', 'value': 684700},
  {'year' : '2013', 'value': 711100},
  {'year' : '2014', 'value': 724200},
  {'year' : '2015', 'value': 745300},
  {'year' : '2016', 'value': 774100},
  {'year' : '2017', 'value': 755200},
];

  line: any;
  element;
  svg: any;


  private width: number;
  private height: number;
  private margin = { top: 20, bottom: 30, left: 30, right: 20};
  private circleWidth = 30;
  private innerRadius;
  private outerRadius;
  private xScale: any;
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private yAxis: any;

  constructor() { }

  ngOnInit() {
    this.element = this.chartContainer.nativeElement;
    this.createBase();
    this.createChart();
  }

  createBase() {
    this.width = this.element.offsetWidth;
    this.height = 160;
    if (this.element.parentNode.parentNode.getBoundingClientRect().height === 300) {
      this.height = 300;
    }
     /* ----------create svg------------*/
    this.svg = d3.select(this.element).append('svg');
    this.svg.attr('class', 'chartBase')
              .attr('width', this.element.offsetWidth)
              .attr('height', this.height);
  }

  createChart() {

    const xScale = d3.scaleTime().range([0, this.width - this.margin.left - this.margin.right]);
    const yScale = d3.scaleLinear().range([this.height - this.margin.top - this.margin.bottom, 0]);



    /* ----------create line generator------------*/
    this.line = d3.line();
    this.line
      .x(d => xScale(d.year))
      .y(d => yScale(d.value));

  /* ----------set data parser------------*/

    this.dataset.forEach(d => this.dataparse(d));
    this.dataset2.forEach(d => this.dataparse(d));

    /* ----------set scale domain------------*/
    const min = (d3.min([d3.min(this.dataset2, d => d.value), d3.min(this.dataset, d => d.value)]));
    const max = (d3.max([d3.max(this.dataset2, d => d.value), d3.max(this.dataset, d => d.value)]));
    xScale.domain(d3.extent(this.dataset, d =>  d.year ));
    yScale.domain([min / 1.002, max * 1.002]);

    /* ----------append Axis------------*/
   this.svg.append('g').attr('class', 'line-g');
   const g = this.svg.select('g');
    g.attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
       g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + (this.height  - this.margin.top - this.margin.bottom) + ')')
      // TODO add scalbel axis condition here .ticks()
      .call(d3.axisBottom(xScale));

      g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(yScale).ticks(6).tickFormat(function(d) { return (d / 1000) + 'k'; }))
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .attr('fill', '#5D6971');

    const lineG = this.svg.select('.line-g');

      lineG.append('path')
      .datum(this.dataset)
      .attr('class', 'line')
      .attr('d', this.line)
      .style('fill', 'none')
      .style('stroke', 'SKYBLUE')
      .style('stroke-width', 2)
        .transition()
          .delay(500)
          .duration(1000)
          .attr('d', this.line(this.dataset2))
          .style('stroke', 'cyan')
          .ease(d3.easeQuadOut);



      lineG.append('path')
          .datum(this.dataset2)
          .attr('class', 'line')
          .attr('d', this.line)
          .style('fill', 'none')
          .style('stroke', 'LAWNGREEN')
          .style('stroke-width', 2)
            .transition()
              .delay(1000)
              .duration(500)
              .attr('d', this.line(this.dataset))
              .style('stroke', 'LIGHTSEAGREEN')
              .ease(d3.easeQuadOut);
  }

  dataparse(d) {
    const parseTime = d3.timeParse('%Y');
    const bisectDate = d3.bisector(a => a.year).left;
    d.year = parseTime(d.year);
    d.value = +d.value;
  }
}
