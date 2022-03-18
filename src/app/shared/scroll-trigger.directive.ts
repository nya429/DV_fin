import { Directive, EventEmitter, ElementRef, HostListener, Output, Inject, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

@Directive({
  selector: '[appScrollTrigger]'
})
export class ScrollTriggerDirective {

  @Output() scrolled = new EventEmitter();

  constructor(@Inject(DOCUMENT) private document: Document,
  @ViewChild('scrollTrigger') private targetElement: ElementRef) {}


  @HostListener('window:click', [])
  onWindowScroll(targetElement) {
    console.log('s');
      const clickedInside = targetElement.nativeElement.contains(targetElement);
      if (!clickedInside) {
          this.scrolled.emit(null);
      }
  }

}
