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
  private padding = { left: 30, right: 30, top: 20, bottom: 50 };
  private rectPadding = 20;
  private margin: any = { top: 20, bottom: 20, left: 20, right: 20 };
  private svg: any;
  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private color = d3.scaleOrdinal().range(['#1E90FF', '#00CED1', '#4682B4', '#87CEEB', '#4169E1', '#7B68EE']);
  private xAxis: any;
  private yAxis: any;
  private xAxisG: any;
  private yAxisG: any;
  private testData: any;
  public dataset = [0, 0, 0, 0];
  public zoneDataset: object[];
  public xDomain = ['Zone1', 'Zone2', 'Zone3', 'Zone4'];
  private minMaxY = 6;
  private rectBar: any;
  private texts: any;
  // private timer: any;
  private xz: any;

  private selectedIndex: number;

  // private onStartSubscription: Subscription;
  // private onStopSubscription: Subscription;
  // private onTestSubscription: Subscription;
  // private onPauseSubscription: Subscription;
  private ononAccZone$: Subscription;
  private onAccVisitByZone$: Subscription;
  private onZoneSelected$: Subscription;
  // private chartStarted = false;

  constructor(private mapService: MapService) { }

  ngOnInit() {
    this.dataset = this.mapService.getAccVisit();
    this.zoneDataset = this.mapService.getAccVisitByZone();
    // this.getSelectedZoneIndex();
    this.initBase();
    this.initChart();
    setTimeout(() => {
      this.ononAccZone$ = this.mapService.onAccVisit.subscribe(d => this.onAccZone(d));
    }, 1000);

    this.onAccVisitByZone$ = this.mapService.onAccVisitByZone.subscribe(d => this.onSetAccVisitByZone(d));
    this.onZoneSelected$ =  this.mapService.onZoneSelected.subscribe(d => this.onBarClicked(d));
    // this.onStartSubscription = this.mapService.started.subscribe(d => this.onStart(d));
    // this.onStopSubscription = this.mapService.onStopped.subscribe(d => this.onStop(d));
    // this.onTestSubscription = this.mapService.onTest.subscribe(d => this.onTest(d));
    // this.onPauseSubscription = this.mapService.onPaused.subscribe(d => this.onPause(d));

    // if (this.mapService.mapStarted) {
    //   this.startChart();
    // }
  }

  ngOnDestroy(): void {
    // this.onStartSubscription.unsubscribe();
    // this.onStopSubscription.unsubscribe();
    // this.onTestSubscription.unsubscribe();
    // this.onPauseSubscription.unsubscribe();
    if (this.ononAccZone$) {
      this.ononAccZone$.unsubscribe();
    }

    if (this.onAccVisitByZone$) {
      this.onAccVisitByZone$.unsubscribe();
    }

    if (this.onZoneSelected$) {
        this.onZoneSelected$.unsubscribe();
    }
    // this.clearTimer();
  }

  // onStart(d: boolean): void {
  //   console.log('onStart', d);
  //   if (!d && !this.chartStarted) {
  //     return;
  //   }
  //   this.startChart();
  // }

  onAccZone(d: {data: number[], dur: boolean}) {
    const {data, dur} = d;
    this.dataset = [...data];
    this.updateChart(dur);
  }

  // startChart() {
  //   this.clearTimer();
  //   this.timer = setInterval(() => {
  //     this.rnadomData();
  //     this.updateChart();
  //   }, 1000);

  //   this.chartStarted = true;
  // }

  // onStop(d: boolean): void {
  //   console.log('onStop');
  //   this.chartStarted = false;
  //   this.clearTimer();
  // }

  // onPause(d: boolean): void {
  //   console.log('onPause');
  //   this.chartStarted = false;
  //   this.clearTimer();
  // }

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

  // clearTimer(): void {
  //   if (this.timer) {
  //     console.log('cleared');
  //     clearInterval(this.timer);
  //   }
  // }

  resetChart(): void {

  }

  updateChart(dur: boolean): void {
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
      .duration(dur ? duration1 : 0)
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
      .duration(dur ? duration1 : 0)
      .tween('text', function (d) {
        const node = this;
        const _current = node.textContent;
        const i = d3.interpolateNumber(_current, d);
        return function (t) {
          node.textContent = i(t).toFixed(1);
        };
      })
      .attr('fill', 'white')
      // .attr('dx', () => (this.xScale.bandwidth() - 30 - this.rectPadding) / 2)
      .attr('y', d => this.yScale(d) + this.padding.top)
      // .transition()
      // .delay(duration2)
      .attr('x', (d, i) => this.padding.left + this.xScale(i) - 38 + this.rectPadding / 2)
      ;

    this.svg
      .select('.X-axis')
      .selectAll('.tick')
      .transition()
      // .delay(duration1)
      .duration(dur ? duration1 : 0)
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

  // getRandomInt(min, max): number {
  //   min = Math.ceil(min);
  //   max = Math.floor(max);
  //   return Math.floor(Math.random() * (max - min)) + min;
  // }

  // rnadomData() {
  //   const randIndx = this.getRandomInt(0, 4);
  //   const randSeed = this.getRandomInt(1, 3);
  //   this.dataset[randIndx] += randSeed;
  // }

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

    this.xAxisG.style('font-size', '20px');

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
    const selectedZoneIndex = this.getSelectedZoneIndex();
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
      .attr('opacity', (da, idx) => selectedZoneIndex !== null && idx !== selectedZoneIndex ? 0.6 : 1)
      // .attr('fill', (d, i) => this.color(i))
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
      })
      .style('cursor', 'pointer');

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
        return (that.xScale.bandwidth() - 38 - that.rectPadding) / 2;
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


    this.rectBar.on('click', function (d, i) {
      d3.event.stopPropagation();
      that.rectBar.attr('opacity', (da, idx) => idx !== i ? 0.6 : 1);
      that.onBarClick(i);
    });

    this.svg.on('click', () => {
      this.onDiselectBar();
      this.rectBar.attr('opacity', (da, idx) => 1);
    });

    // this.svg.append('g').attr('class', 'g-legend');

    // const legend = this.svg
    //   .select('.g-legend')
    //   .selectAll('g')
    //   .data(this.xDomain)
    //   .enter()
    //   .append('g');

    // legend.attr('class', 'legned').attr(
    //   'transform',
    //   (d, i) =>
    //     `translate(${this.width - 90}, ${10 + (this.xDomain.length - i) * 28})`
    // );
    // // .attr("x", (d, i) => 100 * i + 100)
    // // .attr("y", 5);

    // legend
    //   .append('rect')
    //   .attr('width', 20)
    //   .attr('height', 20)
    //   .attr('fill', (d, i) => this.color(i));

    // legend
    //   .append('text')
    //   .text(d => d)
    //   .attr('x', 23)
    //   .attr('y', 15)
    //   .attr('fill', (d, i) => '#555');
  }

  onBarClicked(i: number): void {
    this.zoneDataset = this.mapService.getAccVisitByZone();
    this.rectBar.attr('opacity', (da, idx) => i !== null && idx !== i ? 0.6 : 1);
  }


  onBarClick(i: number): void {
    this.mapService.setSelectedZoneIndex(i);
    this.zoneDataset = this.mapService.getAccVisitByZone();
  }

  onDiselectBar() {
    this.mapService.diselecctZoneIndex();
  }

  getSelectedZoneIndex() {
    return this.mapService.getSelectedZoneIndex();
  }

  isBarSelected() {
    return (typeof this. getSelectedZoneIndex()) === 'number';
  }

  onSetAccVisitByZone(d) {
    if (!(d.length && d.length > 0)) {
      return;
    }
    // this.zoneDataset = d;
    this.zoneDataset = d.sort((a, b) => b.accVisit - a.accVisit);
  }

  getZoneDataset() {
    if (this.zoneDataset) {
      return [...this.zoneDataset];
    } else {
      return [];
    }
  }

  isTrHighlight(i) {
    return this.mapService.selectedTrackerId === i;
  }

  onCellClick(i) {
    this.mapService.onTrackerHasSelected(i + 1);
    this.mapService.onSelectedTracker(i + 1);
  }

}
