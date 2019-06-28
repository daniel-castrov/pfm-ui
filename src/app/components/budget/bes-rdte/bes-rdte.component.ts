import {Component, OnInit} from '@angular/core';
import {BudgetFundingLine, BudgetFundingLinesService, Pom, POMService, User} from "../../../generated";
import {UserUtils} from "../../../services/user.utils";
import {Item} from "./Item";
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'bes-rdte',
  templateUrl: './bes-rdte.component.html',
  styleUrls: ['./bes-rdte.component.scss']
})
export class BesRdteComponent implements OnInit {

  public columnDefs;
  public rows = [];
  groupDefaultExpanded = -1;
  autoGroupColumnDef = {
    headerName: "",
    maxWidth: 400,
    cellRendererParams: { suppressCount: true }
  };
  private budgetFundingLines: BudgetFundingLine[];
  private agOptions: GridOptions;

  constructor( private userUtils: UserUtils,
               private pomService: POMService,
               private budgetFundingLinesService: BudgetFundingLinesService ) {
    this.agOptions = <GridOptions>{
      suppressDragLeaveHidesColumns: true,
      suppressMovableColumns: true,
      suppressPaginationPanel: true,
      pagination: true,
      paginationPageSize: 500,
      treeData: true,
      animateRows: true,     
      columnDefs: [
        {
          field: "form",
          headerName: "Form",
          maxWidth: 120
        },
        {
          field: "responsible",
          headerName: "Responsible",
          maxWidth: 120
        },
        {
          field: "desc",
          headerName: "Description"
        }
      ]
    }
  }

  async ngOnInit() {
    await this.initBudgetFundingLines();
    this.initRows();
  }

  treeHierarchy(data) {
    return data.hierarchy;
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }


  initRows() {
    const rows = [];
    rows.push( ...this.getOverviewAndR1( [] ));

    for ( let i=1; i<8; i++ ) {
      const ba = "BA" + i;
      let itempe="";

      const itemsWithCurrentBa = this.itemsForBa(ba);

      itemsWithCurrentBa.forEach(item => {

        if ( item.pe != itempe ){
          itempe = item.pe;
          rows.push( ...this.getR2Fields([ ba, "PE:" + item.pe, "R-2"], item) );
        }

        rows.push( ...this.getR2AFields( [ba, "PE:"+item.pe, "ITEM: "+item.inum, "R-2A"], item ) );

        if ( item.ba == "BA4" || item.ba == "BA5" || item.ba == "BA7") {
          rows.push( ...this.getR3Fields(  [ba, "PE:"+item.pe, "ITEM: "+item.inum,"R-3"],  item) );
          rows.push( ...this.getR4Fields(  [ba, "PE:"+item.pe, "ITEM: "+item.inum,"R-4"],  item) );
          rows.push( ...this.getR4AFields( [ba, "PE:"+item.pe, "ITEM: "+item.inum,"R-4A"], item) );
        }
      });
    }
    this.rows = rows;
  }

  getOverviewAndR1(hierarchy: string[]) {
    let rows = [];
    rows.push({ hierarchy: hierarchy.concat( "FY" ), responsible: "Budget Manager", form: "Title", desc: "THe Budget Year" });
    rows.push({ hierarchy: hierarchy.concat( "Cycle" ), responsible: "Budget Manager", form: "Title", desc: "BES or PB" });
    rows.push({ hierarchy: hierarchy.concat( "Title" ), responsible: "Budget Manager", form: "Title", desc: "A Title" });
    rows.push({ hierarchy: hierarchy.concat( "Community" ), responsible: "Budget Manager", form: "Title", desc: "CBDP" });
    rows.push({ hierarchy: hierarchy.concat( "Overview" ), responsible: "Budget Manager", form: "Overview", desc: "A file with an overall desription" });
    rows.push({ hierarchy: hierarchy.concat( "R-1" ), responsible: "Budget Manager", form: "R-1", desc: "A file that is the R-1 form" });
    return rows;
  }

  getR2Fields( hierarchy: string[], item: Item ) {
    let rows = [];
    rows.push({ hierarchy: hierarchy.concat( "Overview" ), responsible: "Budget Manager", form: "R-2", desc: "Overall Mission Description and Budget Item Justification" });
    rows.push({ hierarchy: hierarchy.concat( "Change Summary" ), responsible: "Budget Manager", form: "R-2", desc: "Overall Program Change Summary ($ in Millions)" });
    return rows;
  }

