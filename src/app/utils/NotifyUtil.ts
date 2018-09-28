declare var $: any;

export class NotifyUtil {

  public static notifyError(message){
    $.notify({
      icon: 'fa fa-exclamation',
      message: message
    },{
      type: 'danger',
    });
  }

  public static notifyWarning(message){
    $.notify({
      icon: 'fa fa-warning',
      message: message
    },{
      type: 'warning',
    });
  }

  public static notifyInfo(message){
    $.notify({
      icon: 'fa fa-info-circle ',
      message: message
    },{
      type: 'info',
    });
  }

  public static notifySuccess(message){
    $.notify({
      icon: 'fa fa-check',
      message: message
    },{
      type: 'success',
    });
  }
}
