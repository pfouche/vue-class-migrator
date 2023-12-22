import {
  ArrowFunction,
  ClassDeclaration,
  Node,
  ObjectLiteralExpression,
  OptionalKind,
  ParameterDeclarationStructure,
  SourceFile,
  SyntaxKind,
  TypeNode,
  VariableDeclarationKind,
} from 'ts-morph';
import {ComputedProps, MigratePartProps} from '../types/migrator';
import getDefineComponentInit from './migrate-component-decorator';
import {addVueImport} from "../../__tests__/utils";
import {transformFieldValues, transformMethodCalls, transformPropsValues} from "./vue-class-component/migrate-methods";
import {
  AddFunction,
  AddProps,
  AddSpecialFunction,
  AddVuexEntities,
  AddWatch,
  VuexComposable,
  vuexDecorators
} from "./types";
import {extractClassPropertyData, extractPropertiesWithDecorator, unsupported} from "../utils";
import {supportedDecorators as vueClassPropertyDecorators} from "./vue-property-decorator";


export const supportedDecorators = [
  ...vuexDecorators,
  ...vueClassPropertyDecorators,
]; // Class Property decorators

export default class MigrationManager {
  private _clazz: ClassDeclaration;

  private _mainObject: ObjectLiteralExpression;

  private _outFile: SourceFile;

  constructor(props: MigratePartProps) {
    this._mainObject = props.mainObject;
    this._clazz = props.clazz;
    this._outFile = props.outFile;
  }

  get mainObject(): ObjectLiteralExpression {
    return this._mainObject;
  }

  get clazz(): ClassDeclaration {
    return this._clazz;
  }

  get outFile(): SourceFile {
    return this._outFile;
  }

  unsupported(msg: string) {
    unsupported(this.outFile, msg);
  }

  addModel(options: {
    propName: string,
    eventName: string,
  }) {
    // if (this.mainObject.getProperty('model')) {
    //   throw new Error('The component has two models.')
    // }
    // const modelObject = getObjectProperty(this.mainObject, 'model')
    // modelObject
    //   .addPropertyAssignment({
    //     name: 'prop',
    //     initializer: `"${options.propName}"`,
    //   })
    //
    // modelObject
    //   .addPropertyAssignment({
    //     name: 'event',
    //     initializer: `"${options.eventName}"`,
    //   })
  }

  addProp(options: {
    propName: string;
    propNode: Node | undefined;
    tsType: TypeNode | undefined;
  }) {
    // }): ObjectLiteralExpression {
    // const propsObject = getObjectProperty(this.mainObject, 'props')
    // const {
    //   propName, propNode, tsType,
    // } = options
    //
    // let propObject: ObjectLiteralExpression
    // if (!propNode) {
    //   propObject = addPropertyObject(propsObject, propName)
    //   propObject
    //     .addPropertyAssignment({
    //       name: 'type',
    //       initializer: this.typeNodeToString(tsType),
    //     })
    //   return propObject
    // }

    // if (
    //   propNode.isKind(SyntaxKind.Identifier) // e.g. String
    //   || propNode.isKind(SyntaxKind.ArrayLiteralExpression) // e.g. [String, Boolean]
    // ) {
    //   propObject = addPropertyObject(propsObject, propName)
    //   propObject
    //     .addPropertyAssignment({
    //       name: 'type',
    //       initializer: propNode.getText(),
    //     })
    //   return propObject
    // }
    // if (propNode.isKind(SyntaxKind.ObjectLiteralExpression)) {
    //   propObject = addPropertyObject(propsObject, propName, propNode.getText())
    //   if (!propObject.getProperty('type')) {
    //     propObject
    //       .addPropertyAssignment({
    //         name: 'type',
    //         initializer: this.typeNodeToString(tsType),
    //       })
    //   }
    //   return propObject
    // }
    // throw new Error(`Error adding prop ${propName}, Kind: ${propNode.getKindName()}.`)
  }


  addProps({propsOptions, atLeastOneDefaultValue}: AddProps) {
    const atLeastOneProp = Object.entries(propsOptions).length > 0;
    if (!atLeastOneProp)
      return;

    // Something like: {foo: string, bar: int}
    const propsType = Object.entries(propsOptions)
      .map(([propName, propOptions]) => {
        const typeName = propOptions.tsType?.getText();
        const required = propOptions.required;
        // XXX We'd better remove 'undefined' from the union type, if any. 
        // Would be more robust is undefined is not the last term.
        const correctedTypeName = !required ? typeName?.replace(' | undefined', '') : typeName;
        return `${propName}${required ? '' : '?'}: ${correctedTypeName}`;
      })
      .join('\n');

    if (atLeastOneDefaultValue) {
      addVueImport(this.outFile, 'withDefaults');
      addVueImport(this.outFile, 'defineProps');
      this.outFile.addTypeAlias({name: 'Props', type: `{\n${propsType}\n}`});
      const defaultValues = Object.entries(propsOptions)
        .filter(([, propOptions]) => propOptions.defaultValue)
        .map(([propName, propOptions]) => {
          return `${propName}: ${propOptions.defaultValue},`;
        })
        .join('\n');
      this.outFile.addStatements(writer => {
        writer
          .write(`\nconst props = withDefaults(defineProps<Props>(),`)
          .block(() => writer.write(defaultValues))
          .write(');');
      });
    } else {
      addVueImport(this.outFile, 'defineProps');
      this.outFile.addTypeAlias({name: 'Props', type: `{\n${propsType}\n}`});
      this.outFile.addStatements(['\nconst props = defineProps<Props>();']);
    }
  }

