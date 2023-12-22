import { project, expectMigration } from '../utils';

describe('@Prop decorator', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  test('@Prop become props', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Prop
                    checkId: MyCheckId;
                    
                }`,
      // Result
      `import { defineProps } from "vue";
                type Props = {
                  checkId: MyCheckId
                };

                const props = defineProps<Props>();
                `,
    );
  });

  test('@Component props & @Prop don\'t clash', async () => {
    await expectMigration(
      `@Component({
                    props: {
                        myProp: {
                            default: true,
                            required: false,
                            type: String
                        }
                    }
                })
                export default class Test extends Vue {
                    @Prop
                    checkId: string;            
                }`,
      // Result
      `import { defineProps } from "vue";
                console.error('MIGRATION ERROR: Unsupported @Component option: props')
                
                type Props = {
                  checkId: string
                };
                
                const props = defineProps<Props>();
                `,
    );
  });

  test('@Prop array becomes prop with Array type', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Prop
                    checkId: MyCheckId[];
                    
                }`,
      // Result
      `import { defineProps } from "vue";
                type Props = {
                  checkId: MyCheckId[]
                };
                
                const props = defineProps<Props>();
                `,
    );
  });

  test('@Prop with default become props', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Prop({ default: 3 })
                    checkId: MyCheckId;
                }`,
      // Result
      `import { withDefaults, defineProps } from "vue";
                type Props = {
                  checkId: MyCheckId
                };
                
                const props = withDefaults(defineProps<Props>(), {
                  checkId: 3,
                }
                );
                `,
    );
  });

  test('@Prop general test', async () => {
    await expectMigration(
      `import { Vue, Component, Prop } from 'vue-property-decorator'

                @Component
                export default class YourComponent extends Vue {
                  @Prop() readonly propA: number
                  @Prop({required: false}) readonly propB: number | undefined
                  @Prop({required: true}) readonly propC: string | boolean
                  @Prop({default: 'default value'}) readonly propD!: string
                }`,
      // Results
      `import { withDefaults, defineProps } from "vue";
                type Props = {
                  propA: number
                  propB?: number
                  propC: string | boolean
                  propD: string
                };
                
                const props = withDefaults(defineProps<Props>(), {
                  propD: 'default value',
                }
                );
                `,
    );
  });

  test('@Prop type collision with typescript prop assigns the typescript type', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Prop({ type: String })
                    checkId: MyCheckId;
                }`,
      // Results
      `import { defineProps } from "vue";
                type Props = {
                  checkId?: MyCheckId
                };
                
                const props = defineProps<Props>();
                `,
    );
  });

  test('@Prop type collision with typescript prop of same type passes', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Prop({ type: String })
                    checkId: string;
                }`,
      // Result
      `import { defineProps } from "vue";
                type Props = {
                  checkId?: string
                };
                
                const props = defineProps<Props>();
                `,
    );
  });

  test('@Prop with type and no typescript type passes', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Prop({ type: String })
                    checkId;
                }`,
      // Result
      `import { defineProps } from "vue";
                type Props = {
                  checkId?: undefined
                };
                
                const props = defineProps<Props>();
                `,
    );
  });
});
