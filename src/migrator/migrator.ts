import path from 'path';
import {
  Project,
  SourceFile,
} from 'ts-morph';
import logger from './logger';
import {createCompositionMigrationManager} from './comp/migratorManager';
import migrateVueClassToCompositionApi from './comp';
import {createMigrationManager} from './migratorManager';
import migrateVueClassComponent from './vue-class-component';
import migrateVueClassProperties from './vue-property-decorator';
import migrateVuexDecorators from './vuex';
import {getScriptContent, injectScript, vueFileToSFC} from './migrator-to-sfc';

const migrateTsFile = async (project: Project, sourceFile: SourceFile): Promise<SourceFile> => {
  const filePath = sourceFile.getFilePath();
  const {name, ext} = path.parse(path.basename(filePath));
  const outPath = path.join(path.dirname(filePath), `${name}_migrated${ext}`);
  const outFile = project.createSourceFile(outPath, sourceFile.getText(), {overwrite: true});

  try {
    const migrationManager = createMigrationManager(sourceFile, outFile);

    migrateVueClassComponent(migrationManager);
    migrateVueClassProperties(migrationManager);
    migrateVuexDecorators(migrationManager);
  } catch (error) {
    await outFile.deleteImmediately();
    throw error;
  }
  return outFile.moveImmediately(sourceFile.getFilePath(), {overwrite: true});
};

const migrateTsFileToCompositionApi = async (project: Project, sourceFile: SourceFile): Promise<SourceFile> => {
  const filePath = sourceFile.getFilePath();
  const {name, ext} = path.parse(path.basename(filePath));
  const outPath = path.join(path.dirname(filePath), `${name}_migrated${ext}`);
  const outFile = project.createSourceFile(outPath, sourceFile.getText(), {overwrite: true});

  try {
    const migrationManager = createCompositionMigrationManager(sourceFile, outFile);

    migrateVueClassToCompositionApi(migrationManager);
    // XXX Remove that when done
    const mainObjectVariable = outFile
      .getVariableDeclarations()
      .filter((decl) => decl.getName() === 'mainObject')
      .pop()

    // mainObjectVariable?.remove()

  } catch (error) {
    await outFile.deleteImmediately();
    throw error;
  }
  return outFile.moveImmediately(sourceFile.getFilePath(), {overwrite: true});
};

const migrateVueFile = async (project: Project, vueSourceFile: SourceFile, composition: boolean) => {
  const scriptContent = getScriptContent(vueSourceFile);
  if (!scriptContent) {
    throw new Error('Unable to extract script tag content');
  }
  const filePath = vueSourceFile.getFilePath();
  const {name} = path.parse(path.basename(filePath));
  const outPath = path.join(path.dirname(filePath), `${name}_temp_migrated.ts`);
  let outFile = project.createSourceFile(outPath, scriptContent, {overwrite: true});

  try {
    outFile = composition
      ? await migrateTsFileToCompositionApi(project, outFile)
      : await migrateTsFile(project, outFile);
    const vueFileText = vueSourceFile.getText();
    vueSourceFile.removeText();
    vueSourceFile.insertText(0, injectScript(outFile, vueFileText, composition));

    await vueSourceFile.save();
    return vueSourceFile;
  } finally {
    await outFile.deleteImmediately();
  }
};

export const migrateFile = async (project: Project, sourceFile: SourceFile, composition: boolean = false) => {
  logger.info(`Migrating ${sourceFile.getBaseName()}`);
  if (!sourceFile.getText().includes('@Component')) {
    throw new Error('File already migrated');
  }

  const ext = sourceFile.getExtension();

  if (ext === '.ts') {
    return composition
      ? await migrateTsFileToCompositionApi(project, sourceFile)
      : await migrateTsFile(project, sourceFile);
  }

  if (ext === '.vue') {
    return migrateVueFile(project, sourceFile, composition);
  }

  throw new Error(`Extension ${ext} not supported`);
};

export const migrateDirectory = async (directoryPath: string, toSFC: boolean, composition: boolean) => {
  const directoryToMigrate = path.join(process.cwd(), directoryPath);
  const project = new Project({});

  project.addSourceFilesAtPaths(`${directoryToMigrate}/**/*.(ts|vue|scss)`)
    .filter((sourceFile) => !['.vue', '.ts'].includes(sourceFile.getExtension())
      || sourceFile.getFilePath().includes('node_modules'))
    .forEach((file) => project.removeSourceFile(file));

  const finalFilesToMigrate = project
    .getSourceFiles()
    .filter(
      (file) => ['.vue', '.ts'].includes(file.getExtension())
        && !file.getFilePath().includes('node_modules')
        && file.getText().includes('@Component'),
    );

  logger.info(
    `Migrating directory: ${directoryToMigrate}, ${finalFilesToMigrate.length} Files needs migration`,
  );

  const migrationPromises = finalFilesToMigrate
    .map((sourceFile) => migrateFile(project, sourceFile, composition)
      .catch((err) => {
        logger.error(`Error migrating ${sourceFile.getFilePath()}`);
        logger.error(err);
        return Promise.reject(err);
      }));

  try {
    await Promise.all(migrationPromises);
  } catch (error) {
    return;
  }

  if (toSFC) {
    const vueFiles = project
      .getSourceFiles()
      .filter(
        (file) => ['.vue'].includes(file.getExtension()),
      );

    logger.info(`Migrating directory: ${directoryToMigrate}, files to SFC`);
    await Promise.all(vueFiles.map((f) => vueFileToSFC(project, f)));
  }
};
