/**
 * No-Op Observability Providers
 *
 * These are the default implementations used in community edition.
 * They implement the observability interfaces but perform no actual operations,
 * ensuring zero overhead when analytics are not needed.
 *
 * Enterprise editions can override these by registering their own implementations
 * via the plugin system.
 */

import type {
  ISystemInsightCapture,
  IUserBehaviorObservability,
  IUserIdentityContext,
  ObservabilityEventProperties,
  UserIdentityContext,
} from './types';

/**
 * No-op implementation of user behavior observability
 * All methods are empty functions that do nothing
 */
export class NoOpUserBehaviorObservability implements IUserBehaviorObservability {
  /**
   * Records a user interaction (no-op)
   */
  recordInteraction(_eventName: string, _properties?: ObservabilityEventProperties): void {
    // No operation - disabled by default
  }

  /**
   * Records feature usage (no-op)
   */
  recordFeatureUsage(_featureName: string, _properties?: ObservabilityEventProperties): void {
    // No operation - disabled by default
  }

  /**
   * Records workflow completion (no-op)
   */
  recordWorkflowCompletion(
    _workflowName: string,
    _properties?: ObservabilityEventProperties,
  ): void {
    // No operation - disabled by default
  }
}

/**
 * No-op implementation of system insight capture
 * All methods are empty functions that do nothing
 */
export class NoOpSystemInsightCapture implements ISystemInsightCapture {
  /**
   * Records a system event (no-op)
   */
  recordSystemEvent(_eventName: string, _properties?: ObservabilityEventProperties): void {
    // No operation - disabled by default
  }

  /**
   * Records an error (no-op)
   */
  recordError(_errorName: string, _properties?: ObservabilityEventProperties): void {
    // No operation - disabled by default
  }

  /**
   * Records a performance metric (no-op)
   */
  recordPerformanceMetric(
    _metricName: string,
    _value: number,
    _properties?: ObservabilityEventProperties,
  ): void {
    // No operation - disabled by default
  }
}

/**
 * No-op implementation of user identity context
 * All methods are empty functions that do nothing
 */
export class NoOpUserIdentityContext implements IUserIdentityContext {
  /**
   * Identifies a user (no-op)
   */
  identifyUser(_context: UserIdentityContext): void {
    // No operation - disabled by default
  }

  /**
   * Sets user properties (no-op)
   */
  setUserProperties(_properties: ObservabilityEventProperties): void {
    // No operation - disabled by default
  }

  /**
   * Clears user identity (no-op)
   */
  clearUserIdentity(): void {
    // No operation - disabled by default
  }
}
