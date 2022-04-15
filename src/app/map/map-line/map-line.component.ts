import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { D } from '@angular/core/src/render3';
import * as d3 from 'd3';
import { Subscription } from 'rxjs/Subscription';
import { MapService } from '../map.service';
@Component({
  selector: 'app-map-line',
  templateUrl: './map-line.component.html',
  styleUrls: ['./map-line.component.css']
})
export class MapLineComponent implements OnInit, OnDestroy {
  @ViewChild('lineChart') private chartContainer: ElementRef;


  private line: any;
  private element;
  private svg: any;
  private width: number;
  private height: number;
  private margin = { top: 20, bottom: 30, left: 20, right: 20 };
  private padding = { top: 20, bottom: 30, left: 20, right: 130 };
  private legendD = { width: 70, height: 35 };
  private xScale: any;
  private yScale: any;
  private color = d3.scaleOrdinal().range(['#1E90FF', '#00CED1', '#4682B4', '#87CEEB', '#4169E1', '#7B68EE']);
  private xAxisG: any;
  private xAxis: any;
  private yAxisG: any;
  private lineG: any;
  // private timer: any;
  private legend: any;
  private onInstantVisit$: Subscription;

  private dataset: any;
  private instantData: number[] = [0, 0, 0, 0];


  constructor(private mapService: MapService) { }

  ngOnInit() {
    this.getInstantVisit();
    this.createBase();
    this.createChart();
    setTimeout(() => {
      this.onInstantVisit$ = this.mapService.onInstantVisit.subscribe(d => this.onInstantVisit(d));
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.onInstantVisit$) {
      this.onInstantVisit$.unsubscribe();
    }
  }

  onInstantVisit({data, dur}) {
    this.dataset = this.parseData(data);
    console.log(this.dataset[0].map(d => d.time));
    this.updateChart(dur);
  }

  getInstantVisit() {
    const data = this.mapService.getInstantZoneVisit();
    this.dataset = this.parseData(data);
  }

  parseData(data: object[]) {
    if (data.length === 0) {
      return [[], [], [], []];
    }

    this.instantData = data[data.length - 1]['visit'];

    return d3.range(data[0]['visit'].length)
      .map(i =>
        data
        .sort((a, b) => Date.parse(a['time']) - Date.parse(b['time']))
        .map(
          (d: { time: any, visit: any }) => ({ 'time': d.time, 'visit': d.visit[i] })
        )
      );
  }

  createBase() {
    this.element = this.chartContainer.nativeElement;
    this.width = this.element.offsetWidth - this.margin.left - this.margin.right;
    this.height = 300 - this.margin.top - this.margin.bottom;
    /* ----------create svg------------*/
    this.svg = d3.select(this.element).append('svg');
    this.svg.attr('class', 'chartBase')
      .attr('width', this.width)
      .attr('height', this.height);
  }

  createChart() {
    /* ----------create line generator------------*/
    this.line = d3.line();
    this.line
      .x(d => this.xScale(Date.parse(d.time)))
      .y(d => this.yScale(d.visit));

    // /* ----------set data parser------------*/

    //   this.dataset.forEach(d => this.dataparse(d));

    /* ----------set scale domain------------*/
    const min = 0;  // (d3.min([d3.min(this.dataset, d => d.value), d3.min(this.dataset, d => d.time)]));   // 0
    const max = 10; // (d3.max([d3.max(this.dataset, d => d.value), d3.max(this.dataset, d => d.value)]));   // 10

    this.xScale = d3.scaleTime()
      .range([0, this.width - this.padding.right])
      .domain(d3.extent(this.dataset[0], (d, i) => Date.parse(d.time)));

    this.yScale = d3.scaleLinear()
      .range([this.height - this.margin.top - this.margin.bottom, 0])
      .domain([min / 1, max * 1.1]);


    /* ----------append Axis------------*/
    this.svg.append('g').attr('class', 'g');

    const g = this.svg.select('g');
    g.attr('transform', 'translate(' + (2 * this.margin.left) + ','
      + (this.margin.top) + ')');

    this.xAxis = d3.axisBottom(this.xScale)
      .ticks(d3.timeSecond.every(1))
      .tickSizeInner(15)
      .tickFormat(d3.timeFormat('%M:%S'));

    this.xAxisG = g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + (this.height - this.margin.top - this.margin.bottom) + ')');
    // TODO add scalbel axis condition here .ticks()
    this.xAxisG
      .call(this.xAxis);

    g.append('rect')
      .attr('fill', 'white')
      .attr('width', this.margin.left + this.margin.right)
      .attr('height', this.margin.bottom)
      .attr('x', -this.margin.left - this.margin.right)
      .attr('y', this.height - this.margin.bottom - this.margin.top);


    this.yAxisG = g.append('g')
      .attr('class', 'axis axis--y');

    this.yAxisG.call(d3.axisLeft(this.yScale).ticks(6)
      .tickFormat(function (d) { return d; }))
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      // .attr('transform', 'translate(' + (this.width - this.margin.left ) + ', 0)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .attr('fill', '#5D6971');

    // console.log(this.dataS);


    /* ----------append line------------*/
    this.lineG = this.svg.select('.g').append('g').attr('class', 'line-g')
      .selectAll().data(this.dataset).enter().append('path');

    this.lineG
      .attr('class', d => 'line')
      .attr('id', (d, i) => 'line' + i)
      .attr('d', this.line)
      .style('fill', 'none')
      .style('stroke', (d, i) => this.color(i))
      .style('stroke-width', 2);
    /* ----------append legend------------*/
    this.legend = this.svg.select('.g').append('g').attr('class', 'legend-g')
      .selectAll().data(this.instantData).enter().append('g');


    this.legend.attr('class', 'legend')
      .attr('id', (d, i) => 'legend' + i)
      .attr('transform', d => 'translate(' + (this.width - this.padding.right + this.legendD.width / 3) + ','
        + (this.yScale(d) - this.legendD.height / 2) + ')');
      // .attr('x', this.width - this.padding.right +  this.legendD.width)
      // .attr('y', d => this.yScale(d) - this.legendD.height / 2)
      // .append('rect')
      // .attr('width', this.legendD.width)
      // .attr('height', this.legendD.height)
      // .attr('fill', (d, i) => 'black')
      // .attr('fill-opacity', d => 0.3);

    this.legend
      .append('text')
      .attr('transform', d => 'translate(' + (10) + ','
        + (this.legendD.height / 2 + 4) + ')')
      //  .attr('text-anchor', 'middle')
      .style('font-size', 18)
      .style('font-weigh', 700)
      .style('fill', (d, i) => this.color(i))
      .text((d, i) => `Zone ${i + 1}`);
    //  .attr('textr', 123)

  }

