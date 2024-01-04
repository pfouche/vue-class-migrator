import {project, expectMigration} from '../utils';

describe('Provide Migration', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  test('Standard', async () => {
    await expectMigration(
      `@Component()
                export default class Test extends Vue {
                    @Provide('key0')
                    p1: string = 'foo'

                    @ProvideReactive('key1')
                    p2: SomeType = {a: 'a0', b: 'b0'}
                }`,
      // Results
      `import { provide } from "vue";
                export const key0 = Symbol() as InjectionKey<string>;
                provide(key0, 'foo');
                
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
      `import { provide } from "vue";
                console.error('MIGRATION ERROR: key must be declared in @Provide.')
                
                `,
    );
  });
});
