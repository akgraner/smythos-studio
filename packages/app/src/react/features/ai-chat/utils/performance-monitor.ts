/**
 * Performance Monitoring Utility for Chat Streaming
 *
 * Helps identify bottlenecks in:
 * - Network latency (server response time)
 * - Chunk processing time
 * - UI render time
 *
 * Usage:
 * 1. Enable via localStorage: localStorage.setItem('CHAT_DEBUG_MODE', 'true')
 * 2. Check console for detailed metrics
 * 3. Use getMetrics() to analyze performance
 */

interface ChunkMetric {
  timestamp: number;
  chunkIndex: number;
  networkTime?: number; // Time from request to chunk arrival
  processingTime?: number; // Time to process chunk
  renderTime?: number; // Time to render in UI
  chunkSize: number; // Size in bytes
  type: 'content' | 'thinking' | 'tool' | 'debug';
}

interface PerformanceMetrics {
  totalChunks: number;
  averageNetworkTime: number;
  averageProcessingTime: number;
  averageRenderTime: number;
  totalDuration: number;
  slowestChunk: ChunkMetric | null;
  chunksPerSecond: number;
}

class PerformanceMonitor {
  private enabled: boolean = false;
  private metrics: ChunkMetric[] = [];
  private streamStartTime: number = 0;
  private lastChunkTime: number = 0;
  private chunkIndex: number = 0;

  constructor() {
    // Check if debug mode is enabled
    this.enabled =
      typeof window !== 'undefined' && localStorage.getItem('CHAT_DEBUG_MODE') === 'true';
  }

  /**
   * Starts monitoring a new stream
   */
  startStream(): void {
    if (!this.enabled) return;

    this.streamStartTime = performance.now();
    this.lastChunkTime = this.streamStartTime;
    this.chunkIndex = 0;
    this.metrics = [];

    console.log('%c🚀 STREAM STARTED', 'color: #00ff00; font-weight: bold; font-size: 14px');
    console.log(`⏱️  Start Time: ${new Date().toISOString()}`);
  }

  /**
   * Records when a chunk arrives from network
   */
  recordChunkArrival(chunkData: string, type: ChunkMetric['type'] = 'content'): void {
    if (!this.enabled) return;

    const now = performance.now();
    const networkTime = now - this.lastChunkTime;

    const metric: ChunkMetric = {
      timestamp: now,
      chunkIndex: this.chunkIndex++,
      networkTime,
      chunkSize: new Blob([chunkData]).size,
      type,
    };

    this.metrics.push(metric);
    this.lastChunkTime = now;

    // Log if chunk took too long (> 100ms is suspicious)
    if (networkTime > 100) {
      console.warn(
        `⚠️  SLOW CHUNK #${metric.chunkIndex}: ${networkTime.toFixed(2)}ms (${metric.chunkSize} bytes)`,
        `Type: ${type}`,
      );
    }
  }

  /**
   * Records chunk processing time
   */
  recordProcessingTime(chunkIndex: number, processingTime: number): void {
    if (!this.enabled) return;

    const metric = this.metrics.find((m) => m.chunkIndex === chunkIndex);
    if (metric) {
      metric.processingTime = processingTime;

      if (processingTime > 50) {
        console.warn(`⚠️  SLOW PROCESSING #${chunkIndex}: ${processingTime.toFixed(2)}ms`);
      }
    }
  }

  /**
   * Records UI render time
   */
  recordRenderTime(renderTime: number): void {
    if (!this.enabled) return;

    const lastMetric = this.metrics[this.metrics.length - 1];
    if (lastMetric) {
      lastMetric.renderTime = renderTime;

      if (renderTime > 16.67) {
        // More than 1 frame at 60fps
        console.warn(
          `⚠️  SLOW RENDER #${lastMetric.chunkIndex}: ${renderTime.toFixed(2)}ms (dropped frames!)`,
        );
      }
    }
  }

  /**
   * Ends stream and shows summary
   */
  endStream(): void {
    if (!this.enabled) return;

    const totalDuration = performance.now() - this.streamStartTime;
    const metrics = this.getMetrics();

    console.log('%c✅ STREAM COMPLETED', 'color: #00ff00; font-weight: bold; font-size: 14px');
    console.log(`⏱️  Total Duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`📦 Total Chunks: ${metrics.totalChunks}`);
    console.log(`⚡ Chunks/Second: ${metrics.chunksPerSecond.toFixed(2)}`);
    console.log('\n📊 PERFORMANCE BREAKDOWN:');
    console.log(`  🌐 Network (avg): ${metrics.averageNetworkTime.toFixed(2)}ms`);
    console.log(`  ⚙️  Processing (avg): ${metrics.averageProcessingTime.toFixed(2)}ms`);
    console.log(`  🎨 Rendering (avg): ${metrics.averageRenderTime.toFixed(2)}ms`);

    if (metrics.slowestChunk) {
      console.log('\n🐌 SLOWEST CHUNK:');
      console.log(`  Index: #${metrics.slowestChunk.chunkIndex}`);
      console.log(`  Network: ${metrics.slowestChunk.networkTime?.toFixed(2)}ms`);
      console.log(`  Processing: ${metrics.slowestChunk.processingTime?.toFixed(2)}ms`);
      console.log(`  Render: ${metrics.slowestChunk.renderTime?.toFixed(2)}ms`);
      console.log(`  Size: ${metrics.slowestChunk.chunkSize} bytes`);
    }

    // Identify bottleneck
    this.identifyBottleneck(metrics);
  }