  addComputedProp(options: ComputedProps) {
    addVueImport(this.outFile, 'computed');
    if ('get' in options) {

      // if (options.cache !== undefined) {
      //   syncPropObject.addPropertyAssignment({
      //     name: 'cache',
      //     initializer: `${options.cache}`,
      //   })
      // }
      const getBody = this.transformMethodBody(options.get.statements);
      const setBody = this.transformMethodBody(options.set?.statements);

      this.outFile.addStatements(writer => {
        const setterParam = options.set?.parameters?.[0];
        const setterParamType = setterParam?.type;
        const setterParamTypeText = setterParamType ? `: ${setterParamType}` : '';
        writer
          .write(`\nconst ${options.name} = computed(`)
          .block(() => writer
            .write(`get()`)
            .block(() => writer.write(getBody))
            .write(`,set(${setterParam?.name}${setterParamTypeText}): void`)
            .block(() => writer.write(setBody)))
          .write(');');
      });
    } else {
      const body = this.transformMethodBody(options.statements);
      this.outFile.addStatements(writer => {
        writer
          .write(`\nconst ${options.name} = computed(() => `)
          .block(() => writer.write(body))
          .write(');');
      });

      // computedObject.addMethod({
      //   name: options.name,
      //   returnType: options.returnType,
      //   statements: options.statements,
      // })
    }
  }
  
  addVuexEntities(entitiesPerNamepace: AddVuexEntities[], vuexComposable: VuexComposable) {
    addVueImport(this.outFile, vuexComposable);
    this.outFile.addStatements(writer => writer.newLineIfLastNot());
    entitiesPerNamepace.forEach(({namespace, entities}) => {
      const vuexNames = entities.map(g => `'${g.vuexName}'`).join(', ');
      const args = namespace ? `'${namespace}', [${vuexNames}]` : `[${vuexNames}]`;
      const varNames = entities
        .map(({name, vuexName}) => {
          return name === vuexName ? name : `${vuexName}: ${name}`;
        })
        .join(', ');
      this.outFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: `{${varNames}}`,
            initializer: `${vuexComposable}(${args})`
          },]
      });
    });
  }

  addMethod(options: {
    methodName: string;
    parameters: OptionalKind<ParameterDeclarationStructure>[] | undefined;
    statements: string;
    isAsync?: boolean;
    returnType?: string;
  }) {
    // const methodsMainObject = getObjectProperty(this.mainObject, 'methods')
    //
    // if (methodsMainObject.getProperty(options.methodName)) {
    //   throw new Error(`Duplicated method ${options.methodName}`)
    // }
    // methodsMainObject.addMethod({
    //   name: options.methodName,
    //   parameters: options.parameters,
    //   isAsync: options.isAsync,
    //   returnType: options.returnType,
    //   statements: options.statements,
    // })
  }

  addSpecialFunction({name, body}: AddSpecialFunction) {
    addVueImport(this.outFile, name);
    this.outFile.addStatements(writer =>
      writer
        .write(`${name}(() =>`)
        .block(() => {
          const transformedBody = this.transformMethodBody(body);
          writer.write(transformedBody);
        })
        .write(')'));
  }

  addFunction({name, parameters, isAsync, returnType, body}: AddFunction) {
    this.outFile.addFunction({
      name,
      parameters,
      isAsync,
      returnType,
      statements: this.transformMethodBody(body),
    });
  }

  addWatch({parameters, options, path, isAsync, body}: AddWatch) {
    addVueImport(this.outFile, 'watch');
    const watchGetter = this.createWatchGetter(path);
    const watchCallback = this.withArrowFunction((arrowFunction => {
      arrowFunction.addParameters(parameters || []);
      arrowFunction.setIsAsync(isAsync);
      arrowFunction.setBodyText(body);
    }));
    const watchArgs = [watchGetter, watchCallback];
    if (options)
      watchArgs.push(options);
    this.outFile.addStatements(writer => {
      writer
        .newLineIfLastNot()
        .write(`watch(\n${watchArgs.join(',\n')},\n);`);
    });
  }

  addNamedImport(module: string, namedImport: string) {
    const importDeclaration = this._outFile
      .getImportDeclaration((imp) => imp.getModuleSpecifierValue() === module);
    if (!importDeclaration?.getNamedImports()
      .some((imp) => imp.getText() === namedImport)) {
      importDeclaration?.addNamedImport('PropType');
    }
  }

  private typeNodeToString(typeNode: TypeNode | undefined): string {
    const propertyType = typeNode?.getText() ?? 'any';
    const isArray = Node.isArrayTypeNode(typeNode);
    const isFunction = Node.isFunctionTypeNode(typeNode);
    const propertyConstructorMapping: Record<string, string> = {
      string: 'String',
      boolean: 'Boolean',
      number: 'Number',
    };
    let fallbackType = 'Object';
    fallbackType = isArray ? 'Array' : fallbackType;
    fallbackType = isFunction ? 'Function' : fallbackType;

    if (!propertyConstructorMapping[propertyType]) {
      this.addNamedImport('vue', 'PropType');
      return `${fallbackType} as PropType<${propertyType}>`;
    }

    return propertyConstructorMapping[propertyType];
  }

  private transformMethodBody(body: string | undefined) {
    const propNames = extractPropertiesWithDecorator(this.clazz, 'Prop').map(p => p.getName());
    const fieldNames = extractClassPropertyData(this.clazz).map(p => p.getName());

    if (!body) return '';
    let newBody = body;
    newBody = transformMethodCalls(newBody);
    newBody = transformPropsValues(newBody, propNames);
    newBody = transformFieldValues(newBody, fieldNames);
    return newBody;
  };

  private createWatchGetter(path: string): string | undefined {
    const propNames = extractPropertiesWithDecorator(this.clazz, 'Prop').map(p => p.getName());
    const fieldNames = extractClassPropertyData(this.clazz).map(p => p.getName());

    const segments = path.split('.');
    const first = segments[0];
    const rest = segments.slice(1);
    if (propNames.find(p => p === first)) {
      // () => props.<path>
      const exp = ['props', ...segments].join('.');
      return `() => ${exp}`;
    } else if (fieldNames.find(p => p === first)) {
      if (rest.length === 0) {
        // path is a ref(), so no need for a getter.
        return path;
      } else {
        // () => <first>.value.<rest>
        const exp = [first, 'value', ...rest].join('.');
        return `() => ${exp}`;
      }
    } else {
      this.unsupported(`Watched property '${first}' not found.`);
    }
  }

  private withArrowFunction(callback: (af: ArrowFunction) => void): string {
    this.outFile.addVariableStatement({
        declarations: [{
          name: '$$temp$$',
          initializer: `() => {}`,
        }]
      }
    );
    const temp = this.outFile
      .getVariableStatementOrThrow('$$temp$$');
    const arrowFunction = temp
      .getDeclarations()[0]
      .getInitializerIfKindOrThrow(SyntaxKind.ArrowFunction);
    callback(arrowFunction);
    const result = arrowFunction.getText();
    temp.remove();
    return result;
  }
}

