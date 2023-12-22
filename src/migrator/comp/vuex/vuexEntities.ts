import {PropertyDeclaration, SyntaxKind} from 'ts-morph';
import {extractPropertiesWithDecorator, stringNodeToSTring} from '../../utils';
import type MigrationManager from '../migratorManager';
import {AddVuexEntities, VuexDecorator, vuexEntities} from "../types";

function processVuexEntity(
  decorator: VuexDecorator,
  vuexField: PropertyDeclaration,
  optionsPerNamespace: {
    [p: string]: AddVuexEntities
  }) {
  const decoratorArgs = vuexField.getDecoratorOrThrow(decorator).getArguments();
  const name = vuexField.getName();
  const vuexName = decoratorArgs[0]
    ? stringNodeToSTring(decoratorArgs[0])
    : name;
  const options = decoratorArgs[1]?.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
  const namespace = options?.getProperty('namespace')
    ?.asKindOrThrow(SyntaxKind.PropertyAssignment)
    .getInitializerIfKindOrThrow(SyntaxKind.StringLiteral)
    .getLiteralText() || '';
  
  let entry = optionsPerNamespace[namespace];
  if (!entry) {
    entry = {namespace, entities: []};
    optionsPerNamespace[namespace] = entry;
  }
  entry.entities.push({
    name,
    vuexName,
  });
}

export default (migrationManager: MigrationManager, decorator: VuexDecorator) => {
  const {clazz} = migrationManager;
  const vuexFields = extractPropertiesWithDecorator(clazz, decorator);
  const optionsPerNamespace: { [key: string]: AddVuexEntities } = {};
  if (!vuexFields.length) {
    return;
  }
  vuexFields.forEach((vuexField) => {
    processVuexEntity(decorator, vuexField, optionsPerNamespace);
  });
  const addVuexEntitiesOptions = Object.entries(optionsPerNamespace)
    .map(([key, values]) => values);
  addVuexEntitiesOptions.sort((opt1, opt2) =>
    (opt1.namespace > opt2.namespace) ? 1 : ((opt2.namespace > opt1.namespace) ? -1 : 0));
  migrationManager.addVuexEntities(addVuexEntitiesOptions, vuexEntities[decorator]);
};
