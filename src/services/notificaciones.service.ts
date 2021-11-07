import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {NotificacionCorreo, NotificacionSms} from '../models';
import {Configuraciones} from '../config/configuraciones';

const fetch=require("node-fetch");
@injectable({scope: BindingScope.TRANSIENT})

export class NotificacionesService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

  async EnviarCorreo(notificacion:NotificacionCorreo):Promise<Boolean>{
    let url = `${Configuraciones.url_notificaciones_email}?${Configuraciones.arg_hash_notificaciones}=${Configuraciones.hash_notificaciones}&
    ${Configuraciones.arg_asunto_correo_notificaciones}=${notificacion.asunto}&${Configuraciones.arg_destino_correo_notificaciones}=${notificacion.destinatario}&${Configuraciones.arg_mensaje_correo_notificaciones}=${notificacion.mensaje}`
    fetch(url).then((data:any) => {
      return true;
    })

    return true;

  }
  async EnviarSms(notificacion:NotificacionSms):Promise<Boolean>{
    let url = `${Configuraciones.url_notificaciones_sms}?${Configuraciones.arg_hash_notificaciones}=${Configuraciones.hash_notificaciones}&${Configuraciones.arg_destino_sms_notificaciones}=${notificacion.destino}&${Configuraciones.arg_mensaje_sms_notificaciones}=${notificacion.mensaje}`
    fetch(url).then((data:any) => {
      return true;
    })
    return true;

  }
}
