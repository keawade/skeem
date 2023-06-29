import { z } from 'zod';

const versionSchema = z.string().refine((val) => {
  const subStrs = val.split('.');

  return (
    subStrs.length === 3 &&
    subStrs.every((sub) => typeof z.number().safeParse(sub) === 'number')
  );
}, 'Invalid version provided.');

export const baseSkeemSchematicOptionsSchema = z.object({
  fromVersion: versionSchema,
  toVersion: versionSchema,
});

export type BaseSkeemSchematicOptions = z.infer<
  typeof baseSkeemSchematicOptionsSchema
>;
