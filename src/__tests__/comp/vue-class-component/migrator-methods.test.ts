import {expectMigration, project} from '../utils';
import {
  transformFieldValues,
  transformMethodCalls,
  transformPropsValues
} from "../../../migrator/comp/vue-class-component/migrate-methods";

describe('Methods Property Migration', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  describe('Class method', () => {
    test('Unsupported class method', async () => {
      await expectMigration(
        `@Component
                export default class Test extends Vue {
                    created() {
                        console.log("OK");
                    }
                }`,
        // Results
        `console.error('MIGRATION ERROR: Function created() not supported in setup() hook.')`,
      );
    });

    test('Special method goes to root', async () => {
      await expectMigration(
        `@Component
                export default class Test extends Vue {
                    mounted() {
                        console.log("OK");
                    }
                }`,
        // Results
        `import { onMounted } from "vue";
                  onMounted(() => {
                        console.log("OK");
                    }
                    )`,
      );
    });

    test('Method goes to methods', async () => {
      await expectMigration(
        `@Component
                export default class Test extends Vue {
                    mounted() {
                        console.log("OK");
                    }
                    myMethod(param1: string, p2, p3: any): void {
                        console.log("hey")
                    }
                }`,
        // Results
        `import { onMounted } from "vue";
                onMounted(() => {
                        console.log("OK");
                    }
                    )
                    
                function myMethod(param1: string, p2, p3: any): void {
                  console.log("hey")
                  }
                  `,
      );
    });

    test('Method structure is preserved', async () => {
      await expectMigration(
        `@Component
                export default class Test extends Vue {
                    @Prop
                    foo!: string
                    
                    bar = 'abc'
                    
                    method2(): string {
                      return 'xyz';
                    }
                    
                    method1(p1: string): string {
                        return p1 + this.foo + this.bar + this.method2();
                    }
                }`,
        // Results
        `import { ref, defineProps } from "vue";
                  const bar = ref('abc');
                  
                  type Props = {
                    foo: string
                  };

                  const props = defineProps<Props>();
                  
                  function method2(): string {
                      return 'xyz';
                  }
                  
                  function method1(p1: string): string {
                        return p1 + props.foo + bar.value + method2();
                    }
                  `,
      );
    });
  });

  describe('Class setter', () => {
    test('Class set becomes watch property', async () => {
      await expectMigration(
        `@Component
                export default class Test extends Vue {
                    set params(p1: string): void {
                        this.$emit("change", p1);
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
                    get params(): string {
                        return "hello";
                    }
                    set params(p1: string): void {
                        this.$emit("change", p1);
                    }
                }`,
        // Results
        `import { computed } from "vue";
                  const params = computed( {
                    get() {
                      return "hello";
                    }
                    ,set(p1: string): void {
                      this.$emit("change", p1);
                  }
                  }
                  );`,
      );
    });
  });

  describe('Method body replacement', () => {
    test('method call',  () => {
      expect(transformMethodCalls('3 + this.foo() + 4')).toBe('3 + foo() + 4')
      expect(transformMethodCalls('3 + this.foo() + this.bar()')).toBe('3 + foo() + bar()')
      expect(transformMethodCalls(`this._f26ooAw(56, 'aze')`)).toBe(`_f26ooAw(56, 'aze')`)
      expect(transformMethodCalls(`this._26ooAw(56, 'aze')`)).toBe(`_26ooAw(56, 'aze')`)
    });
    
    test('props expressions',  () => {
      expect(transformPropsValues('3 + this.foo + this.bar + this.bat', ['foo', 'bar', 'baz']))
        .toBe('3 + props.foo + props.bar + this.bat')
    });
    
    test('field expressions',  () => {
      expect(transformFieldValues('3 + this.foo + this.bar + this.bat', ['foo', 'bar', 'baz']))
        .toBe('3 + foo.value + bar.value + this.bat')
    });
  });
});
