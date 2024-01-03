import {expectMigration, project} from '../utils';
import {findEmittedEvents} from "../../../migrator/comp/vue-class-component/migrate-emits";
import "jest-extended";

describe('Emit Migration', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  describe('findEmittedEvents', () => {

    test('nominal', () => {
      expect(findEmittedEvents(`3 + this.$emit('foo') + this.$emit("bar", 2)`)).toIncludeSameMembers(['foo', 'bar']);
    });
    
    test('none', () => {
      expect(findEmittedEvents('3 + this.foo() + 4')).toBeEmpty();
    });
    
    test('duplicate', () => {
      expect(findEmittedEvents(`3 + this.$emit('foo') + this.$emit('foo', 2)`)).toIncludeSameMembers(['foo']);
    });
  });
  
  test('addEmit', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    m1() {
                      this.$emit('evt0')
                    }
                    m2() {
                      this.$emit('evt1', 2),
                      this.$emit('evt0')
                    }
                }`,
      // Results
      `import { defineEmits } from "vue";
                const emit = defineEmits(['evt0', 'evt1']);
                
                function m1() {
                  emit('evt0')
                }
                
                function m2() {
                  emit('evt1', 2),
                  emit('evt0')
                }
                `,
    );
  });

});
