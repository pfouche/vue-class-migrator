import type {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  ClassDeclaration,
  PropertyDeclaration,
  Node, SourceFile,
} from 'ts-morph';
import {SyntaxKind} from 'ts-morph';
import logger from "./logger";

export const addPropertyObject = (mainObject: ObjectLiteralExpression, propName: string, initializer = '{}'): ObjectLiteralExpression => mainObject
  .addPropertyAssignment({
    name: propName,
    initializer,
  })
  .getFirstDescendantByKindOrThrow(SyntaxKind.ObjectLiteralExpression);

export const addPropertyArray = (mainObject: ObjectLiteralExpression, propName: string, initializer = '[]'): ArrayLiteralExpression => mainObject
  .addPropertyAssignment({
    name: propName,
    initializer,
  })
  .getFirstDescendantByKindOrThrow(SyntaxKind.ArrayLiteralExpression);

export const getObjectProperty = (
  mainObject: ObjectLiteralExpression,
  property: string,
): ObjectLiteralExpression => {
  const computedObject = mainObject
    .getProperty(property)
    ?.getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression);
  if (computedObject) {
    return computedObject;
  }
  return addPropertyObject(mainObject, property);
};

export const getArrayProperty = (
  mainObject: ObjectLiteralExpression,
  property: string,
): ArrayLiteralExpression => {
  const computedObject = mainObject
    .getProperty(property)
    ?.getFirstDescendantByKind(SyntaxKind.ArrayLiteralExpression);
  if (computedObject) {
    return computedObject;
  }

  return addPropertyArray(mainObject, property);
};

export const extractPropertiesWithDecorator = (
  clazz: ClassDeclaration,
  decoratorName: string,
): PropertyDeclaration[] => clazz
  .getProperties()
  .filter((prop) => prop.getDecorator(decoratorName));

export const extractClassPropertyData = (clazz: ClassDeclaration): PropertyDeclaration[] =>
  clazz.getProperties().filter((prop) => !prop.getDecorators().length);

export const stringNodeToSTring = (node: Node): string => {
  if (
    node.isKind(SyntaxKind.StringLiteral)
    || node.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)
  ) {
    return node.getLiteralText();
  }
  throw new Error(`Node is not a string: ${node.getKindName()}`);
};

export const unsupported = (outFile: SourceFile, msg: string) => {
  const m = `MIGRATION ERROR: ${msg}`;
  outFile.addStatements([`console.error('${m}')`]);
  logger.warn(m)
}; 

export const info = (outFile: SourceFile, msg: string) => {
  const m = `MIGRATION INFO: ${msg}`;
  outFile.addStatements([`console.log('${m}')`]);
  logger.info(m)
}; 
