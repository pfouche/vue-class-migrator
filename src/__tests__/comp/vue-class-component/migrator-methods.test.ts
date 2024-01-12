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
                    @State
                    baz:! any
                    
                    bar = 'abc'
                    
                    get bat() {
                      return 'def'
                    }  
                    
                    method2(): string {
                      return 'xyz';
                    }
                    
                    method1(p1: string): string {
                        return p1 + this.foo + this.bar + this.bat + this.baz.xyz + this.method2();
                    }
                }`,
        // Results
        `import { defineProps, ref, computed } from "vue";
                  import { useState } from "vuex-composition-helpers";
                  
                  type Props = {
                    foo: string
                  };

                  const props = defineProps<Props>();
                  const bar = ref('abc');
                  const {baz} = useState(['baz']);

                  const bat = computed(() => {
                    return 'def'
                  }
                  );
                  
                  function method2(): string {
                      return 'xyz';
                  }
                  
                  function method1(p1: string): string {
                        return p1 + props.foo + bar.value + bat.value + baz.value.xyz + method2();
                    }
                  `,
      );
    });
  });


  test('Router', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    get currentRoute() {
                      return this.$route
                    }  
                    
                    m1() {
                      this.$router.push({name: 'otherRoute'})
                    }
                }`,
      // Results
      `import { computed } from "vue";
                import { useRoute, useRouter } from "vue-router/composables";
                
                const currentRoute = computed(() => {
                  return useRoute()
                }
                );
                
                function m1() {
                  useRouter().push({name: 'otherRoute'})
                }
                `,
    );
  });

  describe('Class setter', () => {
    test('Class set becomes watch property', async () => {
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
                    get params(): string {
                        return "hello";
                    }
                    set params(p1: string): void {
                        this.$emit("change", p1);
                    }
                }`,
        // Results
        `import { defineEmits, computed } from "vue";
        
                  const emit = defineEmits(['change']);
                  
                  const params = computed( {
                    get() {
                      return "hello";
                    }
                    ,set(p1: string): void {
                      emit("change", p1);
                  }
                  }
                  );
                  
                  `,
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
