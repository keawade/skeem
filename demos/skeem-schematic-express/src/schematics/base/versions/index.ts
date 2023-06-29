import type { VersionDefinition } from 'skeem-utils';
import type { ExpressSchematicOptions } from '../ExpressSchematicOptions';
import { v1_0_0 } from './v1.0.0';

export const versions: Record<
  string,
  VersionDefinition<ExpressSchematicOptions>
> = {
  '1.0.0': v1_0_0,
};
