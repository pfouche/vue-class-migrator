import type MigrationManager from "../migratorManager";

export default (migrationManager: MigrationManager) => {
  const clazz = migrationManager.clazz;
  const classExtend = clazz.getExtends()?.getText();
  if (classExtend && classExtend !== 'Vue') {
    migrationManager.unsupported(
      'This component is extending from a class different form Vue. This is not supported.',
    );
  }
};
