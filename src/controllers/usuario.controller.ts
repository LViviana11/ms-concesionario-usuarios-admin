import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {Credenciales, CredencialesCambioClave, CredencialesRecuperarClave, NotificacionCorreo, NotificacionSms, Usuario} from '../models';
import {UsuarioRepository} from '../repositories';
import {AdministradorDeClavesService, NotificacionesService} from '../services';
import {Configuraciones} from "../config/configuraciones";
export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @service(AdministradorDeClavesService)
    public servicioClaves: AdministradorDeClavesService,
    @service(NotificacionesService)
    public servicioNotificaciones: NotificacionesService
  ) { }

  @post('/usuarios')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario> {
    let clave = this.servicioClaves.GenerarClaveAleatoria();
    console.log(clave);

    //NOTIFICAR POR CORREO AL USUARIO LA CLAVE NORMAL
    let notificacion = new NotificacionCorreo();
    notificacion.destinatario = usuario.correo;
    notificacion.asunto = "Registro en el sistema"
    notificacion.mensaje = `${Configuraciones.saludo_notificaciones} ${usuario.nombre} ${Configuraciones.mensaje_clave_acceso} ${clave} y su usuario es el correo electrónico`
    this.servicioNotificaciones.EnviarCorreo(notificacion);


    let claveCifrada = this.servicioClaves.cifrarTexto(clave);
    console.log(this.servicioClaves.cifrarTexto(clave));

    usuario.clave = claveCifrada;
    return this.usuarioRepository.create(usuario);
  }

  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') _id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(_id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') _id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(_id, usuario);
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') _id: string): Promise<void> {
    await this.usuarioRepository.deleteById(_id);
  }

  /**
   * SECCIÓN DE SEGURIDAD
   */

  @post("/identificar-usuario", {
    responses: {
      '200': {
        description: "Identificación de usuario"
      }
    }
  })
  async identificar(
    @requestBody() credenciales: Credenciales

  ): Promise<Usuario | null> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.usuario,
        clave: credenciales.clave
      }

    });
    if (usuario) {
      usuario.clave = ""
      //Consumir el ms de tokens y generar uno nuevo //
      // Se asignara ese token a la respuesta para el cliente
    }
    return usuario;
  }


  @post("/recuperar-clave", {
    responses: {
      '200': {
        description: "Recuperación de clave de usuario"
      }
    }
  })
  async recuperarClave(
    // @param.path.string('correo') correo: string,
    @requestBody() credenciales: CredencialesRecuperarClave

  ): Promise<Boolean> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.correo
      }

    });
    if (usuario) {
      let clave = this.servicioClaves.GenerarClaveAleatoria();
      console.log(clave);

      let claveCifrada = this.servicioClaves.cifrarTexto(clave);
      console.log(claveCifrada);

      usuario.clave = claveCifrada;
      await this.usuarioRepository.updateById(usuario._id, usuario);

      //Consumir el ms de notificaciones //
      let notificacion = new NotificacionSms();
        notificacion.destino = usuario.celular;
        notificacion.mensaje = `${Configuraciones.saludo_notificaciones} ${usuario.nombre} ${Configuraciones.mensaje_recuperar_clave} ${clave}`
        this.servicioNotificaciones.EnviarSms(notificacion);

      // Enviar la nueva clave por SMS
      return true;

    }
    return false;
  }

  @post("/cambiar-clave", {
    responses: {
      '200': {
        description: "Cambio de clave de usuarios"
      }
    }
  })
  async cambiarClave(
    @requestBody() datos: CredencialesCambioClave

  ): Promise<Boolean> {
    let usuario = await this.usuarioRepository.findById(datos.id);
    console.log(datos.id);

    console.log(usuario);

    console.log(usuario.clave);
    console.log(datos.clave_actual);



    if (usuario) {

      if (usuario.clave == datos.clave_actual) {


        usuario.clave = datos.nueva_clave;
        console.log(datos.nueva_clave);

        await this.usuarioRepository.updateById(datos.id, usuario);

        //enviar email al usuario notificando el cambio de contraseña
        let notificacion = new NotificacionCorreo();
        notificacion.destinatario = usuario.correo;
        notificacion.asunto = Configuraciones.asunto_cambio_clave
        notificacion.mensaje = `${Configuraciones.saludo_notificaciones} ${usuario.nombre} ${Configuraciones.asunto_cambio_clave} `
        this.servicioNotificaciones.EnviarCorreo(notificacion);


        return true;

      } else {
        return false;
      }

    }
    return false;
  }

}
