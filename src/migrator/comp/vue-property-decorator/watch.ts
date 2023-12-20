import {Decorator, SyntaxKind} from 'ts-morph';
import {stringNodeToSTring} from '../../utils';
import type MigrationManager from '../migratorManager';

// @Watcher
export default (migrationManager: MigrationManager) => {
  const {clazz} = migrationManager;
  const watchers = clazz.getMethods().filter((m) => m.getDecorator('Watch'));

  watchers.forEach((watcher) => {
    const watcherName = watcher.getName();
    const watcherDecorators: Decorator[] = watcher
      .getDecorators()
      .filter((decorator) => decorator.getName() === 'Watch');

    if (watcherDecorators.length > 1) {
      migrationManager.unsupported(`Watching multiple properties is not supported: ${watcherName}`);
      return
    }
    
    const watcherDecorator = watcherDecorators[0];
    const decoratorArgs = watcherDecorator.getArguments();
    const watchPath = stringNodeToSTring(decoratorArgs[0]);
    const watchOptions = decoratorArgs[1]
      ?.asKindOrThrow(SyntaxKind.ObjectLiteralExpression)
      .getText();

    migrationManager.addWatch({
      path: watchPath,
      options: watchOptions,
      handlerMethod: watcherName,
      parameters: watcher.getParameters().map((p) => p.getStructure()),
      isAsync: watcher.isAsync(),
      body: watcher.getBodyText() ?? '',
    });
  });
};
