import {ClassDeclaration} from 'ts-morph';

export default (clazz: ClassDeclaration) => {
  const classExtend = clazz.getExtends()?.getText();

  // Class extend
  if (classExtend && classExtend !== 'Vue') {
    throw new Error(
      'This component is extending from a class different form Vue. This is not supported.',
    );
  }
};
