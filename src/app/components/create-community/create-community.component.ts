import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../../generated';
import { Community } from '../../generated';

@Component({
  selector: 'app-create-community',
  templateUrl: './create-community.component.html',
  styleUrls: ['./create-community.component.css']
})
export class CreateCommunityComponent implements OnInit {

public communties: Community[] = [];

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

  constructor(
    public communityService: CommunityService
  )
    {
  }

  ngOnInit() {

    // this.communities = this.communityService.getAll();

  }

}
