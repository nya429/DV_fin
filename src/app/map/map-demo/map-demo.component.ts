import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs/Subscription';
import { MapService } from '../map.service';

@Component({
  selector: 'app-map-demo',
  templateUrl: './map-demo.component.html',
  styleUrls: ['./map-demo.component.css']
})
export class MapDemoComponent implements OnInit, OnDestroy {
  @ViewChild('chart') private chartContainer: ElementRef;
  @Input() private data: Array<any>;
  private baseElement: any;
  private padding = { left: 30, right: 30, top: 20, bottom: 20 };
  private rectPadding = 20;
  private margin: any = { top: 20, bottom: 20, left: 20, right: 20 };
  private svg: any;
  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private yAxis: any;
  private xAxisG: any;
  private yAxisG: any;
  private testData: any;
  public dataset = [0, 0, 0, 0];
  public xDomain = ['Zone1', 'Zone2', 'Zone3', 'Zone4'];
  private minMaxY = 6;
  private rectBar: any;
  private texts: any;
  private timer: any;
  private xz: any;

  private onStartSubscription: Subscription;
  private onStopSubscription: Subscription;
  private onTestSubscription: Subscription;
  private onPauseSubscription: Subscription;

  private chartStarted = false;

  constructor(private mapService: MapService) { }

  ngOnInit() {
    this.initBase();
    this.initChart();
    this.onStartSubscription = this.mapService.started.subscribe(d => this.onStart(d));
    this.onStopSubscription = this.mapService.onStopped.subscribe(d => this.onStop(d));
    // this.onTestSubscription = this.mapService.onTest.subscribe(d => this.onTest(d));
    this.onPauseSubscription = this.mapService.onPaused.subscribe(d => this.onPause(d));

    if (this.mapService.mapStarted) {
      this.startChart();
    }
  }

  ngOnDestroy(): void {
    this.onStartSubscription.unsubscribe();
    this.onStopSubscription.unsubscribe();
    // this.onTestSubscription.unsubscribe();
    this.onPauseSubscription.unsubscribe();
    this.clearTimer();
  }

  onStart(d: boolean): void {
    console.log('onStart', d);
    if (!d && !this.chartStarted) {
      return;
    }
    this.startChart();
  }

  startChart() {
    this.clearTimer();
    this.timer = setInterval(() => {
      this.rnadomData();
      this.updateChart();
    }, 1000);

    this.chartStarted = true;
  }

  onStop(d: boolean): void {
    console.log('onStop');
    this.chartStarted = false;
    this.clearTimer();
  }

  onPause(d: boolean): void {
    console.log('onPause');
    this.chartStarted = false;
    this.clearTimer();
  }

  // onTest(d: boolean): void {
  //   console.log('pause')
  //   if (!d || !this.chartStarted) {
  //     return;
  //   }
  //   this.clearTimer();
  //   this.timer = setInterval(() => {
  //     this.rnadomData();
  //     this.updateChart();
  //   }, 1000);
  //   this.chartStarted = true;
  // }

  clearTimer(): void {
    if (this.timer) {
      console.log('cleared');
      clearInterval(this.timer);
    }
  }

  resetChart(): void {

  }

  updateChart(): void {
    const prev = this.xz;

    this.xz = d3.range(this.dataset.length).sort((a, b) => {
      return this.dataset[b] - this.dataset[a];
    });

    const reorder = prev === this.xz;

    const duration1 = 1000;
    const duration2 = 500;

    const trueMaxY = d3.max(this.dataset);
    const maxY = trueMaxY < this.minMaxY ? this.minMaxY : trueMaxY;
    // DYNAMIC
    this.xScale = d3.scaleBand()
      .domain(this.xz)
      .range([0, this.baseElement.offsetWidth - this.padding.left - this.padding.right]);

    this.yScale = d3.scaleLinear()
      .domain([0, maxY])
      .range([this.baseElement.offsetHeight - this.padding.top - this.padding.bottom, 0]);
    // DYNAMIC
    this.xAxis = d3.axisBottom(this.xScale).tickArguments([10, 's']);
    this.yAxis = d3.axisLeft(this.yScale).tickArguments([5, 's']);

    const that = this;

    this.rectBar.data(this.dataset).selectAll('rect').data(d => d);
    this.texts.data(this.dataset).selectAll('text').data(d => d);

    this.yAxisG.transition().duration(duration1).call(this.yAxis);

    this.rectBar
      .transition()
      .duration(duration1)
      // .ease(d3.easeQuadOut)

      .attr('y', d => this.yScale(d) + this.padding.top)
      .attr('height', d => {
        // console.log(this.yScale(d), d, this.baseElement.offsetHeight - this.padding.top - this.padding.bottom - this.yScale(d))
        return this.baseElement.offsetHeight - this.padding.top - this.padding.bottom - this.yScale(d);
      })
      // .transition()
      // .delay(duration2)
      .attr('x', (d, i) => this.padding.left + this.xScale(i) + this.rectPadding / 2)
      ;

    this.texts
      .transition()
      .duration(duration1)
      .tween('text', function (d) {
        const node = this;
        const _current = node.textContent;
        const i = d3.interpolateNumber(_current, d);
        return function (t) {
          node.textContent = i(t).toFixed(1);
        };
      })
      // .attr('dx', () => (this.xScale.bandwidth() - 30 - this.rectPadding) / 2)
      .attr('y', d => this.yScale(d) + this.padding.top)
      // .transition()
      // .delay(duration2)
      .attr('x', (d, i) => this.padding.left + this.xScale(i) - 30 + this.rectPadding / 2)
      ;

    this.svg
      .select('.X-axis')
      .selectAll('.tick')
      .transition()
      // .delay(duration1)
      .duration(duration1)
      .attr(
        'transform',
        (d, i) => `translate(${this.xScale(i) + this.xScale.bandwidth() / 2}, ${0})`
      );
  }


