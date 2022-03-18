import { Directive, Renderer2, ElementRef, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[appTableStriped]'
})
export class TableStripedDirective implements OnInit {
  @Input () appTableStriped: number;

  constructor(private elRef: ElementRef,
    private renderer: Renderer2) { }

  ngOnInit() {
    if (this.appTableStriped % 2 !== 0) {
      this.renderer.setStyle(this.elRef.nativeElement, 'background-color', '#f0f0f0');
    }
  }
}
