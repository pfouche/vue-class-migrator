import {ClassDeclaration, SourceFile} from 'ts-morph';
import {extractClassPropertyData, extractPropertiesWithDecorator, unsupported} from '../../utils';
import {setupSpecialMethods, vueSpecialMethods} from '../../config';
import {addVueImport} from "../../../__tests__/utils";

export default (clazz: ClassDeclaration, outFile: SourceFile) => {
  const fieldNames = extractClassPropertyData(clazz).map(p => p.getName());
  const propNames = extractPropertiesWithDecorator(clazz, 'Prop').map(p => p.getName());

  vueSpecialMethods
    .filter((m) => clazz.getMethod(m))
    .forEach((m) => {
      const method = clazz.getMethodOrThrow(m);
      const name = method.getName();
      const setupName = setupSpecialMethods[name];
      if (setupName) {
        addVueImport(outFile, setupName);
        outFile.addStatements(writer =>
          writer
            .write(`${setupName}(() =>`)
            .block(() => {
              const body = transformMethodBody(method.getBodyText(), propNames, fieldNames);
              writer.write(body);
            })
            .write(')'));
      } else {
        unsupported(outFile, `Function ${name}() not supported in setup() hook.`);
      }
      // mainObject.addMethod({
      //   name: method.getName(),
      //   isAsync: method.isAsync(),
      //   returnType: typeNode,
      //   statements: method.getBodyText(),
      // });
    });

  const methods = clazz
    .getMethods()
    .filter(
      (m) => !vueSpecialMethods.includes(m.getName())
        && !['data'].includes(m.getName())
        && !m.getDecorator('Watch'),
    );

  if (methods.length) {
    methods.forEach((method) => {
      if (method.getDecorators().length) {
        throw new Error(`The method ${method.getName()} has non supported decorators.`);
      }

      const typeNode = method.getReturnTypeNode()?.getText();
      outFile.addFunction({
        name: method.getName(),
        parameters: method.getParameters().map((p) => p.getStructure()),
        isAsync: method.isAsync(),
        returnType: typeNode,
        statements: transformMethodBody(method.getBodyText(), propNames, fieldNames),
      });
      // methodsObject.addMethod({
      //     name: method.getName(),
      //     parameters: method.getParameters().map((p) => p.getStructure()),
      //     isAsync: method.isAsync(),
      //     returnType: typeNode,
      //     statements: method.getBodyText(),
      // });
    });
  }
};

/**
 * Replaces class method calls with module function calls.
 * Replaces 'this.foo(' with 'foo('.
 * @param body a method body
 */
export const transformMethodCalls = (body: string): string => {
  return body.replaceAll(/(this\.)([a-zA-Z_][0-9a-zA-Z_]*\()/g, '$2');
};

/**
 * Replaces class-style prop value expressions with setup-style expression
 * Replaces 'this.foo' with 'props.foo' when foo is a prop.
 *
 * @param body a method body
 * @param props all the props of the component
 */
export const transformPropsValues = (body: string, props: string[]): string => {
  let newBody = body;
  props.forEach(p => newBody = newBody.replaceAll(`this.${p}`, `props.${p}`));
  return newBody;
};

/**
 * Replaces class-style field value expressions with setup-style expression
 * Replaces 'this.foo' with 'foo.value' when foo is an ordinary class field, supposedly turned into a ref.
 *
 * @param body a method body
 * @param fields all the fields of the component
 */
export const transformFieldValues = (body: string, fields: string[]): string => {
  let newBody = body;
  fields.forEach(p => newBody = newBody.replaceAll(`this.${p}`, `${p}.value`));
  return newBody;
};

export const transformMethodBody = (body: string | undefined, props: string[], fields: string[]) => {
  if (!body) return '' 
  let newBody = body;
  newBody = transformMethodCalls(newBody);
  newBody = transformPropsValues(newBody, props);
  newBody = transformFieldValues(newBody, fields);
  return newBody;
}; 
