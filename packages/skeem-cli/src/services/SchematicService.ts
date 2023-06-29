import { resolve } from 'path';
import type { schema } from '@angular-devkit/core';
import type { DryRunEvent } from '@angular-devkit/schematics';
import { UnsuccessfulWorkflowExecution } from '@angular-devkit/schematics';
import type { LifeCycleEvent } from '@angular-devkit/schematics/src/workflow';
import { NodeWorkflow } from '@angular-devkit/schematics/tools/index.js';
import { default as chalk } from 'chalk';
import { Inject, Injectable } from '@nestjs/common';
// import { NpmService } from './NpmService.js';
import { LogService } from '../logger/LogService.js';
import { NpmService } from './NpmService.js';
import { default as inquirer } from 'inquirer';

/**
 * Schematic implementation.
 *
 * Base approach taken from the [reference CLI implementation](https://github.com/angular/angular-cli/blob/master/packages/angular_devkit/schematics_cli/bin/schematics.ts)
 */
@Injectable()
export class SchematicService {
  /**
   * Indicate to the user when nothing has been done. This is automatically set
   * to off when there's a new DryRunEvent.
   */
  private nothingDone = true;
  /**
   * Logging queue that receives all the messages to show the users. This only
   * get shown when no errors happened.
   */
  private loggingQueue: string[] = [];
  private error = false;

  /**
   * @param schematic `collection-name:schematic-name` or `schematic-name`
   */
  public constructor(
    @Inject(LogService) private readonly logger: LogService,
    @Inject(NpmService) private readonly npm: NpmService
  ) {}

  private dryRun = false;

  private privateRootPath?: string;
  private get root(): string {
    if (this.privateRootPath === undefined) {
      throw new Error('Root has not been defined.');
    }

    return this.privateRootPath;
  }
  private set root(value: string) {
    this.privateRootPath = resolve(value);
  }

  public collectionName?: string;
  public schematicName?: string;

  private get workflow(): NodeWorkflow {
    const workflow = new NodeWorkflow(this.root, {
      dryRun: this.dryRun,
      resolvePaths: [
        process.cwd(),
        // __dirname,
        // process.cwd works fine when you're executing via cli command name but not locally via './bin/run'
        this.npm.globalRoot,
      ],
      schemaValidation: true,
    });

    workflow.reporter.subscribe(this.createWorkflowReportingObserver());

    workflow.lifeCycle.subscribe(this.createLifeCycleObserver());

    // Show usage of deprecated options
    workflow.registry.useXDeprecatedProvider(this.logger.warn);

    // Add prompts.
    workflow.registry.usePromptProvider(this.createPromptProvider());

    return workflow;
  }

  public async updateInstalledSchematic(version: string): Promise<void> {
    this.logger.verbose(`Checking for schematic update.`);

    if (!this.collectionName) {
      throw new Error('Collection name must be defined.');
    }

    await this.npm.ensureGlobalPackageInstalled(this.collectionName, version);

    this.logger.success(`Up to date.`);
  }

  public listSchematics(): string[] {
    if (!this.collectionName) {
      throw new Error('Collection name must be defined.');
    }

    try {
      return this.workflow.engine
        .createCollection(this.collectionName)
        .listSchematicNames();
    } catch (error: any) {
      this.logger.error(error.message);
      return [];
    }
  }

  // eslint-disable-next-line complexity
  public async applySchematic(
    destinationPath: string,
    schematicOptions: { dryRun?: boolean | undefined; [key: string]: any } = {}
  ): Promise<void> {
    this.logger.info(
      `Applying schematic '${this.collectionName}:${this.schematicName}'`
    );

    if (!this.collectionName) {
      throw new Error('Collection name must be defined.');
    }
    if (!this.schematicName) {
      throw new Error('Schematic name must be defined.');
    }

    // These values are needed by the workflow initialization done in the this.workflow getter
    this.root = destinationPath;
    this.dryRun = schematicOptions.dryRun ?? false;

    try {
      await this.workflow
        .execute({
          collection: this.collectionName,
          schematic: this.schematicName,
          options: schematicOptions,
          allowPrivate: true,
          // eslint-disable-next-line @typescript-eslint/dot-notation
          debug: !!process.env['DEBUG'],
          // Maybe try to create a logger instance we can pass here?
        })
        .toPromise();

      if (this.nothingDone) {
        this.logger.info('Nothing to be done.');
      }

      if (this.dryRun) {
        this.logger.info(`Dry run enabled. No files written to disk.`);
      }
    } catch (err: any) {
      if (err instanceof UnsuccessfulWorkflowExecution) {
        // "See above" because we already printed the error.
        this.logger.error('Failed to apply schematic. See above.');
        // eslint-disable-next-line @typescript-eslint/dot-notation
      } else if (process.env['DEBUG']) {
        this.logger.error('An error occurred:\n' + err.stack);
      } else {
        this.logger.error(err.stack ?? err.message);
      }

      throw new Error(
        'Failed to apply template. See output above for details.'
      );
    } finally {
      this.loggingQueue = [];
      this.error = false;
      this.nothingDone = true;
    }
  }

