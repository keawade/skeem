import { chain, type Rule } from '@angular-devkit/schematics';
import { type ExpressSchematicOptions } from '../ExpressSchematicOptions';

export const v1_0_0 = (options: ExpressSchematicOptions): Rule =>
  chain([scaffoldProject(options)]);

const scaffoldProject =
  (options: ExpressSchematicOptions): Rule =>
  (tree) => {
    // TODO: Show file copy + templating pattern for first version scaffolding
    // TODO: Document why you shouldn't really use that copy + templating pattern for most things
    tree.create('/foo.txt', 'Howdy');
  };
