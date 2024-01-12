import {
  ClassDeclaration,
  SourceFile,
  SyntaxKind,
  VariableDeclarationKind,
} from 'ts-morph';
import {extractClassPropertyData, unsupported} from "../../utils";
import {addVueImport} from "../../../__tests__/utils";
import type MigrationManager from "../migratorManager";

export default (migrationManager: MigrationManager) => {
  const {clazz, outFile} = migrationManager;
  const classPropertyData = extractClassPropertyData(clazz);
  const componentDecoratorDataMethod = getData(clazz);
  const clazzDataMethod = clazz.getMethod('data');
  if (componentDecoratorDataMethod || clazzDataMethod) {
    unsupported(outFile, 'Having a class with @Component({data(): ...} or a data() method is not supported.');
  }
  migrationManager.addData(classPropertyData)
};

const getData = (clazz: ClassDeclaration) => {
  return clazz
    .getDecorator('Component')
    ?.getArguments()
    .pop()
    ?.asKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    ?.getProperty('data');
};