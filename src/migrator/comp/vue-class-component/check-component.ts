import {SyntaxKind} from 'ts-morph';
import type MigrationManager from "../migratorManager";

const supportedComponentProperties = ['components', 'setup'];

export default (migrationManager: MigrationManager): void => {
  const clazz = migrationManager.clazz
  const decorator = clazz.getDecorator('Component');
  if (!decorator) {
    throw new Error(`Class ${clazz.getName()} doesn't have a component decorator.`);
  }
  const componentProperties = decorator
    .getArguments()
    .pop()
    ?.asKindOrThrow(SyntaxKind.ObjectLiteralExpression, '@Component props argument should be and object {}');
  
  componentProperties?.getProperties().forEach(p => {
    const identifier = p.getFirstChild()?.getText();
    if (!supportedComponentProperties.find(scp => scp === identifier))
      migrationManager.unsupported(`Unsupported @Component option: ${identifier}`)
  });
};
