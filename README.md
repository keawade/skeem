# Skeem

Skeem is an opinionated CLI interface for templates built with the schematic
tooling from Angular. This approach uses a `base` schematic in schematic
collections as the default schematic by convention. This `base` schematic is
expected to implement version layers using the provided library. This enables
managing future updates to a template by only applying updates to a project
that have not already been previously applied.