  getR2AFields(hierarchy: string[], item: Item) {
    let rows = [];
    rows.push({ hierarchy: hierarchy.concat("Overall Mission Description"), responsible: "Budget Manager", form: "R-2A", desc: "Overall Mission Description" });
    rows.push( ...this.getMissionDescriptions(hierarchy.concat("Mission Description"), item) );
    rows.push( ...this.getBullets(hierarchy.concat("Program Bullets"), item) );

    if ( item.ba != "6" )
    rows.push({ hierarchy: hierarchy.concat("Other Funding"), responsible: "Budget Manager", form: "R-2A", desc: "Other Program Funding for this Item" });
    rows.push({ hierarchy: hierarchy.concat("Remarks"), responsible: "Budget Manager", form: "R-2A", desc: "Item Remarks" });

    if ( item.ba == "4" || item.ba == "5" || item.ba == "7"   ){
      rows.push({ hierarchy: hierarchy.concat("Acquisition Strategy"), responsible: "Program Managers", form: "R-2A", desc: "Acquisition Strategy from each Program" });
    }

    if ( item.ba == "7"){
      rows.push({ hierarchy: hierarchy.concat("Performance Metrics"), responsible: "Program Managers", form: "R-2A", desc: "Item Performance Metrics" });
    }
    return rows;
  }

  getR3Fields(hierarchy: string[], item: Item) {
    let rows = [];
    rows.push( ...this.getR3Breakdown(hierarchy.concat("Product Development"), item) );
    rows.push( ...this.getR3Breakdown(hierarchy.concat("Support"), item) );
    rows.push( ...this.getR3Breakdown(hierarchy.concat("Test and Evaluation"), item) );
    rows.push( ...this.getR3Breakdown(hierarchy.concat("Management Services"), item) );
    rows.push( ...this.getR3Breakdown(hierarchy.concat("Remarks"), item) );
    return rows;
  }

  getR4Fields(hierarchy: string[], item: Item) {
    return this.getR4ABreakdown(hierarchy, item);
  }

  getR4AFields(hierarchy: string[], item: Item) {
    return [{ hierarchy: hierarchy.concat("Schedule Details"), responsible: "Program Managers", form: "R-4A", desc: "Schedule Details from each program to generate a Gantt Chart" } ];
  }

  getMissionDescriptions(hierarchy: string[], item: Item) {
    let rows = [];
    const budgetFundingLinesForItem = this.budgetFundingLines.filter(bfl => bfl.itemNumber === item.inum);
    budgetFundingLinesForItem.forEach(bfl => {
      rows.push({ hierarchy: hierarchy.concat( bfl.name ), responsible: "Program Manager", form: "R-2A", desc: "Mission Description" });
    });
    return rows;
  }

  getBullets(hierarchy: string[], item: Item) {
    let rows = [];
    this.budgetFundingLines.filter(bfl => bfl.itemNumber === item.inum).forEach(bfl => {
      const prHierarchy: string[] = hierarchy.concat( bfl.name );
      rows.push({ hierarchy: prHierarchy.concat('title'), responsible: "Program Manager", form: "R-2A", desc: "Program Title" });
      rows.push({ hierarchy: prHierarchy.concat('description'), responsible: "Program Manager", form: "R-2A", desc: "Mission Description and Budget Item Justification" });
      rows.push({ hierarchy: prHierarchy.concat('accomplishments'), responsible: "Program Manager", form: "R-2A", desc: "Accomplishments for the year prior to the last" });
      rows.push({ hierarchy: prHierarchy.concat('plans for this year'), responsible: "Program Manager", form: "R-2A", desc: "Plans for This Year" });
      rows.push({ hierarchy: prHierarchy.concat('plans for previous year'), responsible: "Program Manager", form: "R-2A", desc: "Plans for Previous Year" });
      rows.push({ hierarchy: prHierarchy.concat('increase-decrease statement'), responsible: "Program Manager", form: "R-2A", desc: "Increase-Decrease Statement" });
      rows.push({ hierarchy: prHierarchy.concat('fy - 2'), responsible: "Program Manager", form: "R-2A", desc: "Funds for Fiscal Year - 2" });
      rows.push({ hierarchy: prHierarchy.concat('fy - 1'), responsible: "Program Manager", form: "R-2A", desc: "Funds for Fiscal Year - 1" });
      rows.push({ hierarchy: prHierarchy.concat('fy'), responsible: "Program Manager", form: "R-2A", desc: "Funds for Fiscal Year" });
    });
    return rows;
  }

