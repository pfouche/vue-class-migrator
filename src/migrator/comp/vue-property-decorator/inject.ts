import {ClassDeclaration, Node, SyntaxKind} from 'ts-morph';
import {extractPropertiesWithDecorator} from '../../utils';
import type MigrationManager from '../migratorManager';

export type InjectOptions = {
  propName: string
  key: string | undefined
}

export type AllInjectOptions = { [key: string]: InjectOptions }

export default (migrationManager: MigrationManager) => {
  const {clazz} = migrationManager;
  const options: AllInjectOptions = {};
  buildOptions(clazz, options, 'Inject')
  buildOptions(clazz, options, 'InjectReactive')

  migrationManager.addInjects(options);
};

const buildOptions = (clazz: ClassDeclaration, allOptions: AllInjectOptions, decoratorName: string) => {
  const props = extractPropertiesWithDecorator(clazz, decoratorName);
  props.forEach((prop) => {
    const decoratorArgs = prop.getDecoratorOrThrow(decoratorName).getArguments();
    const propOptions: Node | undefined = decoratorArgs[0];
    let key;
    if (propOptions) {
      const propOptionsKind = propOptions.asKindOrThrow(SyntaxKind.StringLiteral);
      key = propOptionsKind.getLiteralValue();
    }
    let propName = prop.getName();
    allOptions[propName] = {
      propName,
      key,
    };
  });
};