  /**
   * Analyzes metrics and identifies the bottleneck
   */
  private identifyBottleneck(metrics: PerformanceMetrics): void {
    const { averageNetworkTime, averageProcessingTime, averageRenderTime } = metrics;

    console.log('\n🎯 BOTTLENECK ANALYSIS:');

    if (averageNetworkTime > 50) {
      console.error(
        '❌ SERVER/NETWORK BOTTLENECK DETECTED!',
        `\n   Average network time: ${averageNetworkTime.toFixed(2)}ms`,
        '\n   ➡️  Issue: Chunks are arriving slowly from server',
        '\n   ➡️  Check: Server processing time, network latency, concurrent calls',
      );
    }

    if (averageProcessingTime > 30) {
      console.error(
        '❌ CHUNK PROCESSING BOTTLENECK DETECTED!',
        `\n   Average processing time: ${averageProcessingTime.toFixed(2)}ms`,
        '\n   ➡️  Issue: Parsing/processing chunks is slow',
        '\n   ➡️  Check: JSON parsing, string operations, regex patterns',
      );
    }

    if (averageRenderTime > 16.67) {
      console.error(
        '❌ UI RENDERING BOTTLENECK DETECTED!',
        `\n   Average render time: ${averageRenderTime.toFixed(2)}ms`,
        '\n   ➡️  Issue: UI updates are slow (dropping frames)',
        '\n   ➡️  Check: Component re-renders, DOM operations, React memoization',
      );
    }

    if (averageNetworkTime <= 50 && averageProcessingTime <= 30 && averageRenderTime <= 16.67) {
      console.log('✅ NO BOTTLENECKS DETECTED! Performance is optimal.');
    }
  }

  /**
   * Gets computed metrics
   */
  getMetrics(): PerformanceMetrics {
    const totalChunks = this.metrics.length;

    if (totalChunks === 0) {
      return {
        totalChunks: 0,
        averageNetworkTime: 0,
        averageProcessingTime: 0,
        averageRenderTime: 0,
        totalDuration: 0,
        slowestChunk: null,
        chunksPerSecond: 0,
      };
    }

    const totalDuration = performance.now() - this.streamStartTime;

    // Calculate averages
    const networkTimes = this.metrics.map((m) => m.networkTime || 0).filter((t) => t > 0);
    const processingTimes = this.metrics.map((m) => m.processingTime || 0).filter((t) => t > 0);
    const renderTimes = this.metrics.map((m) => m.renderTime || 0).filter((t) => t > 0);

    const averageNetworkTime =
      networkTimes.length > 0 ? networkTimes.reduce((a, b) => a + b, 0) / networkTimes.length : 0;
    const averageProcessingTime =
      processingTimes.length > 0
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
        : 0;
    const averageRenderTime =
      renderTimes.length > 0 ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length : 0;

    // Find slowest chunk (by total time)
    const slowestChunk = this.metrics.reduce((slowest, current) => {
      const currentTotal =
        (current.networkTime || 0) + (current.processingTime || 0) + (current.renderTime || 0);
      const slowestTotal =
        (slowest.networkTime || 0) + (slowest.processingTime || 0) + (slowest.renderTime || 0);

      return currentTotal > slowestTotal ? current : slowest;
    }, this.metrics[0]);

    return {
      totalChunks,
      averageNetworkTime,
      averageProcessingTime,
      averageRenderTime,
      totalDuration,
      slowestChunk,
      chunksPerSecond: (totalChunks / totalDuration) * 1000,
    };
  }

  /**
   * Enables debug mode
   */
  enable(): void {
    this.enabled = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('CHAT_DEBUG_MODE', 'true');
    }
    console.log('✅ Performance monitoring enabled');
  }

  /**
   * Disables debug mode
   */
  disable(): void {
    this.enabled = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('CHAT_DEBUG_MODE');
    }
    console.log('❌ Performance monitoring disabled');
  }

  /**
   * Checks if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Global helpers for browser console
if (typeof window !== 'undefined') {
  (window as any).chatDebug = {
    enable: () => performanceMonitor.enable(),
    disable: () => performanceMonitor.disable(),
    metrics: () => performanceMonitor.getMetrics(),
  };
}
