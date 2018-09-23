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

  public static notifySuccess(message){
    $.notify({
      icon: 'fa fa-check',
      message: message
    },{
      type: 'success',
    });
  }
}
