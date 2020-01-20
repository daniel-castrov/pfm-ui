import { Component, OnInit, ViewChild } from '@angular/core';
import { PomService } from '../../programming-feature/services/pom-service';
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
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';



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
  commColumnApi:ColumnApi;  
  orgColumnApi:ColumnApi; 
  communityColumns:any[]; 
  communityData:any[];
  orgColumns:any[];
  orgData:any[];
  subToasData:any[];
  tableHeaders:Array<string>;  
  orgs:Array<Organization>;
  uploadedFileId:string;
  loadBaseline:boolean;
  gridAction:string;
  constructor(private appModel: AppModel, private pomService:PomService, private dialogService:DialogService, private router:Router) {
    
    //var selectedYear = appModel.selectedYear;   
    this.subToasData = [];

    pomService.getAllorganizations().subscribe(
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
    console.log("selected year "+ this.programYearSelected);
    
    this.loadBaseline = false;
    if (this.programYearSelected != "undefined")
    {
      this.dialogService.displayConfirmation("You are about to replace the baseline with different values.  All values in the community and organization grid will be reset.  Do you want to continue?","Caution",
          () => { 
            this.loadBaseline = true;
            this.onSelectBaseLine();
          }, () => {
            this.loadBaseline = false;
            this.yearDropDown.selectedItem = this.programYearSelected;
          });
    }else {
      this.loadBaseline = true;
    }
    
    if (this.loadBaseline) {
      this.onSelectBaseLine();
    }
    
   }
  
   onSelectBaseLine(){
    this.programYearSelected= Object.keys( this.selectedYear).map(key =>  this.selectedYear[key]).slice(0,1);
      console.log("selected year "+ this.programYearSelected);    
      if(this.programYearSelected=="Spreadsheet"){
        this.showUploadDialog = true;
      }else{ // if it is PBYear 
        this.showUploadDialog = false;
        this.programBudgetData=true;
        
        var selectedYear = this.byYear;///FormatterUtil.getCurrentFiscalYear()+1; 
        this.initGrids(selectedYear);
        this.getPomFromPB(selectedYear);
      }
   }

   initGrids(selectedYear){
     // set the column definitions to community adn Organization grid    
     this.communityColumns =   this.setAgGridColDefs("Community",selectedYear);
     this.orgColumns = this.setAgGridColDefs("Organization",selectedYear);                    
   }

   getPomFromPB(selectedYear:any){
    this.busy = true;
      this.pomService.getPomFromPb().subscribe(
        resp => {
          this.busy = false;
          var pom = (resp as PomToasResponse).result ;
          console.log("year..." + pom.fy);
          this.loadGrids(pom,selectedYear);
          
      },
      error => {
        this.busy = false;
          console.log("Error in getting community and org toas...");
        // this.busy = false;
      });
   }
   
   loadGrids(pomData:Pom,fy:number){
      let toarow = {};            
      let subtoarow = {};
      this.subToasData = []; 

      this.communityData = [];
      this.orgData = [];

      // BaseLine
      let row = {}
      row["orgid"] = "<strong><span>Baseline</span></strong>";
      pomData.communityToas.forEach(toa => {
        row[toa.year] = toa.amount;
      });
      
      let  actions = this.getActions();
      
      //row["actions"] = actions;
      this.communityData.push(row);

      // Community Toas
      row = {}      
      row["orgid"] = "<strong><span>TOA</span></strong>";
      toarow['orgid'] = "sub TOA Total Goal";
      pomData.communityToas.forEach((toa: TOA) => {
        row[toa.year] = toa.amount;        
      });
      
      let i:number;
      for (i = 0; i < 5; i++) {         
        if ( row[ fy+i ] == undefined ) row[ fy+i ] = 0;

        toarow[fy+i] = row[ fy+i ] ;
      }      
      row["Communityactions"] = actions;
      this.communityData.push(row);

      toarow['orgid'] = "sub TOA Total Goal";
      this.subToasData.push(toarow);
      
      this.communityData.forEach( row => {        
        for (i = 0; i < 5; i++) {
          if ( row[ fy+i ] == undefined ) {
            row[ fy+i ] = 0;
            }          
          }       
        });
                
    //  this.communityGridApi.setRowData(this.communityData);
    //  this.communityGridApi.setColumnDefs(this.communityColumns);

      // Org TOAs      
     Object.keys(pomData.orgToas).reverse().forEach(key => {          
          row = {};          
          row['orgid'] = "<strong><span>" + this.getOrgName(key) +"</span></strong>";
          pomData.orgToas[key].forEach( (toa:TOA) => {
            row[toa.year] = toa.amount;          
           });

        row["Organizationactions"] = this.getActions();
        this.orgData.push(row);     
      });
      
      this.orgData.forEach( row => {        
      for (i = 0; i < 5; i++) {
        if ( row[ fy+i ] == undefined ) {
          row[ fy+i ] = 0;
          }          
        }       
      });      

      subtoarow = {};
      subtoarow = this.calculateSubToaTotals();      

      this.tableHeaders = [];
      this.tableHeaders.push('orgid');
      for (i = 0; i < 5; i++){
       // rowspan[fy+ i] =  "";
        this.tableHeaders.push((fy+i).toString());
      }

      //this.orgData.push(rowspan);
      this.orgData.push(toarow);      
      this.orgData.push(subtoarow);

      subtoarow['orgid'] = "sub-TOA Total Actual";
      this.subToasData.push(subtoarow);

      let toaDeltarow = {};
      toaDeltarow = this.calculateDeltaRow(subtoarow,toarow);
      
      this.orgData.push(toaDeltarow);
      toaDeltarow['orgid'] = "Delta";
      this.subToasData.push(toaDeltarow);

      
      //this.orgGridApi.setColumnDefs(this.orgColumns);      
      //this.orgGridApi.setRowData(this.orgData);
  }

  getActions():Action{
    let actions = new Action();
      actions.canDelete = false;
      actions.canEdit = true;
      actions.canSave = false;
      actions.canUpload = false;
    return actions;
  }
  getOrgName(key):string{ 

    let org = this.orgs.find(o => o.id === key);    
    return org.abbreviation;
  }
   handleNewAttachments(newFile:FileMetaData):void{
      this.showUploadDialog = false;
      if(newFile){
        let attachment:Attachment = new Attachment();
        attachment.file = newFile;
        this.programBudgetData=true;
        this.uploadedFileId = newFile.id;
        this.LoadPomFromFile(newFile.id);
      }else{
        this.yearDropDown.selectedItem=this.yearDropDown.prompt;
      }     
  }

  onCreateProgrammingPhase():void{
    let year:any = this.selectedYear;
  }

  LoadPomFromFile(fileId:string){
    this.busy = true;
    this.pomService.getPomFromFile(fileId).subscribe(
      resp => {
        this.busy = false;
        var pom = (resp as PomToasResponse).result ;
        console.log("year..." + pom.fy);
        this.initGrids(this.byYear);
        this.loadGrids(pom,this.byYear);
      },
      error => {
        this.busy = false;
        console.log(error);
      }
    );
  }
  ngOnInit() {
    console.log("in ngOninit");

    this.byYear= FormatterUtil.getCurrentFiscalYear()+2;
    let pbYear:any = FormatterUtil.getCurrentFiscalYear()+1;
    
    this.programYearSelected = "undefined";
    this.busy = true;
    this.pomService.pBYearExists(pbYear).subscribe(
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
                let years: string[] = ["Spreadsheet"];
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
      colSpan: function (params){        
        return (params.value === '1')? 7 : 1;
    },
      cellRenderer: params => params.value,
      cellClass: "text-class",    
      cellStyle: params => this.getOrgColorStyle(params),
    
  });

  for (var i = 0; i < 5; i++) {
    colDefs.push(
      { headerName: "FY" + (fy + i - 2000) ,
        type: "numericColumn",
        minWidth: 110,        
        suppressMenu: true,
        field: (fy+ i).toString(),
        cellRenderer: params => this.negativeNumberRenderer(params),
        editable: true,
        cellClass: "pfm-datagrid-numeric-class",      
        cellStyle: { display: 'flex','padding-right':'10px !important'}
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
      cellStyle: { display: 'flex', 'padding-right':'10px !important'}
  });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  

  colDefs.push(
    {
      headerName: 'Actions',
      field: column1Name + 'actions',      
      mWidth: 100,
      maxWidth:100,
      cellRendererFramework: ActionCellRendererComponent
    }
  );

  return colDefs;
}

// a sinple CellRenderrer for negative numbers
private negativeNumberRenderer( params ){

  if (params.value == "")
    return params.value;

  if ( params.value < 0 ){
    return '<span style="color: red;">' + this.formatCurrency( params ) + '</span>';
  } else {
    return '<span style="color: black;">' + this.formatCurrency( params ) + '</span>';
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

onTabChange(param:NgbTabChangeEvent){
  console.log('tab change:'+ param);
}
onCommunityGridIsReady(gridApi:GridApi):void{
  this.communityGridApi = gridApi;
  //gridApi.sizeColumnsToFit();
}

onOrgGridIsReady(gridApi:GridApi):void{
  this.orgGridApi = gridApi;

  //gridApi.sizeColumnsToFit();
}
onCommunityColumnIsReady (columnApi:ColumnApi):void{
  this.commColumnApi = columnApi;
}

onOrgColumnIsReady(columnApi:ColumnApi):void{
  this.orgColumnApi = columnApi;
}

onRowDragEnd(param){}

onCommunityGridCellAction(cellAction:DataGridMessage){
  this.onCellAction(cellAction);
}

onOrgGridCellAction(cellAction:DataGridMessage){
  this.onCellAction(cellAction);
}

onCellAction(cellAction:DataGridMessage):void{
 
  let gridType:string;
  if(cellAction.columnId == undefined){ 
      this.gridAction = cellAction.message;
      return;
  }
  console.log(cellAction.columnId);
  console.log(cellAction.columnIndex);
  if ( cellAction.columnId === "Organizationactions"){
      gridType = "org";  
  }
  else {
      gridType = "community";
  }
 
  switch(this.gridAction){
    case "save": {      
      this.onSaveRow(cellAction.rowIndex,gridType);
      break;
    }
    case "edit": {
      this.onEditRow(cellAction.rowIndex,gridType)
      break;
    }    
  }
}

onSaveRow(rowId,gridType):void{
  
  let editAction = this.onSaveAction(rowId,gridType);
  if (gridType == "org")
  {
    let fy = this.byYear;
    this.orgData[rowId].actions = editAction;
    this.orgGridApi.stopEditing();

    // update subtotal row   
    let subtoaRow = this.calculateSubToaTotals();
    this.refreshOrgsTotalsRow(subtoaRow);
  
    // update delta row
    let deltaRow = {};
    deltaRow = this.calculateDeltaRow(subtoaRow,this.communityData[1]);
    this.refreshDeltaRow(deltaRow);
    
    this.orgGridApi.setRowData(this.orgData);    
  }
  else {
    this.communityData[rowId].actions = editAction;
    this.communityGridApi.stopEditing();
    this.onCommunityToaChange(rowId);
  }
  
}

onEditRow(rowId,gridType):void{
  
  let editAction = this.onEditAction(rowId,gridType);

  if (gridType == "org"){
    this.orgGridApi.startEditingCell({
      rowIndex:rowId,
      colKey:this.byYear
    });   
  }
  else{
    this.communityGridApi.startEditingCell({
      rowIndex:rowId,
      colKey:this.byYear
    });
  }
}

onEditAction(rowId:number,gridId):any{

  let  actions = new Action();

  if (gridId == "org"){
    actions = this.orgData[rowId]["Organizationactions"];
  }
  else{
    actions = this.communityData[rowId]["Communityactions"];
  }

  actions.canDelete = false;
  actions.canEdit = false;
  actions.canSave = true;
  actions.canUpload = false;

  return actions;
}

onSaveAction(rowId:number,gridId:string):any{

  let  actions = new Action();
  if (gridId == "org"){
    actions = this.orgData[rowId]["Organizationactions"];
  }
  else{
    actions = this.communityData[rowId]["Communityactions"];
  }

  actions.canDelete = false;
  actions.canEdit = true;
  actions.canSave = false;
  actions.canUpload = false;
  
  return actions;
}

onCommunityToaChange(rowId:number){
  let fy = this.byYear;
  let communityTOARow = this.communityData[rowId];
  this.orgData.forEach( row => {
    let rval = row['orgid'];
    if (rval == 'sub TOA Total Goal')
    {
      for (let i = 0; i < 5; i++) {
          row[ fy+i ] = communityTOARow[fy+i];
        }      
    }    
  });
  
  let orgtotals = this.calculateSubToaTotals();
  let deltarow = this.calculateDeltaRow(orgtotals,communityTOARow);
  this.refreshDeltaRow(deltarow);

  this.orgGridApi.setRowData(this.orgData);
  //toarow['orgid'] = "sub TOA Total Goal"
}

calculateSubToaTotals():any{
  let subtoarow = {};
  let fy = this.byYear;

  subtoarow['orgid'] = "sub-TOA Total Actual";
  for (let i = 0; i < 5; i++) {
    let total:number = 0;        
    this.orgData.forEach(row => {
      if (row['Organizationactions'] != undefined)
      {
        if ( row[ fy+i ] == undefined ) {
          row[fy+i] = 0;
          }
        total = total + Number(row[fy+i]);
      }
    });
    subtoarow[fy+i] = total;
  }

  // et the sub taotal row from the org data
  //this.orgData.forEach(row => {})
 return subtoarow
}

refreshOrgsTotalsRow(subtoaRow:any)
{
  let fy = this.byYear;
  this.orgData.forEach(row => {
    let rval = row['orgid'];
    if (rval == 'sub-TOA Total Actual')
    {
        for(let i = 0; i < 5; i ++)
        {
          row[fy + i] = subtoaRow[fy + i];
        }         
    }      
  });
}

calculateDeltaRow(totalsrow:any,subtoasrow:any):any{

  let toaDeltarow = {};

  let fy = this.byYear;  
  toaDeltarow['orgid'] = "Delta";
  for (let i = 0; i < 5; i++)
  {        
    toaDeltarow[fy+i] = totalsrow[fy+i] - subtoasrow[fy+i];
  }

  return toaDeltarow;
}

refreshDeltaRow(deltaRow:any){
  let fy = this.byYear;
  this.orgData.forEach(row => {
    let rval = row['orgid'];
    if (rval == 'Delta')
    {
        for(let i = 0; i < 5; i ++)
        {
          row[fy + i] = deltaRow[fy + i];
        }         
    }      
  });
}

getOrgColorStyle(param):any {
  let orgcolors = []
  orgcolors["PAIO"] ="#6d00c1";
  orgcolors["DUSA"] ="#10A1B1";
  orgcolors["JSTO"] ="#21D836";
  orgcolors["JPEO"] ="#DE3C47";
  orgcolors["JRO"] ="#0c1ec7";
  
  let  cellStyle = { display: 'flex', 'padding-left':'5px !important', 'align-items': 'center', 'white-space': 'normal',backgroundColor:null};
  let orgName:string = param.value;

  if (orgName != undefined)
  {
    orgName = orgName.split('-')[0];
    orgName = orgName.replace('<strong><span>','');
    orgName = orgName.replace('</span></strong>','');
    
    console.log("orgname " + orgName);
    if (orgcolors[orgName] != undefined)
    {
      let orgcolor:string = orgcolors[orgName];
      cellStyle = { display: 'flex',  'padding-left':'5px !important', 'align-items': 'center', 'white-space': 'normal',backgroundColor:orgcolor};
    }
    return cellStyle;
  }

  return ;
}



}

