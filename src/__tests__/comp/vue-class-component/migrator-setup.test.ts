import { project, expectMigration } from '../utils';

describe('@Component setup', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  test('As arrow function', async () => {
    await expectMigration(
      `@Component({
                    setup: () => {
                       // 1 Ignored
                       console.log('Starting...') // 2 ...
                       // 3 ...
                       console.log('...Ending') // 4 ...
                       // 5 Ignored
                    },
            })
            export default class Test {}`,
      // Result
      // I could not get the first and last comment lines added to the out file.
      // They are part of the initializer's body, but are wiped out by writeStatements(). 
      `console.log('Starting...') // 2 ...
                // 3 ...
                console.log('...Ending') // 4 ...`,
    );
  });
  
  test('As anonymous function', async () => {
    await expectMigration(
      `@Component({
                    setup: function() {
                       // 1 Ignored
                       console.log('Starting...') // 2 ...
                       // 3 ...
                       console.log('...Ending') // 4 ...
                       // 5 Ignored
                    },
            })
            export default class Test {}`,
      // Result
      // I could not get the first and last comment lines added to the out file.
      // They are part of the initializer's body, but are wiped out by writeStatements(). 
      `console.log('Starting...') // 2 ...
                // 3 ...
                console.log('...Ending') // 4 ...`,
    );
  });
  
  test('As named function', async () => {
    await expectMigration(
      `@Component({
                    setup() {
                       // 1 Ignored
                       console.log('Starting...') // 2 ...
                       // 3 ...
                       console.log('...Ending') // 4 ...
                       // 5 Ignored
                    },
            })
            export default class Test {}`,
      // Result
      `console.error('MIGRATION ERROR: setup function in @Component must be declared as arrow function or function expression')`,
    );
  });
});
