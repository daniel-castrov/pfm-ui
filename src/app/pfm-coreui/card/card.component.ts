import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'pfm-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() type = 'assigned'; // assigned, outstanding, completed
  @Input() cardTitle: string;
  @Input() cardText: string;
  @Input() cardActionText: string;
  @Input() expanded: boolean;
  @Output() onToggle: EventEmitter<string> = new EventEmitter<string>();

  assigned = 'assigned';
  completed = 'completed';
  outstanding = 'outstanding';

  constructor() {}

  toggle(): void {
    this.expanded = !this.expanded;
    setTimeout(() => {
      this.onToggle.emit(this.type);
    });
  }
  ngOnInit() {}
}
