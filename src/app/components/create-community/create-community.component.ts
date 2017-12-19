import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserComponent } from '../user/user.component';
import { Observable } from 'rxjs/Observable';
import { } from '../../generated';
import { FormsModule } from '@angular/forms'


@Component({
  selector: 'app-create-community',
  templateUrl: './create-community.component.html',
  styleUrls: ['./create-community.component.css']
})
export class CreateCommunityComponent implements OnInit {

  community = {
    communityname:''
}

onSubmit({value, valid}){
 if(valid){
     console.log(value);
 } else {
     console.log('Form is invalid');
 }
}

  constructor() { }

  ngOnInit() {
  }

}
