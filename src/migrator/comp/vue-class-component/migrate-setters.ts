import type MigrationManager from "../migratorManager";

export default (migrationManager: MigrationManager) => {
  const setters = migrationManager.clazz.getSetAccessors();

  if (setters.length) {
    setters.forEach((setter) => {
      const name = setter.getName();
      const getter = migrationManager.clazz.getGetAccessor(name);
      if (!getter)
        migrationManager.unsupported(`Setter without getter unsupported: ${name}`);
    });
  }
};
