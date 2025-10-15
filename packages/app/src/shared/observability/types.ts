/**
 * Observability Type Definitions
 *
 * This module defines abstract interfaces for system observability and user behavior monitoring.
 * These interfaces are designed to be implemented by enterprise editions to enable analytics
 * while keeping the community edition free of direct analytics dependencies.
 *
 * The default implementations in community edition are no-ops (disabled by default).
 * Enterprise editions inject concrete implementations via the plugin system.
 */

/**
 * Properties that can be attached to user behavior events
 */
export type ObservabilityEventProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

/**
 * User identity information for context correlation
 */
export interface UserIdentityContext {
  /** Unique user identifier */
  userId: string;

  /** Additional user properties for context enrichment */
  properties?: ObservabilityEventProperties;
}

/**
 * Unified Observability Provider Interface
 *
 * This interface provides complete observability capabilities:
 * - User behavior tracking (interactions, feature usage, workflows)
 * - System insights (events, errors, performance metrics)
 * - User identity management (identification, context correlation)
 * - Feature configuration (flags, A/B testing, rollouts)
 *
 * Enterprise editions implement this interface to provide complete observability.
 * Community edition uses a no-op implementation by default.
 */
export interface IObservabilityProvider {
  // User Behavior Tracking
  /**
   * Records a user interaction or behavior event
   *
   * @param eventName - Descriptive name of the user action or behavior
   * @param properties - Additional context about the event
   *
   * @example
   * ```typescript
   * recordInteraction('agent_created', { agentType: 'chatbot', source: 'template' });
   * ```
   */
  recordInteraction(eventName: string, properties?: ObservabilityEventProperties): void;

  /**
   * Records a feature usage event
   *
   * @param featureName - Name of the feature being used
   * @param properties - Additional context about feature usage
   */
  recordFeatureUsage(featureName: string, properties?: ObservabilityEventProperties): void;

  /**
   * Records a workflow completion event
   *
   * @param workflowName - Name of the completed workflow
   * @param properties - Additional context about the workflow
   */
  recordWorkflowCompletion(workflowName: string, properties?: ObservabilityEventProperties): void;

  // System Insights
  /**
   * Records a system-level event
   *
   * @param eventName - Descriptive name of the system event
   * @param properties - Additional context about the event
   *
   * @example
   * ```typescript
   * recordSystemEvent('deployment_completed', { duration: 1200, success: true });
   * ```
   */
  recordSystemEvent(eventName: string, properties?: ObservabilityEventProperties): void;

  /**
   * Records an error or exception
   *
   * @param errorName - Name or type of the error
   * @param properties - Additional context about the error
   */
  recordError(errorName: string, properties?: ObservabilityEventProperties): void;

  /**
   * Records a performance metric
   *
   * @param metricName - Name of the performance metric
   * @param value - Numeric value of the metric
   * @param properties - Additional context about the metric
   */
  recordPerformanceMetric(
    metricName: string,
    value: number,
    properties?: ObservabilityEventProperties,
  ): void;

  // User Identity Management
  /**
   * Associates a user identity with subsequent observability events
   *
   * @param context - User identity information
   *
   * @example
   * ```typescript
   * identifyUser({ userId: 'user-123', properties: { email: 'user@example.com' } });
   * ```
   */
  identifyUser(context: UserIdentityContext): void;

  /**
   * Updates user properties without changing the user identity
   *
   * @param properties - Properties to set or update
   */
  setUserProperties(properties: ObservabilityEventProperties): void;

  /**
   * Clears the current user identity context
   */
  clearUserIdentity(): void;

  // Feature Configuration
  /**
   * Retrieves the value of a feature flag
   *
   * @param featureName - Name of the feature flag
   * @returns The feature flag value (string, boolean, or undefined if not set)
   *
   * @example
   * ```typescript
   * const variant = getFeatureFlag('new-ui-design');
   * if (variant === 'variant_1') {
   *   // Show new UI
   * }
   * ```
   */
  getFeatureFlag(featureName: string): string | boolean | undefined;

  /**
   * Checks if a feature is enabled
   *
   * @param featureName - Name of the feature
   * @returns True if the feature is enabled, false otherwise
   */
  isFeatureEnabled(featureName: string): boolean;

  /**
   * Retrieves the feature flag payload (additional metadata)
   * Can return any type (string, object, boolean, array, etc.) depending on PostHog configuration
   *
   * @param featureName - Name of the feature flag
   * @returns The feature flag payload (any type) or undefined if not set
   *
   * @example
   * ```typescript
   * const payload = getFeatureFlagPayload('rollout-config');
   * // Type assertion based on your specific flag configuration
   * if ((payload as { percentage?: number })?.percentage > 50) {
   *   // Feature is rolled out to more than 50%
   * }
   * ```
   */
  getFeatureFlagPayload(featureName: string): unknown;

  /**
   * Reloads feature flags from the server
   */
  reloadFeatureFlags(): void;
}
