import { z } from 'zod';
import { baseSkeemSchematicOptionsSchema } from 'skeem-utils';

export const expressSchematicOptionsSchema =
  baseSkeemSchematicOptionsSchema.extend({
    name: z.string(),
  });

export type ExpressSchematicOptions = z.infer<
  typeof expressSchematicOptionsSchema
>;
