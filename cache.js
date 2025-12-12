class CacheManager {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }
  
  init() {
    // 初始化缓存清理定时器
    setInterval(() => this.cleanup(), 60000); // 每分钟清理一次过期缓存
    return Promise.resolve();
  }
  
  set(key, value, ttl = 3600000) {
    const expireAt = Date.now() + ttl;
    this.cache.set(key, { value, expireAt });
    this.stats.sets++;
    return true;
  }
  
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    if (Date.now() > item.expireAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return item.value;
  }
  
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }
  
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    return size;
  }
  
  clearAll() {
    this.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.sets = 0;
    this.stats.deletes = 0;
    return true;
  }
  
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expireAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.debug(`清理了 ${cleaned} 个过期缓存项`);
    }
    
    return cleaned;
  }
  
  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
  
  // 获取所有缓存数据（用于调试）
  getAll() {
    const result = {};
    for (const [key, item] of this.cache.entries()) {
      result[key] = {
        value: item.value,
        expireAt: new Date(item.expireAt).toISOString(),
        ttl: item.expireAt - Date.now()
      };
    }
    return result;
  }
}

module.exports = new CacheManager();