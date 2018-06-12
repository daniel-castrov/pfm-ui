import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[digits]'
})
export class OnlyDigitsDirective {
  private regex: RegExp = new RegExp(/^-?[0-9]+$/g);
  private specialKeys: string[] = ['Backspace', 'Delete', 'ArrowRight', 'ArrowLeft',
    'Tab', 'End', 'Home'];

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    //console.log('digits event');
    //console.log(event);
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.textContent;
    let next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}
