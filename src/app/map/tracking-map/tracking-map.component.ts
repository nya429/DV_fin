import { Component, Input, ViewChild, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import * as d3 from 'd3';

import { MapService } from './../map.service';
import { Tracker } from './../../shared/tracker.model';

@Component({
  selector: 'app-tracking-map',
  templateUrl: './tracking-map.component.html',
  styleUrls: ['./tracking-map.component.css']
})
export class TrackingMapComponent implements OnInit, OnDestroy {
  @ViewChild('trackingMap') private chartContainer: ElementRef;
  private trackers: Tracker[];
  private trackersChangeSubscription: Subscription;
  private onSelectedSubscription: Subscription;
  private onHidedSubscription: Subscription;
  private onStartSubscription: Subscription;
  private onStopSubscription: Subscription;
  private onTestSubscription: Subscription;
  private popupSubscription: Subscription;
  private loadingStatusSubscription: Subscription;
  private windowResizeSubscription: Subscription;
  /** API */
  private base: {width: number, height: number};
  private margin: any = { top: 0, bottom: 0, left: 0, right: 0};
  private padding = {left: 0, right: 0, top: 0, bottom: 0};

  private chart: any;
  private svg: any;
  private rect: any;

  /** Container Dimision*/
  private divWidth: number;
  private divHeight: number;
  /** SVG dimension */
  private width: number;
  private height: number;
  /** MapScale */
  private xScale: any;
  private yScale: any;
  /** API */
  private mapPosScale: {offsetX: number, offsetY: number, scale: number};

  /** trackerPoint */
  private trackerPoints: any;
  private trackerInfoG: any;
  private trackerInfoWidth = 150;
  private trackerInfoHeight = 30;
  private selectedPoint;
   /** Popup */
  private mapPopup: any;
  private popupWidth = 250;
  private popupHeight = 150;
  /** not used */
  private colors: any;
  private xAxis: any;
  private yAxis: any;
  /** Map_img */
  // private mapBackImgViewBox;
  private mapBackImg;
  /** Map_size&pos_control */
  private mapDimensionControlPanel: any;
  // TODO this height need to change when the container changed
  private mapDimensionControlPanelSize = {width: 90, height: 500};
  /** Map_position_control */
  private mapPosControlPanel: any;
  private mapPosControlPanelSize = {width: 90, height: 90};
  private mapPosControlTimer;
  private mapPosControlInterval;
  private arrowPath = 'M 50,0 L 60,10 L 20,50 L 60,90 L 50,100 L 0,50 Z';
  /** Map_scale_control */
  private mapScaleControlPanel: any;
  private mapScaleControlPanelSize = {width: 90, height: 200, paddingTop: 10, paddingBottom: 10};
  private draggerActiveLine: any;
  private scaleDragger: any;
  private mapPosScaleTimer: any;

  constructor(private mapService: MapService) { }

  ngOnInit() {
    this.getMapSettings();
    this.createBase();
    this.onStartSubscription = this.mapService.onStarted.subscribe(() => this.onStart());
    this.onStopSubscription = this.mapService.onStopped.subscribe(() => this.onStop());
    this.onTestSubscription = this.mapService.onTest.subscribe(() => this.onTest());
    this.popupSubscription = this.mapService.onLoading.subscribe(() => {
      this.onPopup('Loading...');
    });
    // TODO Check rxjs
    this.loadingStatusSubscription = this.mapService.onLoaded.subscribe(status => {
      if (status) {
        this.onPopupFade(false);
      } else {
        this.onPopup('Loading Failed');
        this.onPopupFade(true);
      }
    });
    this.windowResizeSubscription = this.mapService.windowResized.subscribe(() => this.mapResize());
  }

  ngOnDestroy() {
    this.onStop();
    this.onStartSubscription.unsubscribe();
    this.onStopSubscription.unsubscribe();
    this.onTestSubscription.unsubscribe();
    this.popupSubscription.unsubscribe();
    this.loadingStatusSubscription.unsubscribe();
    this.windowResizeSubscription.unsubscribe();
    clearTimeout(this.mapPosControlTimer);
    clearInterval(this.mapPosControlInterval);
  }

  onStop() {
    if (this.mapService.mapStarted) {
      this.onPopup('Map Stopped');
      this.onPopupFade(true);
    }
    this.mapService.stopService();
    if (this.trackersChangeSubscription) {
      this.trackersChangeSubscription.unsubscribe();
    }
    if (this.onSelectedSubscription) {
      this.onSelectedSubscription.unsubscribe();
    }
    if (this.onHidedSubscription) {
      this.onHidedSubscription.unsubscribe();
    }

    this.removeTrackerInfo();
    this.removePoint();
  }

  onStart() {
    this.mapService.mapStopped = false;
    this.mapService.stopped.next(false);
    if (!this.mapService.mapInitiated) {
      this.mapService.mapInitiated = true;
      // button observable
      this.mapService.intiated.next(true);
      this.trackers = this.mapService.getTrackers();
      this.initiateTrackPoint(this.trackers);
      this.mapService.move();
    }

    if (this.mapService.mapStarted) {
      this.mapService.mapStarted = false;
      this.mapService.started.next(false);
      this.trackersChangeSubscription.unsubscribe();
      this.mapService.pause();
    } else {
      this.mapService.mapStarted = true;
      this.mapService.started.next(true);
      this.mapService.move();
      this.trackersChangeSubscription = this.mapService.trackerLocChanges.subscribe(
        (trackers: Tracker[]) => {
          // console.log(this.trackers[0].xCrd);
          this.trackers = trackers;
          this.refreshTrackers();       // FIXME solove muttable copy issue;
          this.movePoint(this.trackers);
        }
      );
    }
    this.onSelectedSubscription = this.mapService.selectedTrackerIndex.subscribe(
      id => this.onPointSelected(id)
    );
    this.onHidedSubscription = this.mapService.hideTrackerIndex.subscribe(
      id => this.onPointHided(id)
    );
  }

  onTest() {
    this.mapService.mapStopped = false;
    this.mapService.stopped.next(false);
    if (!this.mapService.mapInitiated) {
      this.mapService.mapInitiated = true;
      this.mapService.intiated.next(true);
      this.trackers = this.mapService.getTrackers();
      this.initiateTrackPoint(this.trackers);
      this.mapService.testMove();
    }
    if (this.mapService.mapStarted) {
      this.mapService.mapStarted = false;
      this.mapService.started.next(false);
      this.trackersChangeSubscription.unsubscribe();
    } else {
      this.mapService.mapStarted = true;
      this.mapService.started.next(true);
      this.trackersChangeSubscription = this.mapService.trackerLocChanges.subscribe(
        (trackers: Tracker[]) => {
          this.trackers = trackers;
          this.refreshTrackers();       // FIXME solove muttable copy issue;
          this.movePoint(this.trackers);
        }
      );
    }
    this.onSelectedSubscription = this.mapService.selectedTrackerIndex.subscribe(
      id => this.onPointSelected(id)
    );
    this.onHidedSubscription = this.mapService.hideTrackerIndex.subscribe(
    id => this.onPointHided(id)
  );
  }

  getMapSettings() {
    const {base, mapPosScale} = this.mapService.getMapSettings();
    this.base = base;
    this.mapPosScale = mapPosScale;
  }

  createBase() {
    const element = this.chartContainer.nativeElement;
    this.getContainerDimension(element);
    this.getSVGDimension();
    this.initMapScale();
    this.appendSVG(element);
    this.sizeSVG();
    this.appendRect();
    // this.appendMapBackgroundImgViewBox(element);
    this.appendMapBackgroundImg();
    this.attachPopup();
    this.appendMapDimensionPanel();
    // this.appendmapPosControlPenal();
    // this.appendMapScaleControlPenal();
    this.svg.on('click', () => this.diselecPoint());     //  Add trackerPoint Info ouside click dismiss
  }

  getContainerDimension(element) {
    this.divWidth = element.offsetWidth;
    this.divHeight = element.offsetHeight;
  }

  getSVGDimension() {
    this.width = this.divWidth - this.margin.left - this.margin.right;
    this.height = this.divHeight - this.margin.top - this.margin.bottom;
  }

  initMapScale() {
    this.xScale = d3.scaleLinear()
      .domain([0, this.base.width])
      /**
       * 615 = this.width - (this.width - imgWidth)
       */
      .range([(615 / 2) * (1 - this.mapPosScale.scale) + this.mapPosScale.offsetX,
         (615 / 2) * (1 + this.mapPosScale.scale)  + this.mapPosScale.offsetX - this.padding.left - this.padding.right]);
    this.yScale = d3.scaleLinear()
      .domain([0, this.base.height])
      // API
      .range([(this.height / 2) * (1 - this.mapPosScale.scale) + this.mapPosScale.offsetY,
        (this.height / 2) * (1 + this.mapPosScale.scale)  + this.mapPosScale.offsetY - this.padding.top - this.padding.bottom]);
  }

  appendSVG(element) {
    d3.select(element).append('svg')
    .attr('class', 'trackerMapBase');
    this.svg = d3.select('svg');
  }

  /**   SVG  dimension  */
  sizeSVG() {
    this.svg
      .attr('width', this.width)
      .attr('height', this.height);
  }

  /**   RECT  dimension  */
  appendRect() {
    this.svg.append('rect');
    this.rect = d3.select('rect');

    this.rect
      .attr('class', 'trackerMapBaseRect')
      /** this is the place probably I want to use this.width -margin.top and this height  */
      .attr('width', this.width)
      .attr('height', this.height)
      /* -------------------------------------*/
      // .style('stroke', 'cadetblue')
      // .style('stroke-width', 5)
      .attr('fill', 'white')
      .transition()
      .duration(1000)
      .attr('fill', 'darkslategray');
  }

  sizeRect() {
    this.rect
    .attr('width', this.width)
    .attr('height', this.height);
  }


//   appendMapBackgroundImgViewBox(element) {
//     this.svg.selectAll('svg').data([0]).enter()
//     .append('svg')
//     .attr('class','mapImgViewBox')
//     .attr('width', element.offsetWidth)
//     .attr('height', element.offsetHeight)
//     .attr('x', 0)
//     .attr('y', 0)
//     // .attr('preserveAspectRatio', 'xMinYMin meet')
// ;

//     this.mapBackImgViewBox = this.svg.select('.mapImgViewBox');
//   }

  // resizeMapBackgroundImgViewBox(element) {
  //   this.mapBackImgViewBox
  //   .attr('width', element.offsetWidth)
  //   .attr('height', element.offsetHeight);
  // }

  appendMapBackgroundImg() {
    // this.svg.select('.mapImgViewBox')
    this.svg.selectAll('svg').data([0]).enter()
      .append('svg:image')
      .attr('class', 'mapImg');

    this.mapBackImg = d3.select('.mapImg');
    this.mapBackImg
    // svg:image will not overwrite the inline preserveAspectRatio
    .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('xlink:href', '../../../assets/store_floorplan.svg')
      // API: position
      .attr('x', 0)
      .attr('y', 0)
      .attr('x',   (615 / 2) * (1 - this.mapPosScale.scale) + this.mapPosScale.offsetX)
      .attr('y', (500 / 2) * (1 - this.mapPosScale.scale) + this.mapPosScale.offsetY)
      // API: dimensions
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('width', this.width * this.mapPosScale.scale)
      .attr('height', this.height * this.mapPosScale.scale)
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .delay(500)
      .attr('opacity', .6);

  }

  sizeBackImg(offsetWidth, offsetHeight, dur = 10) {
    this.mapBackImg
      .transition()
      .duration(dur)
      // .attr('x', 0 + this.mapPosScale.offsetX)
      // .attr('y', 0 + this.mapPosScale.offsetY)
      .attr('x',   (615 / 2) * (1 - this.mapPosScale.scale) + this.mapPosScale.offsetX)
      .attr('y', (500 / 2) * (1 - this.mapPosScale.scale) + this.mapPosScale.offsetY)
      // API: dimensions
      .attr('width', offsetWidth)
      .attr('height', offsetHeight)
      .attr('width', offsetWidth * this.mapPosScale.scale)
      .attr('height', offsetHeight * this.mapPosScale.scale)
      ;
  }

  initiateTrackPoint(trackers: Tracker[]) {
    const that = this;

    this.trackerPoints = this.svg.insert('g')
      .selectAll('g')
      .data(() => that.trackers)
      .enter().append('circle');

    this.trackerPoints.on('mouseover', function(d, i) {
        if (that.mapService.mapStopped) {
          return false;
        }
       const thisPoint = d3.select(this);
       that.onMouseOverTracker(thisPoint);
    })
    .on('mouseout', function(d, i) {
      if (that.mapService.mapStopped) {
        return false;
      }

      const thisPoint = d3.select(this);
      if (thisPoint.datum().selected) {
        return false;
      } else {
        that.onMouseoutTracker(thisPoint);
      }
    })
    .on('click', function() {
      if (that.mapService.mapStopped) {
        return false;
      }

      if (!d3.select(this).datum().isActivated()) {
        return false;
      }
      d3.select(this).raise();
      that.selectedPoint = d3.select(this);
      that.onMouseClickTracker();
    });

    this.trackerPoints.attr('class', 'trackerPoint')
      .attr('cx', d => this.xScale(d.xCrd) + this.padding.left)
      .attr('cy', d => this.yScale(d.yCrd)  + this.padding.top)
      .style('cursor', 'pointer')
      .transition()
      .duration(700)
      .ease(d3.easeQuadOut)
      .attr('r', d => d.isActivated() ? 5 : 0)
      .style('fill-opacity', 0.7)
      .style('fill', d => d.color)
      .style('stroke', 'white')
      .style('stroke-opacity', 0.5)
      .style('stroke-width', 2);
  }

  movePoint(trackers: Tracker[], dur = 1000) {
    this.trackerPoints.data(trackers)
    .transition()
    .duration(dur)
    .ease(d3.easeLinear)
    .style('fill', d => d.color)
    /** point steps */
    .attr('cx', d => this.xScale(d.xCrd))
    .attr('cy', d => this.yScale(d.yCrd));

    if (this.mapService.mapStarted && this.trackerInfoG && this.selectedPoint ) {
      const x = this.selectedPoint.datum().xCrd;
      const y = this.selectedPoint.datum().yCrd;
      this.trackerInfoG.select('.trackerInfoText').text(d => `${d.alias} (${Math.floor(x)}, ${Math.floor(y)})`);
      this.trackerInfoG
      // .datum(this.selectedPoint.datum())
       .transition()
         .duration(dur)
        //  .attr('transform', d => `translate(${this.xScale(x - d.xCrd)}, ${this.yScale(y - d.yCrd)} )`);
        .attr('x', d => this.xScale(x) - this.trackerInfoWidth / 2 + this.padding.left)
        .attr('y', d => this.yScale(y) - this.trackerInfoHeight * 2 + 10 + this.padding.top);
    }
  }

  removePoint() {
    const trackerPoints = d3.selectAll('.trackerPoint');
    trackerPoints.transition(700)
    .ease(d3.easeLinear)
    .attr('r', 0);

    // TODO: replace this with Async state condition
    setTimeout(() => {
      trackerPoints.remove();
      this.mapService.mapStopping = false;
      this.mapService.stopping.next(false);
    }, 800);
  }

   onMouseOverTracker(trackerPoint) {
    trackerPoint
    .transition(500)
    .ease(d3.easeQuadIn)
    .style('fill-opacity', 1)
    .attr('r', 10)
    .style('stroke-opacity', 1)
    .style('stroke-width', 5);
   }

   onMouseoutTracker(trackerPoint) {
    trackerPoint
    .style('fill-opacity', 0.7)
    .transition(1000)
    .ease(d3.easeQuadIn)
    .attr('r', 5)
    .style('stroke-opacity', 0.5)
    .style('stroke-width', 2);
   }

   onMouseClickTracker() {
     this.selectedPoint.datum().selected = true;
     this.mapService.onTrackerHasSelected(this.selectedPoint.datum().id);
     this.onMouseOverTracker(this.selectedPoint);
      // TODO: delete this condition, when deep copy complete
     if (this.trackerInfoG && this.selectedPoint && this.trackerInfoG.datum().id !== this.selectedPoint.datum().id) {
        this.removeTrackerInfo();
     }

     this.diselectOtherPoints();
     this.attachRect();
     if (d3.event) {
      d3.event.stopPropagation();
     }
   }

   diselecPoint() {
      if (this.selectedPoint) {
        this.removeTrackerInfo();
        if (this.selectedPoint.datum().isActivated()) {
          this.onMouseoutTracker(this.selectedPoint);
        }
        this.selectedPoint.datum().selected = false;
        this.selectedPoint = null;
        this.mapService.onTrackerHasSelected(null);
      }
   }

   diselectOtherPoints() {
      const otherSelectedElements = d3.selectAll('.trackerPoint')
        .filter(d => this.selectedPoint.datum() !== d && d.selected === true && d.isActivated());
      if (otherSelectedElements.data().length) {
          otherSelectedElements.data().map(point => point.selected = false);
          this.onMouseoutTracker(otherSelectedElements);
      }
   }

   hidePoint(selectPoint) {
    selectPoint.transition(1000)
       .ease(d3.easeLinear)
       .attr('r', 0)
       .style('fill-opacity', 0.7)
       .style('stroke-width', 2);
   }

   attachRect() {
    // TODO: delete this condition, when deep copy complete
    if (this.trackerInfoG) {
      return false;
    }
    const that = this;
    this.trackerInfoG = this.svg
        // .insert('g')
        .append('svg')
        .datum(JSON.parse(JSON.stringify(this.selectedPoint.datum())))
        .attr('class', 'trackerInfo')
        .attr('width', this.trackerInfoWidth)
        .attr('height', this.trackerInfoHeight)
        .attr('x', d => this.xScale(d.xCrd) - this.trackerInfoWidth / 2 + this.padding.left)
        .attr('y', d => this.yScale(d.yCrd) - this.trackerInfoHeight * 2 + 10 + this.padding.top)
        .attr('viewBox', `0,0,${this.trackerInfoWidth}, ${this.trackerInfoHeight}`);

    this.trackerInfoG.insert('rect')
        .attr('class', 'trackerInfoRect')
        .style('fill', 'dodgerblue')
        .style('fill-opacity', 0.4)
        .attr('width', this.trackerInfoWidth)
        .attr('height', this.trackerInfoHeight)
        // .attr('x', d => this.xScale(d.xCrd) - this.trackerInfoWidth / 2 + this.padding.left)
        // .attr('y', d => this.yScale(d.yCrd) - this.trackerInfoHeight * 2 + 10 + this.padding.top)
        .attr('x', 0)
        .attr('y',  0)
        .attr('rx', 5)
        .attr('ry', 5);
    this.trackerInfoG.insert('text')
        .attr('class', 'trackerInfoText')
        .text(d => `${d.alias} (${Math.floor(d.xCrd)}, ${Math.floor(d.yCrd)})`)
        // .style('text-anchor', 'middle')
        .style('text-anchor', 'middle')
        .style('font-size', '16px')
        .attr('fill', 'white')
        .attr('font-weight', 'bolder')
        // .attr('x', d => this.xScale(d.xCrd) + this.padding.left)
        // .attr('y', d => this.yScale(d.yCrd) - this.trackerInfoHeight + this.padding.top)
        .attr('x', this.trackerInfoWidth / 2)
        .attr('y', this.trackerInfoHeight * 3 / 4);
   }

   removeTrackerInfo() {
      this.svg.select('.trackerInfo').remove();
      this.trackerInfoG = null;
   }

   onPointSelected(id: number) {
      if (!this.mapService.mapInitiated) {
          return false;
      }

      const point = this.trackerPoints.filter(
         d => d.id === id && d.isActivated()
      );

      if (point.empty()) {
          return false;
      } else {
        this.selectedPoint = point;
        this.onMouseClickTracker();
      }
   }

   onPointHided(id: number) {
      if (!this.mapService.mapInitiated) {
          return false;
      }

      const point = this.trackerPoints.filter(
          d => d.id === id
      );

      if (this.trackerInfoG && this.trackerInfoG.datum().id === id) {
          // this.selectedPoint = null;
          this.removeTrackerInfo();
      }
      if (!point.datum().isActivated()) {
         this.hidePoint(point);
      } else if (this.selectedPoint && point.datum().id === this.selectedPoint.datum().id) {
         this.onMouseClickTracker();
      } else {
        this.onMouseoutTracker(point);
      }
 }

  refreshTrackers() {
     this.trackerPoints.data(this.trackers);
  }

  attachPopup() {
    if (this.mapPopup) {
      return false;
    }

    const that = this;
    this.mapPopup = this.svg.insert('g')
      .attr('class', 'mapPopup')
      .style('opacity', 0);

    this.mapPopup.insert('rect')
      .attr('class', 'popupBackground')
      .style('fill', 'black')
      .style('fill-opacity', .4)
      .attr('width', this.popupWidth)
      .attr('height', this.popupHeight)
      .attr('x', this.width / 2 - this.popupWidth / 2)
      .attr('y', this.height / 2 - this.popupHeight / 2 )
      .attr('rx', 5)
      .attr('ry', 5);
    this.mapPopup.insert('text')
      .attr('class', 'popupText')
      .style('opacity', .8)
      .style('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-weight', 'bolder')
      .attr('font-size', '24px')
      .attr('x', this.width / 2 )
      .attr('y', this.height / 2 + 10 );
  }

  positionPopup() {
    this.mapPopup.select('.popupBackground')
    .attr('width', this.popupWidth)
    .attr('height', this.popupHeight)
    .attr('x', this.width / 2 - this.popupWidth / 2)
    .attr('y', this.height / 2 - this.popupHeight / 2 );

    this.mapPopup.select('.popupText')
    .attr('x', this.width / 2 )
    .attr('y', this.height / 2 + 10 );
  }

  onPopup(text: string) {
    if (!this.mapPopup) {
      return false;
    }
      this.onPopupChange(text);

      this.mapPopup
      .transition(100)
      .ease(d3.easeLinear)
      .style('opacity', 1);
  }

  onPopupChange(text: string) {
    if (!this.mapPopup) {
      return false;
      }
    this.mapPopup.select('.popupText')
    .text(text);
  }

  onPopupFade(delay: boolean) {
    if (!this.mapPopup) {
      return false;
      }
    this.mapPopup
    .transition(500)
    .ease(d3.easeLinear)
    .delay(d => delay ? 800 : 0)
    .style('opacity', 0);
  }

  mapResize() {
    const element = this.chartContainer.nativeElement;
    if (element.offsetWidth === this.divWidth && element.offsetHeight === this.divHeight) {
      return;
    }
    // console.log('DEBUG => map resize ');
    // console.log('Width=>', element.offsetWidth, "Height=>", element.offsetHeight);
    // this.onStop();
    this.getContainerDimension(element);
    this.getSVGDimension();
    this.initMapScale();
    this.sizeSVG();
    this.sizeRect();
    this.sizeBackImg(element.offsetWidth, element.offsetHeight);
    this.positionPopup();
    // this.resizeMapBackgroundImgViewBox(element)
    this.rePositionMapDimensionPanel();
  }

  appendMapDimensionPanel() {
    this.svg
    .insert('svg')
    .attr('class', 'mapDimensionControlPanel')
    .attr('x', this.width - this.mapDimensionControlPanelSize.width)
    .attr('y', 0)
    .attr('width', this.mapDimensionControlPanelSize.width)
    .attr('height', this.mapDimensionControlPanelSize.height)
    .style('opacity', 0)
    .transition()
    .duration(1000)
    .delay(500)
    .style('opacity', 1);

    this.mapDimensionControlPanel =  d3.select('.mapDimensionControlPanel');
    this.appendmapPosControlPenal();
    this.appendMapScaleControlPenal();
  }

  rePositionMapDimensionPanel() {
    this.mapDimensionControlPanel
      .attr('x', this.width - this.mapDimensionControlPanelSize.width)
      .attr('y', 0);
  }

  appendmapPosControlPenal() {
    /** determin 3 x 3 dimension */
    const penalWidth31 = this.mapPosControlPanelSize.width / 3;
    const penalWidth32 = this.mapPosControlPanelSize.width / 3 * 2;
    const penalHeight31 = this.mapPosControlPanelSize.height / 3;
    const penalHeight32 = this.mapPosControlPanelSize.height / 3 * 2;

    /** set 4 Position buttons' data */
    const buttonDate = [
      {'id': 'mapPosControlUp',
      'operation' : 'up',
      'x': penalWidth31,
      'y': 0,
      'transform': 'translate(100,20) rotate(90)'},
      {'id': 'mapPosControlRight',
      'operation' : 'right',
      'x': penalWidth32,
      'y': penalHeight31,
      'transform': 'translate(80,100) rotate(180)'},
      {'id': 'mapPosControlDown',
      'operation' : 'down',
      'x': penalWidth31,
      'y': penalHeight32,
      'transform': 'translate(0, 80) rotate(270)'},
      {'id': 'mapPosControlLeft',
      'operation' : 'left',
      'x': 0,
      'y': penalHeight31,
      'transform': 'translate(20,0)'},
    ];

    /** create 4 Position buttons wrapper */
    this.mapDimensionControlPanel
      .insert('svg')
      .attr('class', 'mapPosControlPanel')
      // .attr('x', this.width - this.mapPosControlPanelSize.width)
      .attr('x', 0)
      .attr('y', this.mapDimensionControlPanelSize.height * 5 / 6 - this.mapPosControlPanelSize.height)
      .attr('width', this.mapPosControlPanelSize.width)
      .attr('height', this.mapPosControlPanelSize.height);
      // .style('opacity', 0)
      // .transition()
      // .duration(1000)
      // .delay(500)
      // .style('opacity', 1);

    this.mapPosControlPanel = d3.select('.mapPosControlPanel');

    const that = this;
    /**  create button base */
    const buttons = this.mapPosControlPanel.insert('g')
      .attr('class', 'mapPosButtonGroup')
      .selectAll('.mapPosButtonGroup')
      .data(() => buttonDate)
      .enter()
      .append('svg')
      .attr('class',    'mapPosControlButton')
      .attr('id',        d => d.id)
      .attr('x',         d => d.x)
      .attr('y',         d => d.y)
      .attr('width',     penalWidth31)
      .attr('height',    penalWidth31)
      .attr('viewBox',   '0, 0, 100, 100')
      .style('fill-opacity', .6)
      .style('cursor', 'pointer');

    /**  create button base */
    buttons
      .append('rect')
      .attr('class',     'mapPosControlButtonBack')
      .style('fill',     'black')
      .attr('width',      100)
      .attr('height',     100)
      .attr('rx',         15)
      .attr('ry',         15);

    /**  create button arrow */
    buttons
      .append('svg')
      .attr('class',     'mapPosControlButtonArrow')
      .attr('x',          15)
      .attr('y',          15)
      .attr('width',      70)
      .attr('height',     70)
      .attr('viewBox',    '0, 0, 100, 100')
      .append('path')
      .attr('d',          that.arrowPath)
      .style('fill',      'white')
      .attr('transform',  d => d.transform);

    buttons
    .on('mouseover', function(d, i) {
        const thisButton = d3.select(this);
        that.onMouseOverMapPosButton(thisButton);
    })
    .on('mouseout', function(d, i) {
      const thisButton = d3.select(this);
      that.onMouseOutMapPosButton(thisButton);
    })
    .on('mousedown', function(d, i) {
      const thisButton = d3.select(this);
      that.onMouseDownMapPosButton(thisButton, d);
    })
    .on('mouseup', function(d, i) {
      const thisButton = d3.select(this);
      that.onMouseUpMapPosButton(thisButton, d);
    });
  }

  onMouseOverMapPosButton(mapPosButton) {
    mapPosButton
      .transition(100)
      .style('fill-opacity', .8)
      .select('.mapPosControlButtonArrow')
      .attr('x',          12)
      .attr('y',          12)
      .attr('width',      76)
      .attr('height',     76);
  }

  onMouseOutMapPosButton(mapPosButton) {
    clearTimeout(this.mapPosControlTimer);
    clearInterval(this.mapPosControlInterval);
    mapPosButton
      .transition(100)
      .style('fill-opacity', .6)
      .select('.mapPosControlButtonArrow')
      .attr('x',          15)
      .attr('y',          15)
      .attr('width',      70)
      .attr('height',     70);
  }

  onMouseDownMapPosButton(mapPosButton, datum) {
    clearTimeout(this.mapPosScaleTimer);
    const duration = 10;
    mapPosButton
      .transition(30)
      .style('fill-opacity', .4)
      .select('.mapPosControlButtonArrow')
      .attr('x',          15)
      .attr('y',          15)
      .attr('width',      70)
      .attr('height',     70);
    this.positionMap(datum.operation, duration);
    this.mapPosControlTimer = setTimeout(() => {
      this.mapPosControlInterval = setInterval(() =>
        this.positionMap(datum.operation, duration), duration);
    }, 500);
  }

  onMouseUpMapPosButton(mapPosButton, datum) {
    clearTimeout(this.mapPosControlTimer);
    clearInterval(this.mapPosControlInterval);
    // const duration = 100;

    mapPosButton
      .transition(30)
      .style('fill-opacity', .8)
      .select('.mapPosControlButtonArrow')
      .attr('x',          12)
      .attr('y',          12)
      .attr('width',      76)
      .attr('height',     76);

      this.onMapPosScaleChanged();
      // this.positionMap(datum.operation, duration);
  }

  positionMap(operation: string, duration: number) {
    const step = 10;

    switch (operation) {
      case 'up':
        this.mapPosScale.offsetY -= step;
        break;
      case 'right':
        this.mapPosScale.offsetX += step;
        break;
      case 'down':
       this.mapPosScale.offsetY += step;
       break;
      case 'left':
        this.mapPosScale.offsetX -= step;
        break;
      default:
        break;
    }

    this.initMapScale();
    const element = this.chartContainer.nativeElement;
    this.sizeBackImg(element.offsetWidth, element.offsetHeight, duration);
    if (!this.mapService.mapStopped) {
      this.movePoint(this.trackers, duration);
    }
  }

  appendMapScaleControlPenal() {
    const process = 100 ;

    this.mapDimensionControlPanel
    .insert('svg')
    .attr('class', 'mapScaleControlPanel')
    .attr('x', 0)
    .attr('y', this.mapDimensionControlPanelSize.height / 6 )
    .attr('width', this.mapScaleControlPanelSize.width)
    .attr('height', this.mapScaleControlPanelSize.height)
    .attr('viewBox',   '0, 0, 90, 200')
    .style('opacity', 0)
    .transition()
    .duration(1000)
    .delay(500)
    .style('opacity', .6);

    this.mapScaleControlPanel = d3.select('.mapScaleControlPanel');


    // this.mapScaleControlPanel.append('rect')
    // .attr('x', 0)
    // .attr('y', 0)
    // .attr('width', 90)
    // .attr('height', 200)
    //   .style('stroke', 'cadetblue')
    //   .style('stroke-width', 1)

    const that = this;
    const draggerLines = this.mapScaleControlPanel.insert('g')
    .attr('class', 'mapScaleDragger')
    .style('cursor', 'pointer');
    
    draggerLines.append('line')
    .attr('id', 'mapScaleControlLineSlot')
    .attr('x1',          this.mapScaleControlPanelSize.width / 2)
    .attr('x2',          this.mapScaleControlPanelSize.width / 2)
    .attr('y1',         this.mapScaleControlPanelSize.paddingTop)
    .attr('y2',         this.mapScaleControlPanelSize.height - this.mapScaleControlPanelSize.paddingBottom)
    .attr('stroke',     'black')
    .attr('stroke-width',    3)
    // .style('fill-opacity', .6)

    // this.mapPosScale.scale = (y) / ((this.mapScaleControlPanelSize.height) / 2);

    const y = this.mapPosScale.scale  * ((this.mapScaleControlPanelSize.height) / 2)
    this.draggerActiveLine = draggerLines
    .append('line')
    .attr('id', 'mapScaleControlLineActive')
    .attr('x1',          this.mapScaleControlPanelSize.width / 2)
    .attr('x2',          this.mapScaleControlPanelSize.width / 2)
    .attr('y1',         this.mapScaleControlPanelSize.height - process)
    .attr('y1',         y)
    .attr('y2',         this.mapScaleControlPanelSize.height - this.mapScaleControlPanelSize.paddingBottom)
    .attr('stroke',     'white')
    .attr('stroke-width',    3)
    .style('fill-opacity', .6);

    this.scaleDragger = draggerLines
    .append('circle')
    .attr('id', 'mapScaleControlDragger')
    .attr('cx', this.mapScaleControlPanelSize.width / 2)
    .attr('cy', this.mapScaleControlPanelSize.height - process)
    .attr('cy', y)
    .attr('r', 5)
    .style('fill',      'white');

  draggerLines
  .on('mouseover', function(d, i) {
      const dragger = d3.select(this);
      that.onMouseoverDragger(dragger);
  })
  .on('mouseout', function(d, i) {
    const dragger = d3.select(this);
    that.onMouseoutDragger(dragger);
  })
  // .on('mousedown', function(d, i) {
  //   const dragger = d3.select(this);
  //   that.onMouseClickDragger(dragger);
  // })
  // .on('mouseup', function(d, i) {
  //   const thisButton = d3.select(this);
  //   that.onMouseUpMapPosButton(thisButton, d);
  //   });

  this.scaleDragger.call(
    d3.drag()
    .on('start', d => this.scaleDragstarted(d))
    .on('drag', d => this.scaleDragged(d))
    .on('end', d => this.scaleDragended(d))
    );
  }

  scaleDragstarted(d) {
    clearTimeout(this.mapPosScaleTimer);
    this.scaleDragger
    .transition()
    .duration(50)
    .attr('r', 7);
  }

  scaleDragged(d) {
    this.scaleDragger
    .attr('cy', d => this.calDraggerHeight(d));
    this.draggerActiveLine
    .attr('y1', d => this.calDraggerHeight(d));

    this.initMapScale();
    const element = this.chartContainer.nativeElement;
    this.sizeBackImg(element.offsetWidth, element.offsetHeight, 10);
    if (!this.mapService.mapStopped) {
      this.movePoint(this.trackers, 10);
    }
  }

  scaleDragended(d) {
    this.scaleDragger
    .transition()
    .duration(50)
    .attr('r', 5);

    this.onMapPosScaleChanged();
  }

  onMouseoverDragger(dragger) {
    this.mapScaleControlPanel
    .transition()
    .duration(100)
    .style('opacity', .8);
  }

  onMouseoutDragger(dragger) {
    this.mapScaleControlPanel
    .transition()
    .duration(100)
    .style('opacity', .6);
  }

  calDraggerHeight(d) {
    let y = d3.event.y;

    if (y >= this.mapScaleControlPanelSize.height - this.mapScaleControlPanelSize.paddingBottom) {
      y =  this.mapScaleControlPanelSize.height - this.mapScaleControlPanelSize.paddingBottom;
    }

    if (y <= this.mapScaleControlPanelSize.paddingTop ) {
      y = this.mapScaleControlPanelSize.paddingTop;
    }

    /** calculate = 9 */
    this.mapPosScale.scale = (y) / ((this.mapScaleControlPanelSize.height) / 2);
    return y;
  }

  onMapPosScaleChanged() {
    this.mapPosScaleTimer = setTimeout(() => {
      this.mapService.updateMapSettings(this.mapPosScale);
    }, 500);
  }
}
