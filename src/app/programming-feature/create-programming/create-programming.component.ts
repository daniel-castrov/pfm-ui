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
import { ActionCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { Action } from '../../pfm-common-models/Action';
import { TOA } from '../models/TOA';
import {Pom} from '../models/Pom';
import {PomToasResponse} from '../models/PomToasResponse';
import { Organization } from '../../pfm-common-models/Organization';



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
  communityGridApi:GridApi;
  orgGridApi:GridApi;
  subToasGridApi:GridApi;
  columnApi:ColumnApi;
  subToaColumnApi:ColumnApi;
  communityColumns:any[]; 
  communityData:any;
  orgColumns:any;
  orgData:any;
  subToasColumns:any;
  subToasData:any;
  
  orgs:Array<Organization>;
  constructor(private appModel: AppModel,private programmingService:ProgrammingService, private dialogService:DialogService, private router:Router) { 
    
    //var selectedYear = appModel.selectedYear;
    this.subToasColumns =[];
    this.subToasData = [];

    programmingService.getAllorganizations().subscribe(
      resp => {
                this.orgs = (resp as any).result;               
              },
      error => {
          this.orgs = [];
          console.log(error);
      });
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
     this.subToasColumns = this.setSubToasAgGridColDefs(selectedYear);
     
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
      let toarow = {};
      this.subToasData = [];
      // BaseLine
      let row = {}
      row["orgid"] = "<strong><span>&nbsp;&nbsp;Baseline</span></strong>";
      pomData.communityToas.forEach(toa => {
        row[toa.year] = toa.amount;
      });
      
      let  actions = new Action();
      actions.canDelete = false;
      actions.canEdit = true;
      actions.canSave = true;
      actions.canUpload = false;

      row["actions"] = actions;
      this.communityData.push(row);

      // Community Toas
      row = {}
      row["orgid"] = "<strong><span>&nbsp;&nbsp;TOA</span></strong>";
      toarow['orgid'] = "<strong><span>&nbsp;&nbsp;sub TOA </span></strong>";
      pomData.communityToas.forEach((toa: TOA) => {
        row[toa.year] = toa.amount;        
      });
      
      let i:number;
      for (i = 0; i < 5; i++) {         
        if ( row[ fy+i ] == undefined ) row[ fy+i ] = 0;

        toarow[fy+i] = row[ fy+i ] ;
      }      

      row["actions"] = actions;
      
      this.communityData.push(row);
      this.subToasData.push(toarow);

      this.communityData.forEach( row => {        
        for (i = 0; i < 5; i++) {
          if ( row[ fy+i ] == undefined ) {
            row[ fy+i ] = 0;
            }          
          }       
        });
                

      this.communityGridApi.setRowData(this.communityData);
      this.communityGridApi.setColumnDefs(this.communityColumns);

      // Org TOAs      
     Object.keys(pomData.orgToas).reverse().forEach(key => {          
          row = {};          
          row['orgid'] = "<strong><span>&nbsp;&nbsp;" + this.getOrgName(key) +"</span></strong>";
          pomData.orgToas[key].forEach( (toa:TOA) => {
            row[toa.year] = toa.amount;          
           });

        row["actions"] = actions;
        this.orgData.push(row);     
      });
      
      this.orgData.forEach( row => {        
      for (i = 0; i < 5; i++) {
        if ( row[ fy+i ] == undefined ) {
          row[ fy+i ] = 0;
          }          
        }       
      });      

      toarow = {};
      toarow['orgid'] = "<strong><span>&nbsp;&nbsp;sub TOA actual</span></strong>";
      for (i = 0; i < 5; i++) {
        let total = 0;        
        this.orgData.forEach(row => {
          if ( row[ fy+i ] == undefined ) {
            row[ fy+i ] = 0;
            }
          total = total + row[fy+i];
        });
        toarow[fy+1] = total;
      }

      this.subToasData.push(toarow);

      toarow = {};
      toarow['orgid'] = "<strong><span>&nbsp;&nbsp;Delta</span></strong>";
      for (i = 0; i < 5; i++)
      {
        let delta = 0;
        this.subToasData.forEach(row =>{
            //row[fy+i]
        })
      }

      this.orgGridApi.setRowData(this.orgData);
      this.orgGridApi.setColumnDefs(this.orgColumns);


      this.subToasGridApi.setColumnDefs(this.subToasColumns);
      this.subToasGridApi.setRowData(this.subToasData);
  }

  getOrgName(key):string{ 

    let org = this.orgs.find(o => o.id === key);    
    return '<span>&nbsp;&nbsp;' + org.abbreviation + '</span>';
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
                let response:any = resp;
                
                this.busy = false;
                let pyear ="PB" + FormatterUtil.pad((pbYear-2000),2);
                let years: string[] = [pyear, "Spreadsheet"];
                this.availableYears = this.toListItem(years);
    
      },
      error =>{
                let response:any = error ;
                this.busy = false;
                let pyear ="PB" + FormatterUtil.pad((pbYear-2000),2); // REmove this ....
                let years: string[] = [pyear,"Spreadsheet"];
                this.availableYears = this.toListItem(years);
                console.log(response.error);
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
      pinned:'left',
      //rowDrag: true,
      //rowDragManaged: true,
      cellRenderer: params => params.value,
      cellClass: "text-class",    
      cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal'}
    
  });

  for (var i = 0; i < 5; i++) {
    colDefs.push(
      { headerName: "FY" + (fy + i - 2000) ,
        type: "numericColumn",
        suppressMenu: true,
        field: (fy+ i).toString(),
        cellRenderer: params => this.negativeNumberRenderer(params),
        editable: false,
        cellClass: "pfm-datagrid-numeric-class",      
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
      valueGetter: params => this.rowTotal( params.data, fy ),
      cellRenderer: params => this.negativeNumberRenderer(params),
      cellClass: "pfm-datagrid-numeric-class",
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

private setSubToasAgGridColDefs(fy:number): any {

  let colDefs = [];

  colDefs.push(
    { headerName: "",
      suppressMenu: true,
      field: 'orgid',
      minWidth: 140,
      editable: false,
      pinned:'left',
      //rowDrag: true,
      //rowDragManaged: true,
      cellRenderer: params => params.value,
      cellClass: "text-class",    
      cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal'}
    
  });

  for (var i = 0; i < 5; i++) {
    colDefs.push(
      { headerName: "" ,
        type: "numericColumn",
        suppressMenu: true,
        field: (fy+ i).toString(),
        cellRenderer: params => this.negativeNumberRenderer(params),
        editable: false,
        cellClass: "pfm-datagrid-numeric-class",      
        cellStyle: { display: 'flex', 'align-items': 'right'}
    });
  }
  
  return colDefs;
}

// a sinple CellRenderrer for negative numbers
private negativeNumberRenderer( params ){

  if ( params.value < 0 ){
    return '<span style="color: red;">' + this.formatCurrency( params ) + '&nbsp;&nbsp;</span>';
  } else {
    return '<span style="color: black;">' + this.formatCurrency( params ) + '&nbsp;&nbsp;</span>';
  }
}

 // helper for currency formatting
 private formatCurrency( params ) {
  let str = Math.floor( params.value )
    .toString()
    .replace( /(\d)(?=(\d{3})+(?!\d))/g, "$1," );
  return "$ " + str;
}

// A valueGetter for totaling a row
private rowTotal( data, fy:number ){
  let total:number=0;
  for (var i = 0; i < 5; i++) {
    total += parseInt(data[fy+i],10);
  }
  return total;
}

// a callback for determining if a ROW is editable
private shouldEdit ( params ){
 return false;
}

onCommunityGridIsReady(gridApi:GridApi):void{
  this.communityGridApi = gridApi;
}

onOrgGridIsReady(gridApi:GridApi):void{
  this.orgGridApi = gridApi;
}

onColumnIsReady(columnApi:ColumnApi):void{
  this.columnApi = columnApi;
}

onToasGridIsReady(gridApi:GridApi){
  this.subToasGridApi = gridApi;
}
onToasColumnIsReady(columnApi:ColumnApi){
  this.subToaColumnApi = columnApi;
}
onRowDragEnd(param){}

}

