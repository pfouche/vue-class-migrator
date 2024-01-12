import {project, expectMigration} from '../utils';

describe('Inject Migration', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  test('Standard', async () => {
    await expectMigration(
      `@Component()
                export default class Test extends Vue {
                    @Inject('key0')
                    p1!: string

                    @InjectReactive('key1')
                    p2
                }`,
      // Results
      `import { inject } from "vue";
      
                const p1 = inject(key0);
                
                const p2 = inject(key1);
                
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
