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
 * Interface for capturing user behavior and interaction patterns
 *
 * This abstraction allows enterprise editions to collect product usage metrics,
 * feature adoption data, and workflow completion analytics without modifying
 * community edition code.
 */
export interface IUserBehaviorObservability {
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
}

/**
 * Interface for capturing system-level insights and operational metrics
 *
 * This abstraction allows enterprise editions to monitor system performance,
 * error patterns, and operational health without modifying community edition code.
 */
export interface ISystemInsightCapture {
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
}

/**
 * Interface for managing user identity context in observability systems
 *
 * This abstraction allows enterprise editions to correlate events with user identities
 * for better analytics and insights.
 */
export interface IUserIdentityContext {
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
}
