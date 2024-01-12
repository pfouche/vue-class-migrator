import type MigrationManager from "../migratorManager";

export default (migrationManager: MigrationManager) => {
  const clazz = migrationManager.clazz;
  const jsdocs = clazz.getJsDocs();
  if (jsdocs.length > 0) {
    const comments = jsdocs[0].getCommentText()?.split('\n');
    if (comments) 
      migrationManager.addComments(comments);
  }
};
