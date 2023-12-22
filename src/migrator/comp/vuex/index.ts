import type MigrationManager from '../migratorManager';
import migrateVuexEntities from './vuexEntities';

export const migrateVuexStates = (migrationManager: MigrationManager) => migrateVuexEntities(migrationManager, "State");
export const migrateVuexGetters = (migrationManager: MigrationManager) => migrateVuexEntities(migrationManager, "Getter");
export const migrateVuexMutations = (migrationManager: MigrationManager) => migrateVuexEntities(migrationManager, "Mutation");
export const migrateVuexActions = (migrationManager: MigrationManager) => migrateVuexEntities(migrationManager, "Action");

