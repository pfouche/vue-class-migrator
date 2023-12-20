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

  // test('Class @Prop with method assignment become properties', async () => {
  //   await expectMigration(
  //     `@Component()
  //               export default class Test extends Vue {
  //                   @Prop({
  //                       type: Object,
  //                       default() {
  //                         return {
  //                           canEdit: true,
  //                           canCreate: true,
  //                           canDelete: true,
  //                         };
  //                       },
  //                     })
  //                     permissions!: CommentPermissions;
  //               }`,
  //     // Result
  //     `import { withDefaults, defineProps } from "vue";
  //                type Props = {
  //                  permissions!: CommentPermissions
  //                }
  //               
  //                const props = withDefaults(defineProps<Props>(),
  //                  {
  //                    permissions: 'abc',
  //                  })`,
  //     );
  // });

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
      `import { defineComponent } from "vue";
    
                export default defineComponent({
                    props: {
                        myProp: {
                            default: true,
                            required: false,
                            type: String
                        },
                        checkId: {
                            type: String
                        }
                    }
                })`,
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
      `import { defineComponent, PropType } from "vue";
    
                export default defineComponent({
                    props: {
                        checkId: {
                            type: Array as PropType<MyCheckId[]>
                        }
                    }
                })`,
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
      `import { defineComponent, PropType } from "vue";

                export default defineComponent({
                    props: {
                        checkId: { default: 3,
                            type: Object as PropType<MyCheckId>
                        }
                    }
                })`,
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

  test('@Prop type collision with typescript prop assigns the @Prop type', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Prop({ type: String })
                    checkId: MyCheckId;
                }`,
      // Results
      `import { defineComponent } from "vue";

                export default defineComponent({
                    props: {
                        checkId: { type: String }
                    }
                })`,
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
      `import { defineComponent } from "vue";
    
                export default defineComponent({
                    props: {
                        checkId: { type: String }
                    }
                })`,
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
      `import { defineComponent } from "vue";
    
                export default defineComponent({
                    props: {
                        checkId: { type: String }
                    }
                })`,
    );
  });
});
