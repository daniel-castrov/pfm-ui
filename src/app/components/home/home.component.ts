import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserComponent } from '../user/user.component';
import { PexUser } from '../../generated/model/PexUser';
import { BlankApi } from '../../generated/api/BlankApi';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  fireEvent(e){
    //console.log('button clicked');
    console.log(e.type);
  }

  id: number;
  name:string;
  age:number;
  email:string;
  address:Address;
  pexUser:PexUser;
  private nothing:String;
  

  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private blankApi:BlankApi,
  ) {
    this.route.params.subscribe((params:Params) => {
      // console.log(params);
      this.id = params.id;
    });
  }

  ngOnInit() {
    console.log('OnInit ran...');

    this.hitThePage();
    console.log(this.nothing);
    this.populateUser();

  }

  onClick(){
    // console.log('hello');
    this.name='Mike';
    }

    hitThePage() {
      console.log('HomeComponent.hitThePage()');
      this.blankApi.blank().subscribe(c => this.nothing = c);
    }


    populateUser(){
      this.name = 'Elmer Fudd';
      this.age = 35;
      this.email = 'elmerfudd@domain.com';
      this.address = {
        street: '50 Main Street',
        city: 'Boston',
        state: 'MA'}
    }


    getHeaders(){
    http.get('/data.json', {observe: 'response'})
    .subscribe(resp => {
      // Here, resp is of type HttpResponse<MyJsonData>.
      // You can inspect its headers:
      console.log(resp.headers.get('X-Custom-Header'));
      // And access the body directly, which is typed as MyJsonData as requested.
      console.log(resp.body.someField);
    });
  }

  }
  
interface Address{
  street:string,
  city:string,
  state:string
}
