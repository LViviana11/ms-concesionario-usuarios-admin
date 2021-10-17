import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'mondodb',
  connector: 'mongodb',
  url: 'mongodb+srv://concesionario_user:5GSZsFNJjVeo0we8@cluster0.sgqjp.mongodb.net/usuariosConcesionariodb?retryWrites=true&w=majority',
  host: 'localhost',
  port: 27017,
  user: '',
  password: '',
  database: 'usuariosConcesionariodb',
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MondodbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mondodb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mondodb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
