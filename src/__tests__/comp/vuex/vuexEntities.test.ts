import { project, expectMigration, expectMigrationToThrow } from '../utils';

describe('Vuex entities', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  test('States', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @State('ss3', { namespace: 'namespace0' })
                    s3!;

                    @State('s4', { namespace: 'namespace0' })
                    s4!;

                    @State s1: string | null;
                  
                    @State("ss2")
                    s2!;
                    
                    @State('s5', { namespace: 'namespace1' })
                    s5!;
                }`,
      // Results
      `import { useState } from "vuex-composition-helpers";
      
                const {s1, ss2: s2} = useState(['s1', 'ss2']);
                const {ss3: s3, s4} = useState('namespace0', ['ss3', 's4']);
                const {s5} = useState('namespace1', ['s5']);
                `
    );
  });


  test('Getters', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Getter('gg3', { namespace: 'namespace0' })
                    g3!;

                    @Getter('g4', { namespace: 'namespace0' })
                    g4!;

                    @Getter g1: string | null;
                  
                    @Getter("gg2")
                    g2!;
                    
                    @Getter('g5', { namespace: 'namespace1' })
                    g5!;
                }`,
      // Results
      `import { useGetters } from "vuex-composition-helpers";
      
                const {g1, gg2: g2} = useGetters(['g1', 'gg2']);
                const {gg3: g3, g4} = useGetters('namespace0', ['gg3', 'g4']);
                const {g5} = useGetters('namespace1', ['g5']);
                `
    );
  });


  test('Mutations', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Mutation('mm3', { namespace: 'namespace0' })
                    m3;

                    @Mutation('m4', { namespace: 'namespace0' })
                    m4: any;

                    @Mutation m1: string | null;
                  
                    @Mutation("mm2")
                    m2;
                    
                    @Mutation('m5', { namespace: 'namespace1' })
                    m5;
                }`,
      // Results
      `import { useMutations } from "vuex-composition-helpers";
      
                const {m1, mm2: m2} = useMutations(['m1', 'mm2']);
                const {mm3: m3, m4} = useMutations('namespace0', ['mm3', 'm4']);
                const {m5} = useMutations('namespace1', ['m5']);
                `
    );
  });

  test('Actions', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Action('aa3', { namespace: 'namespace0' })
                    a3!;

                    @Action('a4', { namespace: 'namespace0' })
                    a4!;

                    @Action a1: string | null;
                  
                    @Action("aa2")
                    a2!;
                    
                    @Action('a5', { namespace: 'namespace1' })
                    a5!;
                }`,
      // Results
      `import { useActions } from "vuex-composition-helpers";
      
                const {a1, aa2: a2} = useActions(['a1', 'aa2']);
                const {aa3: a3, a4} = useActions('namespace0', ['aa3', 'a4']);
                const {a5} = useActions('namespace1', ['a5']);
                `
    );
  });
});