  updateChart(dur: boolean) {
    // console.log(this.dataset)
    /* ----------update domain------------*/
    // const min = (d3.min([d3.min(this.dataset, d => d.value), d3.min(this.dataset, d => d.value)]));
    // const max = (d3.max([d3.max(this.dataset, d => d.value), d3.max(this.dataset, d => d.value)]));

    this.xScale = d3.scaleTime()
      .range([0, this.width - this.padding.right])
      .domain(d3.extent([...this.dataset[0]], (d, i) => Date.parse(d.time)));
    // console.log(this.dataset[0])
    // console.log(d3.extent(this.dataset[0], (d, i) => Date.parse(d.time)));
    // this.yScale.domain([min / 1.002, max * 1.002]);
    this.line
      .x(d => this.xScale(Date.parse(d.time)))
      .y(d => this.yScale(d.visit));


    /* ----------update axis------------*/

    this.xAxis = d3.axisBottom(this.xScale)
      .ticks(d3.timeSecond.every(1))
      .tickSizeInner(15)
      .tickFormat(d3.timeFormat('%M:%S'));


    this.xAxisG
      .transition()
      .duration(dur ? 899 : 0)
      .ease(d3.easeLinear)
      .call(this.xAxis);
      // .on('end', function (){setTimeout(animate);});;


    // this.lineG = this.svg.select('.g').append('g').attr('class', 'line-g')
    // .selectAll().data(this.dataset).enter().append('path');

    // this.lineG
    //   .attr('class', (d, i) => 'line')
    //   .attr('d', this.line)
    //   .style('fill', 'none')
    //   .style('stroke', 'SKYBLUE')
    //   .style('stroke-width', 2);



    /* ----------update line------------*/
    this.lineG.data(this.dataset).selectAll('line').data(d => d);

    this.lineG
      .transition()
      .duration(dur ? 1000 : 0)
      .ease(d3.easeLinear)
      .attr('d', this.line)
      // .style('stroke', 'LIGHTSEAGREEN')
      .style('stroke-width', 2);

    /* ----------update legend------------*/
    this.legend.data(this.instantData).selectAll('g').data(d => d);
    this.legend
      .transition()
      .duration(dur ? 1000 : 0)
      .ease(d3.easeLinear)
      .attr('transform', d => 'translate(' + (this.width - this.padding.right + this.legendD.width / 3) + ','
        + (this.yScale(d) - this.legendD.height / 2) + ')');
    this.legend.select('text')
      .text((d, i) => `Zone ${i + 1}`);
  }

}

