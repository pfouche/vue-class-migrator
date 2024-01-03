import { project, expectMigration } from '../utils';

describe('Data Property Migration', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  describe('Class getter', () => {
    test('Class get becomes computed property', async () => {
      await expectMigration(
        `@Component
                export default class Test extends Vue {
                    foo = 'abc';
                    
                    get params(): string {
                        return "hello" + this.foo;
                      }
                }`,
        // Results
        `import { ref, computed } from "vue";
                  const foo = ref('abc');
                  
                  const params = computed(() => {
                    return "hello" + foo.value;
                  }
                  );
                  `,
      );
    });
  });

  describe('Class setter', () => {
    test('Class set unsupported', async () => {
      await expectMigration(
        `@Component
                export default class Test extends Vue {
                    set params(p1: string): void {
                        console.log(p1);
                      }
                }`,
        // Results
        `console.error('MIGRATION ERROR: Setter without getter unsupported: params')`,
      );
    });
  });

  describe('Class getters & setters', () => {
    test('get & set becomes computed property', async () => {
      await expectMigration(
        `@Component
                export default class Test extends Vue {
                    foo = 'abc';
                    
                    get params(): string {
                        return "hello";
                    }
                    set params(p1: string): void {
                        this.foo = p1;
                    }
                }`,
        // Results
        `import { ref, computed } from "vue";
                  const foo = ref('abc');
                  
                  const params = computed( {
                    get() {
                      return "hello";
                    }
                    ,set(p1: string): void {
                      foo.value = p1;
                    }
                  }  
                  );
                  `,
      );
    });
  });
});
