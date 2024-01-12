import { project, expectMigration, expectMigrationToThrow } from '../utils';

describe('Data Property Migration', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  describe('Data method unsupported', () => {
    test('Data method unsupported in @Component', async () => {
      await expectMigration(
        `@Component({
                    data() {
                        return {
                            sun,
                            moon: false
                        }
                    }
                })
                export default class Test extends Vue {}`,
        // Throws
        `console.error('MIGRATION ERROR: Unsupported @Component option: data')
                  console.error('MIGRATION ERROR: Having a class with @Component({data(): ...} or a data() method is not supported.')`,
      );
    });

    test('@Component data unsupported', async () => {
      await expectMigration(
        `@Component({
                    data,
                })
                export default class Test extends Vue {}`,
        // Throws
        `console.error('MIGRATION ERROR: @Component Data prop should be an object or a method. Type: ShorthandPropertyAssignment')
                  console.error('MIGRATION ERROR: Unsupported @Component option: data')
                  console.error('MIGRATION ERROR: Having a class with @Component({data(): ...} or a data() method is not supported.')`,
      );
    });

    
    test('Data method unsupported in component class', async () => {
      await expectMigration(
        `@Component
                export default class Test extends Vue {
                    data() {
                        return {};
                    };
                }`,
        // Throws
        `console.error('MIGRATION ERROR: Having a class with @Component({data(): ...} or a data() method is not supported.')`,
      );
    });
  });

  describe('Class properties', () => {
    test('Class properties are included as data', async () => {
      await expectMigration(
        `@Component
                export default class Test extends Vue {
                    /**
                     * jsdoc 1
                     * jsdoc 2
                     */
                    myProp: number; // trailing comment 1
                    // comment 1
                    // comment 2
                    myProp2;  // trailing comment 2
                    myProp3 = false; // trailing comment 3
                }`,
        // Results
        `import { Ref, ref } from "vue";
                  
                  /**
                   * jsdoc 1
                   * jsdoc 2
                   */
                  const myProp: Ref<number> = ref();
                    // comment 1
                    // comment 2
                  const myProp2 = ref();
                  const myProp3 = ref(false); // trailing comment 3
                `,
      );
    });

    test('Big class property named data', async () => {
      await expectMigration(
        `@Component()
                export default class Test extends Vue {
                    data: SectionData = {
                            form: {
                            ref: "tourTranslationVolumeForm",
                            valid: true,
                            dialog: {
                                creating: true,
                                open: false,
                                loading: false,
                                tour_count: 0,
                                min_score: 0,
                                use_tours_per_week: false,
                                language_id: 0,
                                language_name: "",
                                },
                            },
                    };
                }`,
        // Results
        `import { Ref, ref } from "vue";

                  const data: Ref<SectionData> = ref({
                            form: {
                                    ref: "tourTranslationVolumeForm",
                                    valid: true,
                                    dialog: {
                                    creating: true,
                                    open: false,
                                    loading: false,
                                    tour_count: 0,
                                    min_score: 0,
                                    use_tours_per_week: false,
                                    language_id: 0,
                                    language_name: "",
                                    },
                                    },
                                });
                    `,
      );
    });
  });
});