  testtween(a, self) {
    return function () {
      const node = d3.select(self);
      const _current = node.textContent;
      const i = d3.interpolateNumber(_current, a);
      return function (t) {
        node.text(i(t));
      };
    };
  }

  getRandomInt(min, max): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  rnadomData() {
    const randIndx = this.getRandomInt(0, 4);
    const randSeed = this.getRandomInt(1, 3);
    this.dataset[randIndx] += randSeed;
  }

  initBase(): void {
    this.baseElement = this.chartContainer.nativeElement;

    this.width = this.baseElement.offsetWidth - this.margin.left - this.margin.right;
    this.height = this.baseElement.offsetHeight - this.margin.top - this.margin.bottom;
    this.svg = d3.select(this.baseElement).append('svg')
      .attr('width', this.baseElement.offsetWidth)
      .attr('height', this.baseElement.offsetHeight);
  }


  initChart(): void {
    // DYNAMIC
    const trueMaxY = d3.max(this.dataset);
    const maxY = trueMaxY < this.minMaxY ? this.minMaxY : trueMaxY;

    // DYNAMIC
    this.xScale = d3.scaleBand()
      .domain(d3.range(this.dataset.length))
      .range([0, this.baseElement.offsetWidth - this.padding.left - this.padding.right]);

    this.yScale = d3.scaleLinear()
      .domain([0, maxY])
      .range([this.baseElement.offsetHeight - this.padding.top - this.padding.bottom, 0]);
    // DYNAMIC
    this.xAxis = d3.axisBottom(this.xScale).tickArguments([10, 's']).tickFormat((d, i) => this.xDomain[i]);
    this.yAxis = d3.axisLeft(this.yScale).tickArguments([5, 's']);

    this.xAxisG = this.svg.append('g')
      .attr('class', 'X-axis')
      .attr('transform', 'translate(' + this.padding.left + ',' + (this.baseElement.offsetHeight - this.padding.bottom) + ')')
      .call(this.xAxis);

    this.yAxisG = this.svg.append('g')
      .attr('class', 'Y-axis')
      .attr('transform', 'translate(' + this.padding.left + ',' + this.padding.top + ')')
      .call(this.yAxis);

    const that = this;

    this.rectBar = this.svg.selectAll('rect')
      .append('g')
      .attr('class', 'bar-G')
      .data(this.dataset)
      .enter().append('rect');

    this.rectBar.attr('x', (d, i) => {
      return that.padding.left + that.xScale(i) + that.rectPadding / 2;
    })
      .attr('y', d => {
        return that.yScale(0) + that.padding.top;
      })
      .attr('width', that.xScale.bandwidth() - that.rectPadding)
      .attr('height', d => {
        return 0;
      })
      .attr('fill', 'skyblue')
      .transition()
      .delay(function (d, i) {
        return i * 50;
      })
      .duration(800)
      // .ease(d3.easeQuadOut)
      .attr('y', function (d) {
        return that.yScale(d) + that.padding.top;
      })
      .attr('height', function (d) {
        return that.baseElement.offsetHeight - that.padding.top - that.padding.bottom - that.yScale(d);
      });

    this.texts = this.svg.selectAll('.BarText')
      .data(this.dataset)
      .enter()
      .append('text')
      .attr('class', 'BarText');

    this.texts.attr('transform', 'translate(' + this.padding.left + ',' + this.padding.top + ')')
      .attr('x', function (d, i) {
        return that.xScale(i) + that.rectPadding / 2;
      })
      .attr('y', function (d) {
        return that.yScale(0) + that.padding.top;
      })
      .attr('dx', function () {
        return (that.xScale.bandwidth() - 30 - that.rectPadding) / 2;
      })
      .attr('dy', function (d) {
        return 20;
      })
      .text(function (d) {
        return d;
      })
      .attr('fill', 'skyblue')
      .transition()
      .attr('fill', 'white')
      .style('font-size', '24px')
      .delay(function (d, i) {
        return i * 50;
      })
      .duration(800)
      // .ease(d3.easeQuadOut)
      .attr('y', function (d) {
        return that.yScale(d) + that.padding.top;
      });

  }
}
