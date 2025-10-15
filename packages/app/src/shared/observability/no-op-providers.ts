/**
 * No-Op Observability Providers
 *
 * This is the default implementation used in community edition.
 * It implements the observability interface but performs no actual operations,
 * ensuring zero overhead when analytics are not needed.
 *
 * Enterprise editions can override this by registering their own implementation
 * via the plugin system.
 */

import type {
  IObservabilityProvider,
  ObservabilityEventProperties,
  UserIdentityContext,
} from './types';

/**
 * Unified No-Op Observability Provider
 *
 * This is the default implementation for community edition.
 * It provides complete observability interface but performs no actual operations,
 * ensuring zero overhead when analytics are not needed.
 *
 * All methods are no-ops that do nothing or return safe defaults.
 */
export class NoOpObservabilityProvider implements IObservabilityProvider {
  // User Behavior Observability
  recordInteraction(_eventName: string, _properties?: ObservabilityEventProperties): void {
    // No operation - disabled by default
  }

  recordFeatureUsage(_featureName: string, _properties?: ObservabilityEventProperties): void {
    // No operation - disabled by default
  }

  recordWorkflowCompletion(
    _workflowName: string,
    _properties?: ObservabilityEventProperties,
  ): void {
    // No operation - disabled by default
  }

  // System Insight Capture
  recordSystemEvent(_eventName: string, _properties?: ObservabilityEventProperties): void {
    // No operation - disabled by default
  }

  recordError(_errorName: string, _properties?: ObservabilityEventProperties): void {
    // No operation - disabled by default
  }

  recordPerformanceMetric(
    _metricName: string,
    _value: number,
    _properties?: ObservabilityEventProperties,
  ): void {
    // No operation - disabled by default
  }

  // User Identity Context
  identifyUser(_context: UserIdentityContext): void {
    // No operation - disabled by default
  }

  setUserProperties(_properties: ObservabilityEventProperties): void {
    // No operation - disabled by default
  }

  clearUserIdentity(): void {
    // No operation - disabled by default
  }

  // Feature Configuration
  getFeatureFlag(_featureName: string): string | boolean | undefined {
    return undefined;
  }

  isFeatureEnabled(_featureName: string): boolean {
    return false;
  }

  getFeatureFlagPayload(_featureName: string): unknown {
    return undefined;
  }

  reloadFeatureFlags(): void {
    // No operation - disabled by default
  }
}
