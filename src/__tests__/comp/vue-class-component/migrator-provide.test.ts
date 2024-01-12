import {project, expectMigration} from '../utils';

describe('Provide Migration', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  test('Standard', async () => {
    await expectMigration(
      `@Component()
                export default class Test extends Vue {
                
                    /**
                     * jsdoc1
                     * jsdoc2
                     */
                    @Provide('key0')
                    p1: string = 'foo'

                    // Comment 1
                    // Comment 2
                    @ProvideReactive('key1')
                    p2: SomeType = {a: 'a0', b: 'b0'}
                }`,
      // Results
      `import { provide, InjectionKey } from "vue";

                /**
                 * jsdoc1
                 * jsdoc2
                 */
                export const key0 = Symbol() as InjectionKey<string>;
                provide(key0, 'foo');
                
                // Comment 1
                // Comment 2
                export const key1 = Symbol() as InjectionKey<SomeType>;
                provide(key1, {a: 'a0', b: 'b0'});
                
                `,
    );
  });
  
  test('No key', async () => {
    await expectMigration(
      `@Component()
                export default class Test extends Vue {
                    @Provide
                    p1: string = 'foo'
                }`,
      // Results
      `import { provide, InjectionKey } from "vue";
                console.error('MIGRATION ERROR: key must be declared in @Provide.')
                
                `,
    );
  });
});
