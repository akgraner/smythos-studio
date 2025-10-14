/**
 * Observability Service
 *
 * This module provides the main API for observability throughout the application.
 * It uses the plugin system to allow enterprise editions to inject their own
 * implementations while keeping the community edition free of analytics code.
 *
 * By default, all operations are no-ops (disabled). Enterprise editions can
 * enable observability by registering providers via the plugin system.
 *
 * @example
 * ```typescript
 * // In community code - works with or without enterprise plugin
 * import { Observability } from '@src/shared/observability';
 *
 * Observability.userBehavior.recordInteraction('button_clicked', { buttonId: 'submit' });
 * ```
 */

import { plugins, PluginTarget, PluginType } from '@react/shared/plugins/Plugins';
import {
  NoOpSystemInsightCapture,
  NoOpUserBehaviorObservability,
  NoOpUserIdentityContext,
} from './no-op-providers';
import type {
  ISystemInsightCapture,
  IUserBehaviorObservability,
  IUserIdentityContext,
} from './types';

/**
 * Lazy-loaded singleton for user behavior observability
 */
let userBehaviorInstance: IUserBehaviorObservability | null = null;

/**
 * Lazy-loaded singleton for system insight capture
 */
let systemInsightInstance: ISystemInsightCapture | null = null;

/**
 * Lazy-loaded singleton for user identity context
 */
let userIdentityInstance: IUserIdentityContext | null = null;

/**
 * Gets the user behavior observability provider from plugins
 * Falls back to no-op implementation if no plugin is registered
 */
function getUserBehaviorProvider(): IUserBehaviorObservability {
  if (userBehaviorInstance) {
    return userBehaviorInstance;
  }

  // Try to get provider from enterprise plugin
  const registeredPlugins = plugins.getPluginsByTarget(
    PluginTarget.UserBehaviorObservabilityProvider,
    PluginType.Config,
  );

  if (registeredPlugins.length > 0 && registeredPlugins[0].type === PluginType.Config) {
    const provider = registeredPlugins[0].config as IUserBehaviorObservability;
    userBehaviorInstance = provider;
    return provider;
  }

  // Fall back to no-op implementation (default for community edition)
  userBehaviorInstance = new NoOpUserBehaviorObservability();
  return userBehaviorInstance;
}

/**
 * Gets the system insight capture provider from plugins
 * Falls back to no-op implementation if no plugin is registered
 */
function getSystemInsightProvider(): ISystemInsightCapture {
  if (systemInsightInstance) {
    return systemInsightInstance;
  }

  // Try to get provider from enterprise plugin
  const registeredPlugins = plugins.getPluginsByTarget(
    PluginTarget.SystemInsightCaptureProvider,
    PluginType.Config,
  );

  if (registeredPlugins.length > 0 && registeredPlugins[0].type === PluginType.Config) {
    const provider = registeredPlugins[0].config as ISystemInsightCapture;
    systemInsightInstance = provider;
    return provider;
  }

  // Fall back to no-op implementation (default for community edition)
  systemInsightInstance = new NoOpSystemInsightCapture();
  return systemInsightInstance;
}

/**
 * Gets the user identity context provider from plugins
 * Falls back to no-op implementation if no plugin is registered
 */
function getUserIdentityProvider(): IUserIdentityContext {
  if (userIdentityInstance) {
    return userIdentityInstance;
  }

  // Try to get provider from enterprise plugin
  const registeredPlugins = plugins.getPluginsByTarget(
    PluginTarget.UserIdentityContextProvider,
    PluginType.Config,
  );

  if (registeredPlugins.length > 0 && registeredPlugins[0].type === PluginType.Config) {
    const provider = registeredPlugins[0].config as IUserIdentityContext;
    userIdentityInstance = provider;
    return provider;
  }

  // Fall back to no-op implementation (default for community edition)
  userIdentityInstance = new NoOpUserIdentityContext();
  return userIdentityInstance;
}

/**
 * Main Observability API
 *
 * Provides a unified interface for all observability operations.
 * Automatically uses plugin-registered implementations or falls back to no-ops.
 *
 * This is the primary export that should be used throughout the application.
 */
export const Observability = {
  /**
   * User behavior observability methods
   * Records user interactions, feature usage, and workflow completions
   */
  userBehavior: {
    recordInteraction: (eventName: string, properties?: Record<string, unknown>) => {
      getUserBehaviorProvider().recordInteraction(eventName, properties);
    },
    recordFeatureUsage: (featureName: string, properties?: Record<string, unknown>) => {
      getUserBehaviorProvider().recordFeatureUsage(featureName, properties);
    },
    recordWorkflowCompletion: (workflowName: string, properties?: Record<string, unknown>) => {
      getUserBehaviorProvider().recordWorkflowCompletion(workflowName, properties);
    },
  },

  /**
   * System insight capture methods
   * Records system events, errors, and performance metrics
   */
  systemInsight: {
    recordSystemEvent: (eventName: string, properties?: Record<string, unknown>) => {
      getSystemInsightProvider().recordSystemEvent(eventName, properties);
    },
    recordError: (errorName: string, properties?: Record<string, unknown>) => {
      getSystemInsightProvider().recordError(errorName, properties);
    },
    recordPerformanceMetric: (
      metricName: string,
      value: number,
      properties?: Record<string, unknown>,
    ) => {
      getSystemInsightProvider().recordPerformanceMetric(metricName, value, properties);
    },
  },

  /**
   * User identity context methods
   * Manages user identification and context correlation
   */
  userIdentity: {
    identifyUser: (userId: string, properties?: Record<string, unknown>) => {
      getUserIdentityProvider().identifyUser({ userId, properties });
    },
    setUserProperties: (properties: Record<string, unknown>) => {
      getUserIdentityProvider().setUserProperties(properties);
    },
    clearUserIdentity: () => {
      getUserIdentityProvider().clearUserIdentity();
    },
  },
};

// Re-export types for convenience
export type {
  ISystemInsightCapture,
  IUserBehaviorObservability,
  IUserIdentityContext,
  ObservabilityEventProperties,
  UserIdentityContext,
} from './types';