export const createCompositionMigrationManager = (
  sourceFile: SourceFile,
  outFile: SourceFile,
): MigrationManager => {
  // Do not modify this class.
  const sourceFileClass = sourceFile
    .getClasses()
    .filter((clazz) => clazz.getDecorator('Component'))
    .pop();
  const outClazz = outFile
    .getClasses()
    .filter((clazz) => clazz.getDecorator('Component'))
    .pop();

  if (!sourceFileClass || !outClazz) {
    throw new Error('Class implementing the @Component decorator not found.');
  }

  // Validation
  sourceFileClass
    .getProperties()
    .flatMap((prop) => prop.getDecorators())
    .forEach((decorator) => {
      if (!supportedDecorators.includes(decorator.getName())) {
        throw new Error(`Decorator @${decorator.getName()} not supported`);
      }
    });

  const defineComponentInitObject = getDefineComponentInit(sourceFileClass, outFile);
  let clazzReplacement: string;
  if (!outClazz.getDefaultKeyword()) {
    // Non default exported class
    throw new Error('Non-default exported class not supported');
    // clazzReplacement = [
    //   outClazz?.getExportKeyword()?.getText(),
    //   `const ${outClazz.getName()} =`,
    //   `defineComponent(${defineComponentInitObject})`,
    // ]
    //   .filter((s) => s)
    //   .join(' ');
  } else {
    clazzReplacement = [
      outClazz?.getExportKeyword()?.getText(),
      outClazz?.getDefaultKeywordOrThrow()?.getText(),
      `defineComponent(${defineComponentInitObject})`,
    ]
      .filter((s) => s)
      .join(' ');
  }

  // Main structure
  // const mainObject = outClazz
  //   // .replaceWithText(clazzReplacement)
  //   .getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression)

  const mainObject = outClazz
    .replaceWithText('const mainObject = {}')
    .getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression);

  if (!mainObject) {
    throw new Error('Unable to create mainObject');
  }

  const migratePartProps: MigratePartProps = {
    clazz: sourceFileClass,
    mainObject,
    outFile,
    sourceFile,
  };
  return new MigrationManager(migratePartProps);
};
