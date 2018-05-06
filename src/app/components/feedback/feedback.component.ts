import { Component } from '@angular/core';

@Component({
  selector: 'j-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent {

  private hidden: boolean = true;
  private successStyle: boolean;
  private message: string;

  public success(message: string) {
    this.successStyle = true;
    this.flash(message);
  }

  public failure(exceptionMessage: string) {
    this.successStyle = false;
    let displayMessage: string;
    if(exceptionMessage.includes(" 409 ")) {
      displayMessage = "Action failed due to conflict";
    } else {
      displayMessage = "Action failed";
    }
    this.flash(displayMessage);
  }

  private flash(message: string) {
    this.message = message;
    this.hidden = false;
    setInterval(() => {
      this.hidden = true
      message = null;
    }, 5000);
  }
}
