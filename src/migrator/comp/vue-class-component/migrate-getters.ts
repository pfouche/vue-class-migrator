import type MigrationManager from '../migratorManager';

export default (migrationManager: MigrationManager) => {
  const { clazz } = migrationManager;
  const getters = clazz.getGetAccessors();

  getters.forEach((getter) => {
    const getterName = getter.getName();
    const setter = clazz.getSetAccessor(getterName);
    if (setter) {
      migrationManager.addComputedProp({
        name: getterName,
        get: {
          returnType: getter.getReturnTypeNode()?.getText(),
          statements: getter.getBodyText(),
        },
        set: {
          parameters: setter.getParameters().map((p) => p.getStructure()),
          statements: setter.getBodyText()
        }
      });
    } else {
      migrationManager.addComputedProp({
        name: getterName,
        returnType: getter.getReturnTypeNode()?.getText(),
        statements: getter.getBodyText(),
      });
    }
  });
};
