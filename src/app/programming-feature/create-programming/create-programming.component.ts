import { Component, OnInit, ViewChild } from '@angular/core';
import { ProgrammingService } from '../../programming-feature/services/programming-service';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { ListItem } from '../../pfm-common-models/ListItem';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { Router } from '@angular/router';
import {FormatterUtil} from '../../util/formatterUtil';




@Component({
  selector: 'pfm-programming',
  templateUrl: './create-programming.component.html',
  styleUrls: ['./create-programming.component.css']
})
export class CreateProgrammingComponent implements OnInit {
  @ViewChild(DropdownComponent, {static: false}) yearDropDown: DropdownComponent;

  id:string = 'create-programming-component';
  busy:boolean;
  availableYears:ListItem[];
  selectedYear:string;
  byYear:any;
  programYearSelected:any;
  showUploadDialog:boolean;

  constructor(private programmingService:ProgrammingService, private dialogService:DialogService, private router:Router) { 
    
  }

  yearSelected(year:string):void{
    this.selectedYear = year;
    this.programYearSelected= Object.keys( this.selectedYear).map(key =>  this.selectedYear[key]).slice(0,1);
    if(this.programYearSelected=="Spreadsheet"){
      this.showUploadDialog = true;
    }else{
      this.showUploadDialog = false;
    }
    
    
   }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
   handleNewAttachments(selectedFile:Event):void{
    this.showUploadDialog = false;
    const target= event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    let fileName = file.name;
    this.validateFile(fileName);
    console.log("File Attached" +fileName);
   }

  
  onCreateProgrammingPhase():void{
    let year:any = this.selectedYear;
  }

  ngOnInit() {
    this.byYear= FormatterUtil.getCurrentFiscalYear()+2;
    let pbYear:any = FormatterUtil.getCurrentFiscalYear()+1;
    this.busy = true;
    this.programmingService.pBYearExists(pbYear).subscribe(
      resp => { 
                this.busy = false;
                let pyear ="PB" + FormatterUtil.pad((pbYear-2000),2);
                let years: string[] = [pyear, "Spreadsheet"];
                this.availableYears = this.toListItem(years);
    
      },
      error =>{
                let years: string[] = ["Spreadsheet"];
                console.log("in Program create Year does not exists");
      });
 }

  private toListItem(years:string[]):ListItem[]{
    let items:ListItem[] = [];
    for(let year of years){
      let item:ListItem = new ListItem();
      item.id = year;
      item.name = year;
      item.value = year;
      items.push(item);
    }
    return items;
  }

  validateFile(name: String) {
    var ext = name.substring(name.lastIndexOf('.') + 1);
    var res:boolean = ((ext==="xls") || (ext==="xlsx"));
    if (res) {
        console.log("File attached"+name);
    }
    else {
      this.dialogService.displayError("File selected must be an Excel spreadsheet");
    }
}


}

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

