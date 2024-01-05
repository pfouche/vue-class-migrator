import type MigrationManager from './migratorManager';
import migrateImports from "./vue-class-component/migrate-imports";
import migrateExtends from "./vue-class-component/migrate-extends";
import migrateSetup from "./vue-class-component/migrate-setup";
import migrateData from "./vue-class-component/migrate-data";
import migrateGetters from "./vue-class-component/migrate-getters";
import migrateMethods from "./vue-class-component/migrate-methods";
import migrateProps from "./vue-property-decorator/prop";
import migratePropSyncs from "./vue-property-decorator/propSync";
import migrateModels from "./vue-property-decorator/model";
import migrateModelSyncs from "./vue-property-decorator/modelSync";
import migrateRefs from "./vue-property-decorator/ref";
import migrateWatchers from "./vue-property-decorator/watch";
import {migrateVuexActions, migrateVuexGetters, migrateVuexMutations, migrateVuexStates} from "./vuex";
import checkComponent from "./vue-class-component/check-component";
import migrateSetters from "./vue-class-component/migrate-setters";
import migrateEmits from "./vue-class-component/migrate-emits";
import migrateProvide from "./vue-property-decorator/provide";
import migrateInject from "./vue-property-decorator/inject";


export default (migrationManager: MigrationManager) => {
  checkComponent(migrationManager)
  
  migrateImports(migrationManager.outFile);
  migrateExtends(migrationManager);
  migrateSetup(migrationManager);

  migrateProps(migrationManager);
  migratePropSyncs(migrationManager);
  migrateModels(migrationManager);
  migrateModelSyncs(migrationManager);
  
  migrateEmits(migrationManager)
  migrateProvide(migrationManager)
  migrateInject(migrationManager)
  
  migrateData(migrationManager.clazz, migrationManager.outFile);
  
  migrateVuexStates(migrationManager);

  migrateRefs(migrationManager);

  migrateGetters(migrationManager);
  migrateSetters(migrationManager);
  migrateVuexGetters(migrationManager);

  migrateWatchers(migrationManager);
  
  migrateVuexMutations(migrationManager);
  migrateVuexActions(migrationManager);

  migrateMethods(migrationManager);
};
