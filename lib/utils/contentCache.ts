/**
 * 内容转译缓存模块
 * 提供内存缓存优化转译性能
 */

import { translateHtmlToQuill } from './htmlTranslator';

// =============================================================================
// 缓存接口和类型
// =============================================================================

interface CacheEntry {
  result: string;
  timestamp: number;
  hits: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  totalMemory: number;
}

// =============================================================================
// 简单的LRU缓存实现
// =============================================================================

class LRUCache<K, V> {
  private maxSize: number;
  private cache = new Map<K, V>();

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 更新访问顺序（删除再插入）
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // 如果已存在，删除旧的
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 如果缓存已满，删除最旧的（第一个）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): K[] {
    return Array.from(this.cache.keys());
  }
}

// =============================================================================
// 内容转译缓存
// =============================================================================

class ContentTranslationCache {
  private cache: LRUCache<string, CacheEntry>;
  private maxSize: number;
  private maxAge: number; // 毫秒
  private stats = {
    hits: 0,
    misses: 0
  };

  constructor(maxSize: number = 100, maxAgeMinutes: number = 30) {
    this.maxSize = maxSize;
    this.maxAge = maxAgeMinutes * 60 * 1000; // 转换为毫秒
    this.cache = new LRUCache(maxSize);
  }

  /**
   * 生成缓存键
   */
  private generateKey(html: string): string {
    // 使用简单的哈希算法生成键
    let hash = 0;
    for (let i = 0; i < html.length; i++) {
      const char = html.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return `html_${Math.abs(hash).toString(36)}`;
  }

  /**
   * 检查缓存条目是否过期
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.maxAge;
  }

  /**
   * 获取转译结果（带缓存）
   */
  getTranslatedContent(html: string): string | null {
    const key = this.generateKey(html);
    const entry = this.cache.get(key);

    if (entry && !this.isExpired(entry)) {
      // 缓存命中
      entry.hits++;
      this.stats.hits++;
      return entry.result;
    }

    // 缓存未命中或已过期
    this.stats.misses++;
    return null;
  }

  /**
   * 设置转译结果到缓存
   */
  setTranslatedContent(html: string, result: string): void {
    const key = this.generateKey(html);
    const entry: CacheEntry = {
      result,
      timestamp: Date.now(),
      hits: 0
    };
    
    this.cache.set(key, entry);
  }

  /**
   * 带缓存的转译函数
   */
  translateWithCache(html: string): string {
    // 先尝试从缓存获取
    const cached = this.getTranslatedContent(html);
    if (cached !== null) {
      return cached;
    }

    // 缓存未命中，执行转译
    try {
      const result = translateHtmlToQuill(html);
      this.setTranslatedContent(html, result);
      return result;
    } catch (error) {
      // 转译失败，不缓存错误结果
      throw error;
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    
    // 估算内存使用量
    let totalMemory = 0;
    this.cache.keys().forEach(key => {
      const entry = this.cache.get(key);
      if (entry) {
        totalMemory += key.length * 2; // 字符串大小（UTF-16）
        totalMemory += entry.result.length * 2;
        totalMemory += 64; // 对象开销估算
      }
    });

    return {
      size: this.cache.size(),
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalMemory
    };
  }

  /**
   * 清理过期缓存
   */
  cleanup(): number {
    let cleaned = 0;
    const keys = this.cache.keys();
    
    keys.forEach(key => {
      const entry = this.cache.get(key);
      if (entry && this.isExpired(entry)) {
        this.cache.set(key, entry); // 触发删除逻辑
        cleaned++;
      }
    });

    return cleaned;
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * 预热缓存（可选功能）
   */
  warmup(htmlContents: string[]): Promise<void> {
    return new Promise((resolve) => {
      const batchSize = 10;
      let processed = 0;

      const processBatch = () => {
        const batch = htmlContents.slice(processed, processed + batchSize);
        
        batch.forEach(html => {
          try {
            this.translateWithCache(html);
          } catch (error) {
            console.warn('缓存预热失败:', error);
          }
        });

        processed += batch.length;

        if (processed < htmlContents.length) {
          // 使用setTimeout避免阻塞主线程
          setTimeout(processBatch, 0);
        } else {
          resolve();
        }
      };

      processBatch();
    });
  }
}

// =============================================================================
// 全局缓存实例
// =============================================================================

// 创建全局缓存实例
const globalContentCache = new ContentTranslationCache(
  100,  // 最多缓存100个条目
  30    // 缓存30分钟
);

// 定期清理过期缓存（每5分钟）
if (typeof window !== 'undefined') {
  setInterval(() => {
    const cleaned = globalContentCache.cleanup();
    if (cleaned > 0) {
      console.debug(`清理了 ${cleaned} 个过期缓存条目`);
    }
  }, 5 * 60 * 1000);
}

// =============================================================================
// 导出的便捷函数
// =============================================================================

/**
 * 带缓存的HTML转译函数
 * 这是推荐的转译方法，会自动处理缓存
 */
export function translateHtmlToQuillCached(html: string): string {
  if (!html || html.trim() === '') {
    return '';
  }
  
  return globalContentCache.translateWithCache(html);
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats(): CacheStats {
  return globalContentCache.getStats();
}

/**
 * 清空转译缓存
 */
export function clearTranslationCache(): void {
  globalContentCache.clear();
}

/**
 * 预热缓存
 */
export function warmupCache(htmlContents: string[]): Promise<void> {
  return globalContentCache.warmup(htmlContents);
}

/**
 * 手动清理过期缓存
 */
export function cleanupCache(): number {
  return globalContentCache.cleanup();
}

// 默认导出缓存实例（用于高级用法）
export default globalContentCache;
