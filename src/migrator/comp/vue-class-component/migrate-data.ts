import {
  ClassDeclaration,
  SourceFile,
  SyntaxKind,
  VariableDeclarationKind,
} from 'ts-morph';
import {extractClassPropertyData, unsupported} from "../../utils";
import {addVueImport} from "../../../__tests__/utils";

export default (clazz: ClassDeclaration, outFile: SourceFile) => {
  const classPropertyData = extractClassPropertyData(clazz);
  const componentDecoratorDataMethod = getData(clazz);
  const clazzDataMethod = clazz.getMethod('data');
  if (componentDecoratorDataMethod || clazzDataMethod) {
    unsupported(outFile, 'Having a class with @Component({data(): ...} or a data() method is not supported.');
  }

  if (classPropertyData.length) {
    const atLeastOneType = !!classPropertyData.find(p => p.getTypeNode())
    if (atLeastOneType) 
      addVueImport(outFile, 'Ref');
    addVueImport(outFile, 'ref');
    outFile.addStatements(['\n']);
    classPropertyData.forEach((propertyData) => {
      const typeNode = propertyData.getTypeNode()?.getText();
      const initializer = propertyData.getInitializer()?.getText();
      outFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [{
          name: propertyData.getName(),
          type: typeNode ? `Ref<${typeNode}>` : undefined,
          initializer: initializer ? `ref(${initializer})` : 'ref()',
        }],
      });
    });
  }
};

const getData = (clazz: ClassDeclaration) => {
  return clazz
    .getDecorator('Component')
    ?.getArguments()
    .pop()
    ?.asKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    ?.getProperty('data');
};