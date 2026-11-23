import type { CollectError } from '../collector/collect';

export const SOURCE_LABEL: Record<CollectError['source'], string> = { people: 'people list', leaves: 'leaves', timesheet: 'timesheet' };
