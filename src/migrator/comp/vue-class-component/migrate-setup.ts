import {ClassDeclaration, SyntaxKind} from 'ts-morph';
import type MigrationManager from "../migratorManager";

export default (migrationManager: MigrationManager) => {
  const setup = getSetup(migrationManager.clazz);
  if (!setup)
    return;
  if (setup.isKind(SyntaxKind.PropertyAssignment)) {
    // setup: () => {} | data: function() {}
    const initializer = setup.getInitializerOrThrow('Explicit setup property initializer required');
    if (initializer.isKind(SyntaxKind.ArrowFunction)
      || initializer.isKind(SyntaxKind.FunctionExpression)
    ) {
      const statements = initializer.getBodyText();
      if (statements)
        migrationManager.addSetup(statements);
    }
  } else
    migrationManager.unsupported('setup function in @Component must be declared as arrow function or function expression');
};

const getSetup = (clazz: ClassDeclaration) => {
  return clazz
    .getDecorator('Component')
    ?.getArguments()
    .pop()
    ?.asKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    ?.getProperty('setup');
};