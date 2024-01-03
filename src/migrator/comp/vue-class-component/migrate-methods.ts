import {ClassDeclaration} from 'ts-morph';
import {extractClassPropertyData, extractPropertiesWithDecorator} from '../../utils';
import {setupSpecialMethods, vueSpecialMethods} from '../../config';
import MigrationManager from "../migratorManager";
import {RoutingUsage} from "../types";

export default (migrationManager: MigrationManager) => {

  const clazz = migrationManager.clazz;

  vueSpecialMethods
    .filter((m) => clazz.getMethod(m))
    .forEach((m) => {
      const method = clazz.getMethodOrThrow(m);
      const name = method.getName();
      const setupName = setupSpecialMethods[name];
      if (setupName) {
        migrationManager.addSpecialFunction({name: setupName, body: method.getBodyText()});
      } else {
        migrationManager.unsupported(`Function ${name}() not supported in setup() hook.`);
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
        migrationManager.unsupported(`Method ${method.getName()} has non-supported decorators.`);
      }

      const typeNode = method.getReturnTypeNode()?.getText();
      migrationManager.addFunction({
        name: method.getName(),
        parameters: method.getParameters().map((p) => p.getStructure()),
        isAsync: method.isAsync(),
        returnType: typeNode,
        body: method.getBodyText(),
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

/**
 * Replaces class-style route and router expressions with setup-style expression
 * Replaces 'this.$route' with 'useRoute()' and 'this.$router' with 'useRouter()'.
 *
 * @param body a method body
 */
export const transformRoutingCalls = (body: string, routingUsage: RoutingUsage): string => {
  // Note: Creating additional variables such as 'const route = useRoute()' would be too complex.
  // Plus, it would add a collision risk if a variable 'route' was already defined.
  const newBody1 = body.replaceAll(`this.$router`, `useRouter()`);
  if (newBody1 !== body) routingUsage.useRouter = true;
  const newBody2 = newBody1.replaceAll(`this.$route`, `useRoute()`);
  if (newBody2 !== newBody1) routingUsage.useRoute = true;
  return newBody2;
};


/**
 * Replaces class-style 'emit' expressions with setup-style expression
 * Replaces 'this.$emit(' with 'emit('.
 * The emit function is created in the migrate-emits phase.
 *
 * @param body a method body
 */
export const transformEmitCalls = (body: string): string => {
  const newBody = body.replaceAll(`this.$emit(`, `emit(`);
  return newBody;
};

