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
import { NoOpObservabilityProvider } from './no-op-providers';
import type { IObservabilityProvider, ObservabilityEventProperties } from './types';

/**
 * Lazy-loaded singleton for the unified observability provider
 */
let observabilityInstance: IObservabilityProvider | null = null;

/**
 * Gets the unified observability provider from plugins
 * Falls back to no-op implementation if no plugin is registered
 *
 * This function lazily retrieves the provider registered by enterprise editions
 * or returns a no-op implementation for community edition.
 */
function getObservabilityProvider(): IObservabilityProvider {
  if (observabilityInstance) {
    return observabilityInstance;
  }

  // Try to get provider from enterprise plugin
  const registeredPlugins = plugins.getPluginsByTarget(
    PluginTarget.ObservabilityProvider,
    PluginType.Config,
  );

  if (registeredPlugins.length > 0 && registeredPlugins[0].type === PluginType.Config) {
    const provider = registeredPlugins[0].config as IObservabilityProvider;
    observabilityInstance = provider;
    return provider;
  }

  // Fall back to no-op implementation (default for community edition)
  observabilityInstance = new NoOpObservabilityProvider();
  return observabilityInstance;
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
      getObservabilityProvider().recordInteraction(
        eventName,
        properties as ObservabilityEventProperties,
      );
    },
    recordFeatureUsage: (featureName: string, properties?: Record<string, unknown>) => {
      getObservabilityProvider().recordFeatureUsage(
        featureName,
        properties as ObservabilityEventProperties,
      );
    },
    recordWorkflowCompletion: (workflowName: string, properties?: Record<string, unknown>) => {
      getObservabilityProvider().recordWorkflowCompletion(
        workflowName,
        properties as ObservabilityEventProperties,
      );
    },
  },

  /**
   * System insight capture methods
   * Records system events, errors, and performance metrics
   */
  systemInsight: {
    recordSystemEvent: (eventName: string, properties?: Record<string, unknown>) => {
      getObservabilityProvider().recordSystemEvent(
        eventName,
        properties as ObservabilityEventProperties,
      );
    },
    recordError: (errorName: string, properties?: Record<string, unknown>) => {
      getObservabilityProvider().recordError(errorName, properties as ObservabilityEventProperties);
    },
    recordPerformanceMetric: (
      metricName: string,
      value: number,
      properties?: Record<string, unknown>,
    ) => {
      getObservabilityProvider().recordPerformanceMetric(
        metricName,
        value,
        properties as ObservabilityEventProperties,
      );
    },
  },

  /**
   * User identity context methods
   * Manages user identification and context correlation
   */
  userIdentity: {
    identifyUser: (userId: string, properties?: Record<string, unknown>) => {
      getObservabilityProvider().identifyUser({
        userId,
        properties: properties as ObservabilityEventProperties,
      });
    },
    setUserProperties: (properties: Record<string, unknown>) => {
      getObservabilityProvider().setUserProperties(properties as ObservabilityEventProperties);
    },
    clearUserIdentity: () => {
      getObservabilityProvider().clearUserIdentity();
    },
  },

  /**
   * Feature configuration methods
   * Manages feature flags and experimentation
   */
  features: {
    getFeatureFlag: (featureName: string) => {
      return getObservabilityProvider().getFeatureFlag(featureName);
    },
    isFeatureEnabled: (featureName: string) => {
      return getObservabilityProvider().isFeatureEnabled(featureName);
    },
    getFeatureFlagPayload: (featureName: string) => {
      return getObservabilityProvider().getFeatureFlagPayload(featureName);
    },
    reloadFeatureFlags: () => {
      getObservabilityProvider().reloadFeatureFlags();
    },
  },
};

// Re-export types for convenience
export type {
  IObservabilityProvider,
  ObservabilityEventProperties,
  UserIdentityContext,
} from './types';
