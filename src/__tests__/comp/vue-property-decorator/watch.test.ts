import { project, expectMigration } from '../utils';

describe('@Watch decorator', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });
  
  test('@Watch attribute', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    att = null
                    foo = 'bar'
                    
                    /**
                     * jsdoc1
                     * jsdoc2
                     */
                    @Watch('att')
                    onChanged(val: string) { console.log(this.foo + this.att); }
                }`,
      // Result
      `import { ref, watch } from "vue";
      
                const att = ref(null);
                const foo = ref('bar');
                
                /**
                 * jsdoc1
                 * jsdoc2
                 */
                watch(
                  att,
                  (val: string) => {
                    console.log(foo.value + att.value);
                  },
                );
                `,
    );
  });
  
  test('@Watch with options', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    att = 'abc'
                    
                    // Comment 1
                    // Comment 2
                    @Watch('att', { immediate: true, deep: true })
                    onChanged(val: string) { console.log("onChanged"); }
                }`,
      // Result
      `import { ref, watch } from "vue";
      
                const att = ref('abc');
                
                // Comment 1
                // Comment 2
                watch(
                  att,
                  (val: string) => {
                    console.log("onChanged");
                  },
                  { immediate: true, deep: true },
                );
                `,
    );
  });

  test('@Watch nested attribute', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    att = {foo: bar}
                    
                    @Watch('att.foo')
                    onChanged(val: string) { console.log("onChanged"); }
                }`,
      // Result
      `import { ref, watch } from "vue";
      
                const att = ref({foo: bar});
                
                watch(
                  () => att.value.foo,
                  (val: string) => {
                    console.log("onChanged");
                  },
                );
                `,
    );
  });

  test('@Watch prop', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Prop
                    prop1!: string
                    
                    @Watch('prop1')
                    onChanged(val: string, oldVal: string) {
                        console.log("onChanged");
                    }
                }`,
      // Result
      `import { defineProps, watch } from "vue";

                type Props = {
                  prop1: string
                };

                const props = defineProps<Props>();
                
                watch(
                  () => props.prop1,
                  (val: string, oldVal: string) => {
                    console.log("onChanged");
                  },
                );
                `,
    );
  });

  test('@Watch double property', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Watch('prop1')
                    @Watch('prop2')
                    onChanged(val: string, oldVal: string) {
                        console.log("onChanged");
                    }
                }`,
      // Result
      `console.error('MIGRATION ERROR: Watching multiple properties is not supported: onChanged')`,
    );
  });
});
