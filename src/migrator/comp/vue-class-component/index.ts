import type MigrationManager from '../migratorManager';
import migrateData from './migrate-data';
import migrateExtends from './migrate-extends';
import migrateGetters from './migrate-getters';
import migrateImports from './migrate-imports';
import migrateMethods from './migrate-methods';
import migrateSetters from './migrate-setters';

export default (migrationManager: MigrationManager) => {
  migrateImports(migrationManager.outFile);
  migrateExtends(migrationManager.clazz);
  migrateData(migrationManager.clazz, migrationManager.outFile);
  migrateGetters(migrationManager);
  // migrateSetters(migrationManager.clazz, migrationManager.mainObject);
  migrateMethods(migrationManager);
};
