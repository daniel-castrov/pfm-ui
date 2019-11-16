import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'pfm-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() type:string = "assigned";//assigned, outstanding, completed
  @Input() cardTitle:string;
  @Input() cardText:string;
  @Input() cardActionText:string;
  @Input() expanded:boolean;
  @Output() onToggle:EventEmitter<string> = new EventEmitter<string>()

  assigned:string = "assigned";
  completed:string = "completed";
  outstanding:string = "outstanding";

  constructor() { }

  toggle():void{
    this.expanded = !this.expanded;
    setTimeout(()=>{
      this.onToggle.emit(this.type);
    });
  }
  ngOnInit() {
    console.info(this.cardText);
  }

}
