import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MondodbDataSource} from '../datasources';
import {Usuario, UsuarioRelations, Rol} from '../models';
import {RolRepository} from './rol.repository';

export class UsuarioRepository extends DefaultCrudRepository<
  Usuario,
  typeof Usuario.prototype.id,
  UsuarioRelations
> {

  public readonly tiene: BelongsToAccessor<Rol, typeof Usuario.prototype.id>;

  constructor(
    @inject('datasources.mondodb') dataSource: MondodbDataSource, @repository.getter('RolRepository') protected rolRepositoryGetter: Getter<RolRepository>,
  ) {
    super(Usuario, dataSource);
    this.tiene = this.createBelongsToAccessorFor('tiene', rolRepositoryGetter,);
    this.registerInclusionResolver('tiene', this.tiene.inclusionResolver);
  }
}
