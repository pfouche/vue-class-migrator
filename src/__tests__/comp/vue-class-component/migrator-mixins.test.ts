import { project, expectMigration, expectMigrationToThrow } from '../utils';

describe('Component extends', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  test('Class extending becomes extends', async () => {
    await expectMigration(
      `@Component
            export default class Test extends AnotherTest {}`,
      // Results
      `console.error('MIGRATION ERROR: This component is extending from a class different form Vue. This is not supported.')`,
    );
  });

  test('Class extending and @Component extends throws', async () => {
    await expectMigration(
      `@Component({
                extends: DemoComponennt
            })
            export default class Test extends AnotherTest {}`,
      // Throws
      `console.error('MIGRATION ERROR: Unsupported @Component option: extends')
                console.error('MIGRATION ERROR: This component is extending from a class different form Vue. This is not supported.')`,
    );
  });

  test('Class extending from mixins(A...) and mixins already set throws', async () => {
    await expectMigration(
      `@Component({
                mixins: [DemoComponennt]
            })
            export default class Test extends mixins(Demo2Componennt) {}`,
      // Throws
      `console.error('MIGRATION ERROR: Unsupported @Component option: mixins')
                console.error('MIGRATION ERROR: This component is extending from a class different form Vue. This is not supported.')`,
    );
  });
});
