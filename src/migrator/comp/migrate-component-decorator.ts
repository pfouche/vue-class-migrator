import {ClassDeclaration, SourceFile, SyntaxKind} from 'ts-morph';
import MigrationManager from "./migratorManager";
import {unsupported} from "../utils";

export default (clazz: ClassDeclaration, outFile: SourceFile): string => {
  const decorator = clazz.getDecorator('Component');
  if (!decorator) {
    unsupported(outFile,`Class ${clazz.getName()} doesn't have a component decorator.`);
    return ''
  }
  const componentProperties = decorator
    .getArguments()
    .pop()
    ?.asKindOrThrow(SyntaxKind.ObjectLiteralExpression, '@Component props argument should be and object {}');

  const dataProp = componentProperties?.getProperty('data');
  if (dataProp
    && ![
      SyntaxKind.MethodDeclaration,
      SyntaxKind.PropertyAssignment,
    ].some((kind) => dataProp.isKind(kind))) {
    unsupported(outFile,`@Component Data prop should be an object or a method. Type: ${dataProp.getKindName()}`);
  }
  return componentProperties?.getText() ?? '{}';
};
