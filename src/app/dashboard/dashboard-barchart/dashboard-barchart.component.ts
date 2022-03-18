import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-dashboard-barchart',
  templateUrl: './dashboard-barchart.component.html',
  styleUrls: ['./dashboard-barchart.component.css']
})
export class DashboardBarchartComponent implements OnInit {
  @ViewChild('barChart') private chartContainer: ElementRef;
  @Input() private data: Array<any>;
  private margin: any = { top: 20, bottom: 20, left: 20, right: 20};
  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private yAxis: any;
  constructor() { }

  ngOnInit() {
    this.createMap();
  }

  createMap() {
    const element = this.chartContainer.nativeElement;

    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom;
    const svg = d3.select(element).append('svg')
              .attr('width', element.offsetWidth)
              .attr('height', this.height);

              if (element.parentNode.parentNode.getBoundingClientRect().height === 300) {
                console.log('here');
                svg.attr('height', 280);
              }


    const rectHeight = 25;
    const padding = {left: 30, right: 10, top: 20, bottom: 20};
    const rectPadding = 3;
    const dataset = [10, 20, 50, 40, 22, 30, 10 , 25];

    const linear = d3.scaleLinear()
                      .domain([0, d3.max(dataset)])
                      .range([0, 250]);

    const xScale = d3.scaleBand()
                      .domain(d3.range(dataset.length))
                      .range([0, element.offsetWidth - padding.left - padding.right]);
    const yScale = d3.scaleLinear()
                      .domain([0, d3.max(dataset)])
                      .range([element.offsetHeight - padding.top - padding.bottom, 0]);


    const paddingScale = d3.scaleLinear()
                      .domain([0, 5])
                      .range([0, xScale.bandwidth() / 2]);

    const xAxis = d3.axisBottom(xScale).tickArguments([10, 's']);
    const yAxis = d3.axisLeft(yScale).tickArguments([5, 's']);

    const axis = d3.axisBottom(linear).tickArguments([5, 's']);

    // svg.append('g').call(axis)
    //       .attr('transform', 'translate(20,200)');
    svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + padding.left + ',' + (element.offsetHeight - padding.bottom) + ')')
    .call(xAxis);

  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
    .call(yAxis);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const rectBar = svg.selectAll('rect')
          .data(dataset)
          .enter().append('rect');

        rectBar.attr('x',  (d, i) =>  {
            return  padding.left + xScale(i) + paddingScale(rectPadding) / 2;
          })
          .attr('y', d =>  yScale(0) + padding.top)
          .attr('width', xScale.bandwidth() - paddingScale(rectPadding))
          .attr('height', d => 0)
          .attr('fill', 'skyblue')
          .transition()
          .delay((d, i) => i * 50)
          .duration(800)
          .ease(d3.easeQuadOut)
          .attr('y', d => yScale(d) + padding.top)
          .attr('height', d => element.offsetHeight - padding.top - padding.bottom - yScale(d));

      const texts = svg.selectAll('.BarText')
        .data(dataset)
        .enter()
        .append('text')
        .attr('class', 'BarText')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
        .attr('x', (d, i) => xScale(i))
        .attr('y', d => yScale(0) + padding.top)
        .attr('dx', d => xScale.bandwidth() / 2 - 8)
        .attr('dy', d => 0)
        .text(d => d)
        .attr('fill', 'skyblue')
        .transition()
        .attr('fill', 'white')
        .delay(function(d, i) {
          return i * 50;
        })
        .duration(800)
        .ease(d3.easeQuadOut)
        .attr('y', function(d) {
          return yScale(d) + padding.top;
        })
        .attr('height', function(d) {
          return element.offsetHeight - padding.top - padding.bottom - yScale(d);
        });
  }
}
