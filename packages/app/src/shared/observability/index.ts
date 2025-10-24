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
 * Observability.observeInteraction('button_clicked', { buttonId: 'submit' });
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
  try {
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
  } catch (error) {
    // If anything fails, return no-op provider to prevent app breakage
    console.warn('Failed to get observability provider, using no-op fallback:', error);
    observabilityInstance = new NoOpObservabilityProvider();
    return observabilityInstance;
  }
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
   * Observes and tracks any interaction, event, or behavior in the system
   *
   * This unified method handles all types of observability events including
   * user interactions, feature usage, workflow completions, system events,
   * and errors.
   *
   * @param eventName - Descriptive name of the event, interaction, or behavior
   * @param properties - Additional context about the event
   *
   * @example
   * ```typescript
   * Observability.observeInteraction('agent_created', { agentType: 'chatbot', source: 'template' });
   * Observability.observeInteraction('debug_button_click', { position: 'bottom center', type: 'run' });
   * Observability.observeInteraction('workflow_test_completed', { status: 'success', source: 'debugger' });
   * ```
   */
  observeInteraction: (eventName: string, properties?: Record<string, unknown>) => {
    try {
      getObservabilityProvider().observeInteraction(
        eventName,
        properties as ObservabilityEventProperties,
      );
    } catch (error) {
      // Silently fail to prevent breaking the application
      console.warn('Failed to observe interaction:', eventName, error);
    }
  },

  /**
   * User identity context methods
   * Manages user identification and context correlation
   */
  userIdentity: {
    identifyUser: (userId: string, properties?: Record<string, unknown>) => {
      try {
        getObservabilityProvider().identifyUser({
          userId,
          properties: properties as ObservabilityEventProperties,
        });
      } catch (error) {
        console.warn('Failed to identify user:', userId, error);
      }
    },
    setUserProperties: (properties: Record<string, unknown>) => {
      try {
        getObservabilityProvider().setUserProperties(properties as ObservabilityEventProperties);
      } catch (error) {
        console.warn('Failed to set user properties:', error);
      }
    },
    clearUserIdentity: () => {
      try {
        getObservabilityProvider().clearUserIdentity();
      } catch (error) {
        console.warn('Failed to clear user identity:', error);
      }
    },
  },

  /**
   * Feature configuration methods
   * Manages feature flags and experimentation
   */
  features: {
    getFeatureFlag: (featureName: string) => {
      try {
        return getObservabilityProvider().getFeatureFlag(featureName);
      } catch (error) {
        console.warn('Failed to get feature flag:', featureName, error);
        return undefined;
      }
    },
    isFeatureEnabled: (featureName: string) => {
      try {
        return getObservabilityProvider().isFeatureEnabled(featureName);
      } catch (error) {
        console.warn('Failed to check if feature is enabled:', featureName, error);
        return false;
      }
    },
    getFeatureFlagPayload: (featureName: string) => {
      try {
        return getObservabilityProvider().getFeatureFlagPayload(featureName);
      } catch (error) {
        console.warn('Failed to get feature flag payload:', featureName, error);
        return undefined;
      }
    },
    reloadFeatureFlags: () => {
      try {
        getObservabilityProvider().reloadFeatureFlags();
      } catch (error) {
        console.warn('Failed to reload feature flags:', error);
      }
    },
    onFeatureFlagsReady: (callback: () => void) => {
      try {
        getObservabilityProvider().onFeatureFlagsReady(callback);
      } catch (error) {
        console.warn('Failed to register feature flags ready callback:', error);
        // Execute callback anyway to prevent blocking
        callback();
      }
    },
  },
};

// Re-export types for convenience
export type {
  IObservabilityProvider,
  ObservabilityEventProperties,
  UserIdentityContext,
} from './types';

// Export the observability instance getter for advanced usage
export { getObservabilityProvider as getObservabilityInstance };
