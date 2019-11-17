export class UserRole {
  public isAdmin:boolean;
  public isBudget_Manager:boolean;
  public isPOM_Manager:boolean;
  public isFunds_Requestor:boolean;
  public isProgram_Manager:boolean;
  public isExecution_Manager:boolean;
  public isExecution_Reporter:boolean;
  public isUser_Approver:boolean;
  public isUser:boolean;
  constructor(roles:string[]){

    if(roles.indexOf("Budget_Manager") !== -1){
      this.isBudget_Manager = true;
    }
    if(roles.indexOf("POM_Manager") !== -1){
      this.isPOM_Manager = true;
    }
    if(roles.indexOf("Budget_Manager") !== -1){
      this.isBudget_Manager = true;
    }
    if(roles.indexOf("Funds_Requestor") !== -1){
      this.isFunds_Requestor = true;
    }
    if(roles.indexOf("Program_Manager") !== -1){
      this.isProgram_Manager = true;
    }
    if(roles.indexOf("Execution_Manager") !== -1){
      this.isExecution_Manager = true;
    }
    if(roles.indexOf("Execution_Reporter") !== -1){
      this.isExecution_Reporter = true;
    }
    if(roles.indexOf("User_Approver") !== -1){
      this.isUser_Approver = true;
    }
    if(roles.indexOf("User") !== -1){
      this.isUser = true;
    }

    //TODO - just for testing
    this.isExecution_Manager = true;
    this.isBudget_Manager = true;
    this.isPOM_Manager = true;
    this.isProgram_Manager = true;
    this.isFunds_Requestor = true;
    this.isAdmin = true;
    this.isExecution_Reporter = true;
    this.isUser_Approver = true;

  }
}