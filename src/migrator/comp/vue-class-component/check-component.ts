import { ClassDeclaration, SyntaxKind } from 'ts-morph';
import {unsupported} from "../../utils";
import type MigrationManager from "../migratorManager";

const supportedComponentProperties = ['components']

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

  const dataProp = componentProperties?.getProperties().forEach(p => {
    const identifier = p.getFirstChild()?.getText();
    if (!supportedComponentProperties.find(scp => scp === identifier))
      migrationManager.unsupported(`Unsupported @Component option: ${identifier}`)
  })
};
