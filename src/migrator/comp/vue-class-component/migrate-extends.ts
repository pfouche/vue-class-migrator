import {ClassDeclaration} from 'ts-morph';
import type MigrationManager from "../migratorManager";

export default (migrationManager: MigrationManager) => {
  const classExtend = migrationManager.clazz.getExtends()?.getText();

  // Class extend
  if (classExtend && classExtend !== 'Vue') {
    migrationManager.unsupported(
      'This component is extending from a class different form Vue. This is not supported.',
    );
  }
};
