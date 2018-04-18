import { Component } from '@angular/core';

@Component({
  selector: 'j-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent {

  private hidden: boolean = true;
  private message: string;

  flash(message: string) {
    this.message = message;
    this.hidden = false;
    setInterval(() => {
      this.hidden = true
      message = null;
    }, 5000);
  }
}
