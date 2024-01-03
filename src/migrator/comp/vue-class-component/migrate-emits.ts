import type MigrationManager from '../migratorManager';

/**
 * Finds all $emit calls inside the given piece of code and extracts the first parameter as event name.
 * Finds all "this.$emit('<eventName>'".
 */
export function findEmittedEvents(code: string) {
  const matches = code.matchAll(/this.\$emit\(['"]([^']*)['"]/g);
  const withGroups = Array.from(matches);
  const events: string[] = [];

  withGroups.forEach(e => {
    if (e.length >= 2) {
      const eventName = e[1];
      if (!events.includes(eventName))
        events.push(eventName);
    }
  });
  return events;
}

export default (migrationManager: MigrationManager) => {
  const {clazz} = migrationManager;
  const events: string[] = findEmittedEvents(clazz.getText(false));

  if (events.length > 0)
    migrationManager.addEmits(events);
};

