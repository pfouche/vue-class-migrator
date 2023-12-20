import {Node, SyntaxKind, TypeNode} from 'ts-morph';
import {extractPropertiesWithDecorator} from '../../utils';
import type MigrationManager from '../migratorManager';

export type PropOptions = {
  propName: string;
  required: boolean;
  defaultValue: string |undefined;
  propNode: Node | undefined;
  tsType: TypeNode | undefined;
}

export type PropsOptions = { [key: string]: PropOptions }

export type AddProps = {
  atLeastOneDefaultValue: boolean,
  propsOptions: PropsOptions
}

// @Prop
export default (migrationManager: MigrationManager) => {
  const {clazz} = migrationManager;
  const props = extractPropertiesWithDecorator(clazz, 'Prop');


  const propsOptions: PropsOptions = {};
  let atLeastOneDefaultValue = false
  
  props.forEach((prop) => {
    const decoratorArgs = prop.getDecoratorOrThrow('Prop').getArguments();
    const propOptions: Node | undefined = decoratorArgs[0];
    let defaultValue, required = true;
    if (propOptions) {
      const propOptionsKind = propOptions.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
      defaultValue = propOptionsKind.getProperty('default')?.getLastChild()?.getText();
      if (defaultValue)
        atLeastOneDefaultValue = true
      const requiredValue = propOptionsKind.getProperty('required')?.getLastChild()?.getText();
      required = requiredValue === 'true' ? true :
        (requiredValue === 'false' ? false : (!!defaultValue ))  
    }
    const propTsType = prop.getTypeNode();
    let propName = prop.getName();
    propsOptions[propName] = {
      propName,
      defaultValue,
      required,
      propNode: propOptions,
      tsType: propTsType,
    };
  });

  migrationManager.addProps({propsOptions, atLeastOneDefaultValue});

  // props.forEach((prop) => {
  //   const decoratorArgs = prop.getDecoratorOrThrow('Prop').getArguments();
  //   const propOptions: Node | undefined = decoratorArgs[0];
  //   const propTsType = prop.getTypeNode();
  //   migrationManager.addProp({
  //     propName: prop.getName(),
  //     propNode: propOptions,
  //     tsType: propTsType,
  //   });
  // });
};
