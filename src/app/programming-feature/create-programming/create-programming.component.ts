import { Component, OnInit, ViewChild } from '@angular/core';
import { ProgrammingService } from '../../programming-feature/services/programming-service';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { ListItem } from '../../pfm-common-models/ListItem';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { Router } from '@angular/router';
import {FormatterUtil} from '../../util/formatterUtil';
import { FileMetaData } from '../../pfm-common-models/FileMetaData';
import { Attachment } from '../../pfm-common-models/Attachment';
import { GridApi, ColumnApi, RowNode, Column, CellPosition } from '@ag-grid-community/all-modules';
import { DataGridMessage } from '../../pfm-coreui/models/DataGridMessage';
import { AppModel } from '../../pfm-common-models/AppModel';
import { PomToasResponse, Pom,TOA } from '../models/POMToas';
import { ActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';



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
  programBudgetData:boolean;
  gridApi:GridApi;
  columnApi:ColumnApi;
  communityColumns:any[];
  selectedRowId:number;
  selectedRow:any;
  orgName:any;
  rowTotal:any;
  communityData:any;
  orgColumns:any;
  orgData:any;
  constructor(private appModel: AppModel,private programmingService:ProgrammingService, private dialogService:DialogService, private router:Router) { 
    
    //var selectedYear = appModel.selectedYear;
  
  }

  yearSelected(year:string):void{
    this.selectedYear = year;
    console.log("selected year "+ this.selectedYear);
    this.programYearSelected= Object.keys( this.selectedYear).map(key =>  this.selectedYear[key]).slice(0,1);
    console.log("selected year "+ this.programYearSelected);
    if(this.programYearSelected=="Spreadsheet"){
      this.showUploadDialog = true;
    }else{ // if it is PBYear 
      this.showUploadDialog = false;
      this.programBudgetData=true;
      
      var selectedYear = FormatterUtil.getCurrentFiscalYear()+1; 
      this.initGrids(selectedYear);
     
    }
    
   }
      
   initGrids(selectedYear){
     // set the column definitions to community adn Organization grid
     this.communityColumns =   this.setAgGridColDefs("Community",selectedYear);
     this.orgColumns = this.setAgGridColDefs("Organization",selectedYear);
     
     //this.busy = true;
     this.programmingService.getPomFromPb().subscribe(
        resp => {
       // this.busy = false;
          var pom = (resp as PomToasResponse).result ;
          console.log("year..." + pom.fy);
          this.loadGrids(pom,selectedYear);
          
      },
      error => {
          console.log("Error in getting community and org toas...");
         // this.busy = false;
      });
     this.communityData = [];
     this.orgData = [];
   }

   loadGrids(pomData:Pom,fy:number){
      // BaseLine
      let row = {}
      row["orgid"] = " Baseline";
      pomData.communityToas.forEach(toa => {
        row[toa.year] = toa.amount;
      });
      
      this.communityData.push(row);

      // Community Toas
      row = {}
      row["orgid"] = " TOA";
      pomData.communityToas.forEach((toa: TOA) => {
        row[toa.year] = toa.amount;
      });
      let i:number;
      for (i = 0; i < 5; i++) {
        if ( row[ fy+i ] == undefined ) row[ fy+i ] = 0;
      }
      this.communityData.push(row);
  }

   handleNewAttachments(newFile:FileMetaData):void{
      this.showUploadDialog = false;
      if(newFile){
        let attachment:Attachment = new Attachment();
        attachment.file = newFile;
        this.programBudgetData=true;
      }else{
        this.yearDropDown.selectedItem=this.yearDropDown.prompt;
      }
  }

  onCreateProgrammingPhase():void{
    let year:any = this.selectedYear;
  }

  ngOnInit() {
    console.log("in ngOninit");

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

private setAgGridColDefs(column1Name:string, fy:number): any {

  let colDefs = [];

  colDefs.push(
    { headerName: column1Name,
      suppressMenu: true,
      field: 'orgid',
      minWidth: 140,
      editable: false,
      //rowDrag: true,
      //rowDragManaged: true,
      valueGetter: function(params) {return params.node.rowIndex + 1;},
      //cellRenderer: params => '<strong>'+params.value+'</strong>',
      cellClass: "text-class",
     /* cellClassRules: {
      'ag-cell-footer-sum': params => {
        return params.data.orgid == 'Delta'
      }
      }*/
      cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal'}
    
  });

  for (var i = 0; i < 5; i++) {
    colDefs.push(
      { headerName: "FY" + (fy + i - 2000) ,
        type: "numericColumn",
        suppressMenu: true,
        field: (fy+ i).toString(),
        //cellRenderer: params => this.negativeNumberRenderer(params),
        editable: false,//params => this.shouldEdit(params),
        cellClass: "numeric-class",
      /*  cellClassRules: {
          minWidth: 110,
        'ag-cell-edit': params =>this.shouldEdit(params),
        'ag-cell-footer-sum': params => {
          return params.data.orgid == 'Delta'
        }
      }*/
      cellStyle: { display: 'flex', 'align-items': 'right'}
    });
  }
  colDefs.push(
    { headerName: "FY" + (fy-2000) + "-"+ "FY" + (fy+4-2000),
      type: "numericColumn",
      suppressMenu: true,
      field: 'total',
      minWidth: 110,
      editable: false,
      valueGetter: params => 100,//this.rowTotal( params.data, fy ),
     /* cellRenderer: params => '<i>'+this.negativeNumberRenderer(params)+'</i>',
      cellClassRules: {
      'ag-cell-footer-sum': params => {
        return params.data.orgid == 'Delta'
      }
    }*/
    cellClass: "numeric-class",
        cellStyle: { display: 'flex', 'align-items': 'right'}
  });

  colDefs.push(
    {
      headerName: 'Actions',
      field: 'actions',
      maxWidth: 175,
      minWidth: 175,
      cellRendererFramework: ActionCellRendererComponent
    }
  );

  return colDefs;
}

// a sinple CellRenderrer for negative numbers
private negativeNumberRenderer( params ){

  if ( params.value < 0 ){
    return '<span style="color: red;">' + this.formatCurrency( params ) + '</span>';
  } else {
    return this.formatCurrency( params );
  }
}

 // helper for currency formatting
 private formatCurrency( params ) {
  let str = Math.floor( params.value )
    .toString()
    .replace( /(\d)(?=(\d{3})+(?!\d))/g, "$1," );
  return "$ " + str;
}

// a callback for determining if a ROW is editable
private shouldEdit ( params ){
 return false;
}

onGridIsReady(params){
 /* params.api.sizeColumnsToFit();
    window.addEventListener("resize", function() {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });*/
}
onRowDragEnd(param){}

}

