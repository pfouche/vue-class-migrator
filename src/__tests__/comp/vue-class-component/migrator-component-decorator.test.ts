import { project, expectMigration, expectMigrationToThrow } from '../utils';

describe('@Component decorator', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  test('Empty @Component({}) props resolves', async () => {
    await expectMigration(
      `/**
                   * JS Class comment 1
                   * JS Class comment 2
                   */
                 @Component({})
                 export default class Test {}
                 `,
      `console.log(\`MIGRATION: Comments
                // JS Class comment 1
                // JS Class comment 2
                \`)`,
    );
  });

  test('Empty @Component props resolves', async () => {
    await expectMigration(
      `@Component
            export default class Test {}
            `,
      // Result
      ``,
    );
  });

  test('@Component mixins unsupported', async () => {
    await expectMigration(
      `@Component({
                mixins: [A,B,C]
            })
            export default class Test {}`,
      // Result
      `console.error('MIGRATION ERROR: Unsupported @Component option: mixins')`,
    );
  });

  test('@Component mixins and class extending is unsupported', async () => {
    await expectMigration(
      `@Component({
                mixins: [A,B,C]
            })
            export default class Test extends AnotherClass {}`,
      // Result
      `console.error('MIGRATION ERROR: Unsupported @Component option: mixins')
                console.error('MIGRATION ERROR: This component is extending from a class different form Vue. This is not supported.')`,
    );
  });

  test('@Component with params passed as parameter throws', async () => {
    await expectMigrationToThrow(
      `const params = {
                mixins: [A,B,C]
            };
            @Component(params)
            export default class Test extends AnotherClass {}`,
      // Throws
      '@Component props argument should be and object {}',
    );
  });

  test('@Component all assignment variations unsupported', async () => {
    await expectMigration(
      `
            @Component({
                beforeCreate,
                beforeMount() { console.log("beforeMount"); },
                beforeDestroy: () => { console.log("beforeDestroy"); },
                beforeUpdate: function() { console.log("beforeUpdate"); },
                data: () => {},
                methods: {
                  demo(p1: string) {}
                },
                mixins: [A,B,C]
            })
            export default class Test extends Vue {}`,
      // Result
      `console.error('MIGRATION ERROR: Unsupported @Component option: beforeCreate')
                console.error('MIGRATION ERROR: Unsupported @Component option: beforeMount')
                console.error('MIGRATION ERROR: Unsupported @Component option: beforeDestroy')
                console.error('MIGRATION ERROR: Unsupported @Component option: beforeUpdate')
                console.error('MIGRATION ERROR: Unsupported @Component option: data')
                console.error('MIGRATION ERROR: Unsupported @Component option: methods')
                console.error('MIGRATION ERROR: Unsupported @Component option: mixins')
                console.error('MIGRATION ERROR: Having a class with @Component({data(): ...} or a data() method is not supported.')`,
    );
  });
});