  getR3Breakdown(hierarchy: string[], item: Item) {
    let rows = [];
    this.budgetFundingLines.filter(bfl => bfl.itemNumber === item.inum).forEach(bfl => {
      const prHierarchy: string[] = hierarchy.concat( bfl.name );
      rows.push({ hierarchy: prHierarchy.concat('Category'), responsible: "Program Manager", form: "R-3", desc: "Category" });
      rows.push({ hierarchy: prHierarchy.concat('Cost Category Item'), responsible: "Program Manager", form: "R-3", desc: "Cost Category Item" });
      rows.push({ hierarchy: prHierarchy.concat('Contract Method'), responsible: "Program Manager", form: "R-3", desc: "Contract Method" });
      rows.push({ hierarchy: prHierarchy.concat('Contract Type'), responsible: "Program Manager", form: "R-3", desc: "Contract Type" });
      rows.push({ hierarchy: prHierarchy.concat('activity'), responsible: "Program Manager", form: "R-3", desc: "Performing Activity" });
      rows.push({ hierarchy: prHierarchy.concat('location'), responsible: "Program Manager", form: "R-3", desc: "Performing Location" });
      rows.push({ hierarchy: prHierarchy.concat('prior years'), responsible: "Program Manager", form: "R-3", desc: "Prior Years" });
      rows.push({ hierarchy: prHierarchy.concat('cost by - 2'), responsible: "Program Manager", form: "R-3", desc: "cost by - 2" });
      rows.push({ hierarchy: prHierarchy.concat('award date by - 2'), responsible: "Program Manager", form: "R-3", desc: "award by - 2" });
      rows.push({ hierarchy: prHierarchy.concat('cost by - 1'), responsible: "Program Manager", form: "R-3", desc: "cost by - 1" });
      rows.push({ hierarchy: prHierarchy.concat('award date by - 1'), responsible: "Program Manager", form: "R-3", desc: "award by - 1" });
      rows.push({ hierarchy: prHierarchy.concat('cost by'), responsible: "Program Manager", form: "R-3", desc: "cost by" });
      rows.push({ hierarchy: prHierarchy.concat('award date by'), responsible: "Program Manager", form: "R-3", desc: "award by" });
      rows.push({ hierarchy: prHierarchy.concat('target value'), responsible: "Program Manager", form: "R-3", desc: "target value" });
    });
    return rows;
  }

  getR4ABreakdown(hierarchy: string[], item: Item) {
    let rows = [];
    this.budgetFundingLines.filter(bfl => bfl.itemNumber === item.inum).forEach(bfl => {
      const prHierarchy: string[] = hierarchy.concat( bfl.name ).concat( "event" );
      rows.push({ hierarchy: prHierarchy.concat('Start Quarter'), responsible: "Program Manager", form: "R-4A", desc: "Start Quarter" });
      rows.push({ hierarchy: prHierarchy.concat('Start Year'), responsible: "Program Manager", form: "R-4A", desc: "Start Year" });
      rows.push({ hierarchy: prHierarchy.concat('End Quarter'), responsible: "Program Manager", form: "R-4A", desc: "End Quarter" });
      rows.push({ hierarchy: prHierarchy.concat('End Year'), responsible: "Program Manager", form: "R-4A", desc: "End Year" });
    });
    return rows;
  }

  async initBudgetFundingLines() {
    const user: User = await this.userUtils.user().toPromise();
    const pom = (await this.pomService.getOpen(user.currentCommunityId).toPromise()).result as Pom;
    this.budgetFundingLines = (await this.budgetFundingLinesService.getByPomWorkspaceId(pom.workspaceId).toPromise()).result;
  }

  itemsForBa(ba: string): Item[] {
    const mapNameToItem = new Map<string,Item>();
    this.budgetFundingLines.filter(bfl => bfl.ba === ba).forEach(bfl => {
      const item = {inum: bfl.itemNumber, ba: bfl.ba, pe: this.peForItemNumber(bfl.itemNumber) } as Item;
      mapNameToItem.set(item.inum, item);
    })
    const result = [] as Item[];

    mapNameToItem.forEach(item=>result.push(item));
    return result;
  }

  peForItemNumber(itemNumber: string): string {
    switch(itemNumber) {

      // BA1
      case "LF1": return "0601384BP";
      case "PS1": return "0601384BP";

      // BA2
      case "CB2": return "0602384BP";
      case "NT2": return "0602384BP";
      case "TM2": return "0602384BP";

      // BA3
      case "CB3": return "0603384BP";
      case "NT3": return "0603384BP";
      case "TM3": return "0603384BP";
      case "TT3": return "0603384BP";

      // BA4
      case "CA4": return "0603884BP";
      case "DE4": return "0603884BP";
      case "IP4": return "0603884BP";
      case "IS4": return "0603884BP";
      case "MB4": return "0603884BP";
      case "MC4": return "0603884BP";
      case "TE4": return "0603884BP";

      // BA5
      case "CA5": return "0604384BP";
      case "CM5": return "0604384BP";
      case "CO5": return "0604384BP";
      case "DE5": return "0604384BP";
      case "IP5": return "0604384BP";
      case "IS5": return "0604384BP";
      case "MB5": return "0604384BP";
      case "MC5": return "0604384BP";
      case "TE5": return "0604384BP";

      // BA6
      case "DT6": return "0605384BP";
      case "DW6": return "0605384BP";
      case "LS6": return "0605384BP";
      case "MS6": return "0605384BP";
      case "O49": return "0605384BP"; // BA6 or BA9???
      case "SB6": return "0605502BP"; // different PE then the above...

      // BA7
      case "CA7": return "0607384BP";
      case "CM7": return "0607384BP";
      case "CO7": return "0607384BP";
      case "DE7": return "0607384BP";
      case "IP7": return "0607384BP";
      case "IS7": return "0607384BP";
      case "MB7": return "0607384BP";
      case "TE7": return "0607384BP";
    }
  }
}
