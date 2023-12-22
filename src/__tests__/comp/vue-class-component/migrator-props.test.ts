import { project, expectMigration } from '../utils';

describe('Component props', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  test('Short hand assignment', async () => {
    await expectMigration(
      `const props = {
                test: 1
            };
            
            @Component({
                props
            })
            export default class Test extends Vue {}`,

      // Result
      `const props = {
                  test: 1
                };
                console.error('MIGRATION ERROR: Unsupported @Component option: props')`,
    );
  });

  test('@Component props become properties', async () => {
    await expectMigration(
      `@Component({
                props: {
                    myProp: {
                        default: true,
                        required: false,
                        type: String
                    },
                    shortHand
                }
            })
            export default class Test extends Vue {}`,
      
      // Result
      `console.error('MIGRATION ERROR: Unsupported @Component option: props')`,
    );
  });

  test('Empty @Component props are ignored', async () => {
    await expectMigration(
      `@Component({
                name: "test",
                props: {}
            })
            export default class Test extends Vue {}`,
      // Result
      `console.error('MIGRATION ERROR: Unsupported @Component option: name')
                console.error('MIGRATION ERROR: Unsupported @Component option: props')`,
    );
  });
});
