import { oAuthSettings } from '../../helpers/oauth/oauth-settings.helper';
import { Trigger } from './Trigger.class';

declare var Metro;

/**
 * Gmail Trigger Component - Clean and Modular
 *
 * This component handles Gmail-based triggers with OAuth authentication.
 * All OAuth logic has been extracted to the oAuthSettings() helper class
 * for better separation of concerns and reusability.
 */
export class JobSchedulerTrigger extends Trigger {
  public schema: any = {
    job: 'object',
  };
  private oauth: oAuthSettings | undefined;

  protected async init(): Promise<void> {
    await super.init();

    // Set up component settings with OAuth configuration
    this.settings = {
      ...this.settings,
      interval: {
        type: 'range',
        label: 'Interval',
        min: 1,
        max: 720,
        value: 5,
        step: 1,
        validate: 'min=1 max=720',
        validateMessage: 'Allowed range 1 to 720',
        desc: 'Interval in minutes',
      },
    };

    this.drawSettings.icon = `/img/triggers/job-scheduler.svg`;

    this.drawSettings.color = '#00ff00';
    this.drawSettings.componentDescription = 'Poll Job Scheduler for new incoming jobs';
    this.drawSettings.displayName = '<i class="fa-solid fa-bolt"></i> JobScheduler';
  }

  public async checkSettings(): Promise<void> {
    await this.oauth?.checkSettings();
  }

  /**
   * Clean up event listeners and resources
   */
  destroy(): void {
    super.destroy?.();
  }
}
