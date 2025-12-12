const url = require('url');
const config = require('./config');
const api = require('./api');
const cache = require('./cache');
const proxy = require('./proxy');
const ui = new (require('./ui').ConsoleUI)();

class Routes {
  constructor() {
    this.rateLimit = new Map();
  }
  
  // 检查速率限制
  checkRateLimit(ip) {
    const now = Date.now();
    const windowStart = now - config.rateLimit.windowMs;
    
    // 清理旧记录
    for (const [clientIp, timestamps] of this.rateLimit.entries()) {
      const validTimestamps = timestamps.filter(time => time > windowStart);
      if (validTimestamps.length === 0) {
        this.rateLimit.delete(clientIp);
      } else {
        this.rateLimit.set(clientIp, validTimestamps);
      }
    }
    
    // 检查当前 IP
    const timestamps = this.rateLimit.get(ip) || [];
    const recentRequests = timestamps.filter(time => time > windowStart);
    
    if (recentRequests.length >= config.rateLimit.max) {
      return false;
    }
    
    recentRequests.push(now);
    this.rateLimit.set(ip, recentRequests);
    return true;
  }
  
  // 获取客户端 IP
  getClientIp(req) {
    return req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.socket.remoteAddress || 
           'unknown';
  }
  
  // 处理所有发布
  async handleReleases(req, res) {
    const ip = this.getClientIp(req);
    
    if (!this.checkRateLimit(ip)) {
      this.sendJson(res, 429, {
        success: false,
        error: '请求过多，请稍后重试'
      });
      return;
    }
    
    try {
      const data = await api.getAllReleases();
      this.sendJson(res, 200, {
        success: true,
        data: data,
        count: data.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.sendJson(res, 500, {
        success: false,
        error: error.message
      });
    }
  }
  
  // 处理最新发布
  async handleLatestReleases(req, res) {
    const ip = this.getClientIp(req);
    
    if (!this.checkRateLimit(ip)) {
      this.sendJson(res, 429, {
        success: false,
        error: '请求过多，请稍后重试'
      });
      return;
    }
    
    try {
      const data = await api.getLatestReleases();
      this.sendJson(res, 200, {
        success: true,
        data: data,
        count: data.length,
        timestamp: new Date().toISOString(),
        note: '只显示每个仓库的最新发布版本'
      });
    } catch (error) {
      this.sendJson(res, 500, {
        success: false,
        error: error.message
      });
    }
  }
  
  // 处理指定仓库的发布
  async handleRepoReleases(req, res, path) {
    const ip = this.getClientIp(req);
    
    if (!this.checkRateLimit(ip)) {
      this.sendJson(res, 429, {
        success: false,
        error: '请求过多，请稍后重试'
      });
      return;
    }
    
    // 解析路径: /api/repo/:owner/:repo
    const parts = path.split('/').filter(p => p);
    if (parts.length !== 4) { // ['api', 'repo', 'owner', 'repo']
      this.sendJson(res, 400, {
        success: false,
        error: '路径格式错误，请使用 /api/repo/:owner/:repo'
      });
      return;
    }
    
    const owner = parts[2];
    const repo = parts[3];
    
    try {
      const releases = await api.getRepoReleases(owner, repo);
      this.sendJson(res, 200, {
        success: true,
        data: {
          repo: `${owner}/${repo}`,
          url: `https://github.com/${owner}/${repo}`,
          releases: releases,
          count: releases.length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.sendJson(res, 500, {
        success: false,
        error: error.message
      });
    }
  }
  
  // 处理下载
  async handleDownload(req, res, path) {
    const ip = this.getClientIp(req);
    
    if (!this.checkRateLimit(ip)) {
      this.sendJson(res, 429, {
        success: false,
        error: '请求过多，请稍后重试'
      });
      return;
    }
    
    // 解析路径: /api/download/:owner/:repo/:assetId/:filename
    const parts = path.split('/').filter(p => p);
    if (parts.length !== 6) { // ['api', 'download', 'owner', 'repo', 'assetId', 'filename']
      this.sendJson(res, 400, {
        success: false,
        error: '路径格式错误'
      });
      return;
    }
    
    const owner = parts[2];
    const repo = parts[3];
    const assetId = parts[4];
    const filename = decodeURIComponent(parts[5]);
    
    try {
      await proxy.downloadAsset(req, res, owner, repo, assetId, filename);
    } catch (error) {
      this.sendJson(res, 500, {
        success: false,
        error: error.message
      });
    }
  }
  
  // 处理缓存刷新
  async handleRefresh(req, res) {
    if (req.method !== 'POST') {
      this.sendJson(res, 405, {
        success: false,
        error: '只支持 POST 方法'
      });
      return;
    }
    
    try {
      // 清除缓存
      cache.clearAll();
      
      // 刷新仓库列表
      await api.getRepoList(true);
      
      this.sendJson(res, 200, {
        success: true,
        message: '缓存已刷新',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.sendJson(res, 500, {
        success: false,
        error: error.message
      });
    }
  }
  
  // 处理状态查询
  async handleStatus(req, res) {
    const cacheStats = cache.getStats();
    const repoCount = api.getRepoCount();
    
    this.sendJson(res, 200, {
      success: true,
      data: {
        server: {
          host: config.host,
          port: config.port,
          uptime: Math.round(process.uptime())
        },
        github: {
          token_set: !!config.githubToken,
          rate_limit: config.rateLimit
        },
        cache: {
          hits: cacheStats.hits,
          misses: cacheStats.misses,
          size: cacheStats.size
        },
        repos: {
          count: repoCount,
          list_url: config.repoListUrl
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
        }
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // 处理仓库列表
  async handleRepoList(req, res) {
    try {
      const repos = await api.getRepoList();
      
      this.sendJson(res, 200, {
        success: true,
        data: repos.map(repo => ({
          owner: repo.owner,
          repo: repo.repo,
          url: repo.url
        })),
        count: repos.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.sendJson(res, 500, {
        success: false,
        error: error.message
      });
    }
  }
  
  // 发送 JSON 响应
  sendJson(res, status, data) {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify(data, null, 2));
  }
}

module.exports = new Routes();