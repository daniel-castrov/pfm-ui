import {
  AfterViewInit,
  Component,
  ComponentFactory,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef
} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, ValidatorFn } from '@angular/forms';
import {DashboardComponent} from "./dashboard/dashboard.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  modalReference: any;
  form: FormGroup;
  widgetList = [
      {name:'Demo Widget One', selected:false, id:'asdf1'},
      {name:'Demo Widget Two', selected:false, id:'asdf2'},
      {name:'Demo Widget Three', selected:false, id:'asdf3'},
      {name:'Demo Widget Four', selected:false, id:'asdf4'},
    ];

  constructor(
    private formBuilder: FormBuilder) {
    /*this.rolesvc.getRoles().subscribe(data => {
      if(data.result.includes('POM_Manager') || data.result.includes("Funds_Requstor") || data.result.includes("Budget_Manager")){
        this.widgetList.push({name:'Funding by BA for POM Phase', selected: false, id: 'asdf5'});
      }
      if(data.result.includes('POM_Manager')){
        this.widgetList.push({name:'PR Status', selected: false, id: 'asdf6'});
      }
      this.form = this.formBuilder.group({
        widgets: this.buildWidgets()
      });    
    });*/
  }

  get widgets() {
    return this.form.get('widgets') as FormArray;
  }

  buildWidgets() {
    const arr = this.widgetList.map(w=>{
      return this.formBuilder.control(w.selected,);
    })
    return this.formBuilder.array(arr);
  }


  showControl = 'none';
  toggleControls(theControl) {
    if(this.showControl === theControl) {
      this.showControl = 'none';
    } else {
      console.log(theControl);
      this.showControl = theControl;
    }
  }

  openDashboardModal(content) {
    //this.modalReference = this.modalService.open(content, { size: 'lg' });
  }

  submit(value){
    //console.log(value);
    const f = Object.assign({}, value, {
      widgets: value.widgets.map((s,i) =>{
        return{
          id: this.widgetList[i].id,
          name: this.widgetList[i].name,
          selected:s,
        }
      })
    });
    //console.log(f);
    //TODO - something like this may be best handled via emitting an event (or some other mechanism).

    //this.modalReference.close();
  }

}
