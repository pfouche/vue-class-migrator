import {randomBytes} from 'crypto';
import {Project, SourceFile} from 'ts-morph';
import {migrateFile} from '../migrator';

export const project = new Project({useInMemoryFileSystem: true});
export const createSourceFile = (content = undefined as string | undefined, ext = 'ts') => {
  const randomString = randomBytes(5).toString('hex');
  return project.createSourceFile(`./${randomString}.${ext}`, content);
};

export const expectMigration = async (sourceCode: string, targetCode: string): Promise<void> => {
  const sourceFile = createSourceFile(sourceCode.replaceAll('  ', ''));

  const migratedFile = await migrateFile(project, sourceFile);
  expect(migratedFile.getText().replaceAll('  ', ''))
    .toBe(targetCode.replaceAll('  ', ''));
};

export const expectMigrationToThrow = async (
  sourceCode: string,
  errorMessage: string,
): Promise<void> => {
  const sourceFile = createSourceFile(sourceCode);
  await expect(migrateFile(project, sourceFile))
    .rejects
    .toThrow(errorMessage);
};

export const addVueImport = (outFile: SourceFile, newImport: string) => {
  addVueOrVuexImport(outFile, newImport, 'vue')
};

export const addVuexImport = (outFile: SourceFile, newImport: string) => {
 addVueOrVuexImport(outFile, newImport, 'vuex-composition-helpers')
};

export const addVueRouterImport = (outFile: SourceFile, newImport: string) => {
  addVueOrVuexImport(outFile, newImport, 'vue-router/composables');
};

export const addVueOrVuexImport = (outFile: SourceFile, newImport: string, module: string) => {
  const vueImport = outFile.getImportDeclaration(
    (importDeclaration) => importDeclaration.getModuleSpecifierValue() === module,
  );

  if (!vueImport) {
    outFile.addImportDeclaration({
      defaultImport: `{ ${newImport} }`,
      moduleSpecifier: module,
    });
  } else {
    const alreadyImported = vueImport.getNamedImports().find(i => i.getName() === newImport);
    if (!alreadyImported)
      vueImport.addNamedImport(newImport);
  }
};
