import type MigrationManager from './migratorManager';
import migrateImports from "./vue-class-component/migrate-imports";
import migrateExtends from "./vue-class-component/migrate-extends";
import migrateData from "./vue-class-component/migrate-data";
import migrateGetters from "./vue-class-component/migrate-getters";
import migrateMethods from "./vue-class-component/migrate-methods";
import migrateProps from "./vue-property-decorator/prop";
import migratePropSyncs from "./vue-property-decorator/propSync";
import migrateModels from "./vue-property-decorator/model";
import migrateModelSyncs from "./vue-property-decorator/modelSync";
import migrateRefs from "./vue-property-decorator/ref";
import migrateWatchers from "./vue-property-decorator/watch";
import migrateVuexActions from "./vuex/actions";
import migrateVuexGetters from "./vuex/getters";
import migrateVuexMutations from "./vuex/mutations";


export default (migrationManager: MigrationManager) => {
  migrateImports(migrationManager.outFile);
  migrateExtends(migrationManager.clazz);

  migrateData(migrationManager.clazz, migrationManager.outFile);
  migrateProps(migrationManager);
  migratePropSyncs(migrationManager);
  migrateModels(migrationManager);
  migrateModelSyncs(migrationManager);

  migrateRefs(migrationManager);

  migrateGetters(migrationManager);
  migrateVuexGetters(migrationManager);

  migrateWatchers(migrationManager);
  
  migrateVuexActions(migrationManager);
  migrateVuexMutations(migrationManager);

  migrateMethods(migrationManager);
};
