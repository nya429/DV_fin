import { Directive, Output, ElementRef, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter();

  constructor(private elRef: ElementRef) {
  }

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement) {
      const clickedInside = this.elRef.nativeElement.contains(targetElement);
      if (!clickedInside) {
          this.clickOutside.emit(null);
      }
  }

}
