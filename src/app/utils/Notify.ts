declare var $: any;

export class Notify {

  static error(message?: string) {
    Notify.notify('exclamation', 'danger', message||'Error');
  }

  static exception(message: string) {
    if(message.includes(" 409 ")) {
      message = "Action failed due to conflict. " + message;
    }
    Notify.error(message);
  }

  static warning(message?: string) {
    Notify.notify('warning', 'warning', message||'Warning');
  }

  static info(message: string) {
    Notify.notify('info-circle', 'info', message);
  }

  static success(message?: string) {
    Notify.notify('check', 'success', message||'Success');
  }

  private static notify(fa: string, type: string, message: string) {
    $.notify({
      icon: 'fa fa-' + fa,
      message: message
    },{
      type: type,
    });
  }

}
