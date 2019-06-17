import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensaje: OSNotificationPayload[] = [
    // title: 'Titulo de lña push',
    // body: 'Esste es el body de la push',
    // date: new Date()
  ];

  userId: string;

  pushListener =  new EventEmitter<OSNotificationPayload>();

  constructor(private oneSignal: OneSignal,
              private storage: Storage) {
    this.cargarMensajes();
  }

  async getMensajess() {
    await this.cargarMensajes();
    return [...this.mensaje];
  }

  configuracionInicialOneSignal() {
    this.oneSignal.startInit('69fd093b-0d21-4fd2-91e6-ed885f112753', '1083586163927');
    // this.oneSignal.startInit('ONESIGNAL APP ID OneSignal', 'ID del remitente firebase ');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

    this.oneSignal.handleNotificationReceived().subscribe( (noti ) => {
      // do something when notification is received
      console.log('Notifiacion recibe', noti);
      this.notificacionRecibida(noti);
    });

    this.oneSignal.handleNotificationOpened().subscribe(async (noti) => {
      // do something when a notification is opened
      console.log('Notificacion abierta', noti);
      await this.notificacionRecibida(noti.notification);

    });

    // Obtener ID del suscriptor.
    this.oneSignal.getIds().then( info  => {
      this.userId =  info.userId; /// identofica el id del dispositivo 
      console.log(this.userId);
    });

    this.oneSignal.endInit();
  }

  async notificacionRecibida(noti: OSNotification) {

    await this.cargarMensajes();

    const payload =  noti.payload;

    const existePush = this.mensaje.find( menssage => menssage.notificationID === payload.notificationID);

    // validar si no se repite el push
    if (existePush) {
      return;
    }

    // si no existe el push,  arreglo adiciono primero el arreglo
    this.mensaje.unshift(payload);
    this.pushListener.emit(payload);

    await this.guardarMensajes();

  }

  guardarMensajes() {
    this.storage.set('mensajes', this.mensaje);
  }

  async cargarMensajes() {
    /// this.storage.clear(); borrar el storage
    this.mensaje =  await this.storage.get('mensajes') || [];
  }

  async borrarMensajes() {
    await this.storage.clear();
    this.mensaje = [];
    this.guardarMensajes();
  }


}
