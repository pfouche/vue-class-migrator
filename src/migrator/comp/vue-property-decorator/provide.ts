import {ClassDeclaration, Node, ParameterDeclaration, PropertyDeclaration, SyntaxKind, TypeNode} from 'ts-morph';
import {commentOptions, extractPropertiesWithDecorator} from '../../utils';
import type MigrationManager from '../migratorManager';
import {CommentOptions} from "../types";

export type ProvideOptions = CommentOptions & {
  propName: string
  key: string | undefined
  initializer: string | undefined
  propNode: Node | undefined
  tsType: TypeNode | undefined
}

export type AllProvideOptions = { [key: string]: ProvideOptions }

export default (migrationManager: MigrationManager) => {
  const {clazz} = migrationManager;
  const options: AllProvideOptions = {};
  buildOptions(clazz, options, 'Provide')
  buildOptions(clazz, options, 'ProvideReactive')

  migrationManager.addProvides(options);
};

const buildOptions = (clazz: ClassDeclaration, allOptions: AllProvideOptions, decoratorName: string) => {
  const props = extractPropertiesWithDecorator(clazz, decoratorName);
  props.forEach((prop) => {
    const decoratorArgs = prop.getDecoratorOrThrow(decoratorName).getArguments();
    const propOptions: Node | undefined = decoratorArgs[0];
    let key, initializer;
    if (propOptions) {
      const propOptionsKind = propOptions.asKindOrThrow(SyntaxKind.StringLiteral);
      key = propOptionsKind.getLiteralValue();
      initializer = prop.getInitializer()?.getText();
    }
    const propTsType = prop.getTypeNode();
    let propName = prop.getName();
    allOptions[propName] = {
      propName,
      key,
      initializer,
      propNode: propOptions,
      tsType: propTsType,
      ...commentOptions(prop)
    };
  });
};