  /**
   * Logs out dry run events.
   *
   * All events will always be executed here, in order of discovery. That means
   * that an error would be shown along other events when it happens. Since
   * errors in this.workflows will stop the Observable from completing
   * successfully, we record any events other than errors, then on completion we
   * show them.
   *
   * This is a simple way to only show errors when an error occur.
   */
  private createWorkflowReportingObserver() {
    // eslint-disable-next-line complexity
    return (event: DryRunEvent): void => {
      this.nothingDone = false;
      // Strip leading slash to prevent confusion.
      const eventPath = event.path.startsWith('/')
        ? event.path.substring(1)
        : event.path;

      switch (event.kind) {
        case 'error':
          this.error = true;

          // eslint-disable-next-line no-case-declarations
          const desc =
            event.description === 'alreadyExist'
              ? 'already exists'
              : 'does not exist';
          this.logger.error(`ERROR! ${eventPath} ${desc}.`);
          break;
        case 'update':
          this.loggingQueue.push(
            `${chalk.cyan('UPDATE')} ${eventPath} (${
              event.content.length
            } bytes)`
          );
          break;
        case 'create':
          this.loggingQueue.push(
            `${chalk.green('CREATE')} ${eventPath} (${
              event.content.length
            } bytes)`
          );
          break;
        case 'delete':
          this.loggingQueue.push(`${chalk.yellow('DELETE')} ${eventPath}`);
          break;
        case 'rename':
          // eslint-disable-next-line no-case-declarations
          const eventToPath = event.to.startsWith('/')
            ? event.to.substring(1)
            : event.to;
          this.loggingQueue.push(
            `${chalk.blue('RENAME')} ${eventPath} => ${eventToPath}`
          );
          break;
      }
    };
  }

  /**
   * Listen to lifecycle events of the this.workflow to flush the logs between
   * each phases.
   */
  private createLifeCycleObserver() {
    return (event: LifeCycleEvent): void => {
      if (event.kind === 'workflow-end' || event.kind === 'post-tasks-start') {
        if (!this.error) {
          // Flush the log queue and clean the error state.
          this.loggingQueue.forEach((log) => this.logger.info(log));
        }

        this.loggingQueue = [];
        this.error = false;
      }
    };
  }

  /**
   * Parse the name of schematic passed in argument, and return a { collectionName, schematicName }
   * named tuple.
   */
  public setTargetCollectionAndSchematic(
    collectionSchematicString: string
  ): void {
    if (
      collectionSchematicString &&
      collectionSchematicString.indexOf(':') === -1
    ) {
      throw new Error(
        `Unable to parse specified collection and schematic from input '${collectionSchematicString}'`
      );
    }

    const [collectionName, schematicName] = [
      collectionSchematicString.slice(
        0,
        collectionSchematicString.lastIndexOf(':')
      ),
      collectionSchematicString.substring(
        collectionSchematicString.lastIndexOf(':') + 1
      ),
    ];

    this.collectionName = collectionName;
    this.schematicName = schematicName;
    return;
  }

  private createPromptProvider(): schema.PromptProvider {
    return (definitions) => {
      // eslint-disable-next-line complexity
      const questions: inquirer.QuestionCollection = definitions.map(
        (definition) => {
          const question: inquirer.Question = {
            name: definition.id,
            message: definition.message,
            default: definition.default,
          };

          const validator = definition.validator;
          if (validator) {
            if (
              definition.propertyTypes.has('integer') ||
              definition.propertyTypes.has('number')
            ) {
              // Default validator isn't smart enough to coerce the string input from the user to the correct data type
              // istanbul ignore next
              question.validate = (input) => validator(parseFloat(input));
            } else {
              // istanbul ignore next
              question.validate = (input) => validator(input);
            }
          }

          if (
            definition.propertyTypes.has('integer') ||
            definition.propertyTypes.has('number')
          ) {
            // Default filter isn't smart enough to coerce the string input from the user to the correct data type
            // istanbul ignore next
            question.filter = (input) => parseFloat(input);
          }

          switch (definition.type) {
            case 'confirmation':
              return { ...question, type: 'confirm' };
            case 'list':
              return {
                ...question,
                type: definition.multiselect ? 'checkbox' : 'list',
                choices:
                  definition.items &&
                  definition.items.map((item) => {
                    if (typeof item === 'string') {
                      return item;
                    } else {
                      return {
                        name: item.label,
                        value: item.value,
                      };
                    }
                  }),
              };
            default:
              return { ...question, type: definition.type };
          }
        }
      );

      return inquirer.prompt(questions);
    };
  }
}
