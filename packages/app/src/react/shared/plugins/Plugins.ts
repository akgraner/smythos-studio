export enum PluginTarget {
  BuilderLoadScript = 'builder/LoadScript',
  BuilderLoadAgentTemplates = 'builder/LoadAgentTemplates',
  TopMenuItem = 'topMenuItem',
  SidebarMenuItems = 'sidebarMenuItems',
  TopMenuProfileDropdownItems = 'topMenuProfileDropdownItems',
  AgentSettingsTasksTabWidget = 'agentSettings/tasksTabWidget',
  AgentSettingsWidgets = 'agentSettings/widgets',
  AgentSettingsSkillsWidgetSkillButton = 'agentSettings/skillsWidget/skillButton',
  BuilderSidebarComponentItems = 'builder/sidebarComponentItems',
  BuilderSREComponents = 'builder/sreComponents',
  AgentsPageSection = 'agentsPage/section',
  AgentsPageGenerateAgentForm = 'agentsPage/generateAgentForm',
  AgentsPageOnboardingTasks = 'agentsPage/onboardingTasks',
  VaultPageSmythOSRecommendedModels = 'vaultPage/smythOSRecommendedModels',

  /**
   * UserBehaviorObservabilityProvider - Injected by enterprise edition to capture user interaction patterns
   * Provides implementation for recording user actions, feature usage, and workflow completion metrics
   * Default: No-op implementation in community edition
   * Enterprise: PostHog-based implementation for product analytics
   */
  UserBehaviorObservabilityProvider = 'observability/userBehaviorProvider',

  /**
   * SystemInsightCaptureProvider - Injected by enterprise edition for system-level event monitoring
   * Enables collection of system performance, error patterns, and operational metrics
   * Default: No-op implementation in community edition
   * Enterprise: PostHog-based implementation for system analytics
   */
  SystemInsightCaptureProvider = 'observability/systemInsightProvider',

  /**
   * UserIdentityContextProvider - Injected by enterprise edition to associate user context with observability data
   * Manages user identity correlation across different monitoring surfaces
   * Default: No-op implementation in community edition
   * Enterprise: PostHog-based implementation for user identification
   */
  UserIdentityContextProvider = 'observability/userIdentityProvider',
}

export enum PluginType {
  Function = 'function',
  Component = 'component',
  Config = 'config',
}

export type TPlugin =
  | {
      type: PluginType.Function;
      function: (...args: any[]) => any;
    }
  | {
      type: PluginType.Component;
      component: React.ReactNode;
    }
  | {
      type: PluginType.Config;
      config: any;
    };

export class Plugins {
  private pluginsByTarget: Record<string, TPlugin[]> = {};

  constructor() {
    this.pluginsByTarget = {};
  }

  registerPlugin(target: string, plugin: TPlugin) {
    if (!this.pluginsByTarget[target]) {
      this.pluginsByTarget[target] = [];
    }
    this.pluginsByTarget[target].push(plugin);
  }

  getPluginsByTarget(target: string, type?: PluginType) {
    return (
      this.pluginsByTarget[target]?.filter((plugin) => (type ? plugin.type === type : true)) || []
    );
  }

  getAllPlugins(type?: PluginType) {
    return Object.values(this.pluginsByTarget)
      .flat()
      .filter((plugin) => (type ? plugin.type === type : true));
  }
}

export const plugins = new Plugins();
