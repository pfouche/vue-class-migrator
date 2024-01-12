import {project, expectMigration} from '../utils';

describe('Inject Migration', () => {
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
                    @Inject('key0')
                    p1!: string // comment

                    // Comment 1
                    // Comment 2
                    @InjectReactive('key1')
                    p2
                }`,
      // Results
      `import { inject } from "vue";
      
                /**
                 * jsdoc1
                 * jsdoc2
                 */
                const p1 = inject(key0);
                
                // Comment 1
                // Comment 2
                const p2 = inject(key1); // comment
                `,
    );
  });
  
  test('Standard', async () => {
    await expectMigration(
      `@Component()
                export default class Test extends Vue {
                    @Inject
                    p1!: string
                }`,
      // Results
      `import { inject } from "vue";
                console.error('MIGRATION ERROR: key must be declared in @Inject.')
                `,
    );
  });
});
