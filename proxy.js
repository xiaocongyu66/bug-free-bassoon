const axios = require('axios');
const config = require('./config');
const ui = new (require('./ui').ConsoleUI)();

class DownloadProxy {
  constructor() {
    this.downloadCache = new Map();
  }
  
  async downloadAsset(req, res, owner, repo, assetId, filename) {
    const cacheKey = `${owner}/${repo}/${assetId}`;
    const now = Date.now();
    
    // 检查内存缓存（仅用于小文件）
    if (this.downloadCache.has(cacheKey)) {
      const cached = this.downloadCache.get(cacheKey);
      if (now - cached.timestamp < 300000) { // 5分钟缓存
        ui.debug(`从内存缓存提供文件: ${filename}`);
        this.serveFile(res, cached.data, filename);
        return;
      }
    }
    
    try {
      ui.log(`代理下载: ${owner}/${repo} - ${filename}`);
      
      // 准备 GitHub API 请求头
      const headers = {
        'Accept': 'application/octet-stream',
        'User-Agent': 'GitHub-Releases-Proxy/1.0'
      };
      
      if (config.githubToken) {
        headers['Authorization'] = `token ${config.githubToken}`;
      }
      
      // 下载文件
      const response = await axios({
        method: 'GET',
        url: `${config.githubApiBase}/repos/${owner}/${repo}/releases/assets/${assetId}`,
        headers: headers,
        responseType: 'stream'
      });
      
      if (response.status !== 200) {
        throw new Error(`GitHub API 返回 ${response.status}`);
      }
      
      // 获取文件大小
      const contentLength = response.headers['content-length'];
      const fileSize = contentLength ? parseInt(contentLength) : 0;
      
      ui.debug(`文件大小: ${this.formatFileSize(fileSize)}`);
      
      // 设置响应头
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': contentLength || '',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      });
      
      // 如果是小文件，缓存到内存
      if (fileSize > 0 && fileSize < 10 * 1024 * 1024) { // 小于10MB
        let buffer = Buffer.alloc(0);
        
        response.data.on('data', chunk => {
          buffer = Buffer.concat([buffer, chunk]);
        });
        
        response.data.on('end', () => {
          // 缓存文件
          this.downloadCache.set(cacheKey, {
            data: buffer,
            timestamp: now,
            size: buffer.length
          });
          
          // 发送文件
          res.end(buffer);
          
          ui.debug(`文件已缓存: ${this.formatFileSize(buffer.length)}`);
        });
        
        response.data.on('error', error => {
          ui.error(`流错误: ${error.message}`);
          res.writeHead(500);
          res.end('下载错误');
        });
      } else {
        // 大文件直接管道传输
        response.data.pipe(res);
        
        response.data.on('error', error => {
          ui.error(`流错误: ${error.message}`);
          if (!res.headersSent) {
            res.writeHead(500);
          }
          res.end('下载错误');
        });
      }
      
      // 监听完成
      res.on('finish', () => {
        ui.success(`下载完成: ${filename}`);
      });
      
    } catch (error) {
      ui.error(`下载失败: ${error.message}`);
      
      // 如果是 404 或 403，提供有用的错误信息
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error('文件未找到，可能已被删除');
        } else if (error.response.status === 403) {
          throw new Error('GitHub API 限制，请稍后重试或使用 Token');
        }
      }
      
      throw error;
    }
  }
  
  serveFile(res, data, filename) {
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': data.length,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    });
    
    res.end(data);
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // 清理过期缓存
  cleanupCache() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.downloadCache.entries()) {
      if (now - item.timestamp > 300000) { // 5分钟
        this.downloadCache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      ui.debug(`清理了 ${cleaned} 个下载缓存`);
    }
  }
}

// 定期清理缓存
const proxy = new DownloadProxy();
setInterval(() => proxy.cleanupCache(), 60000); // 每分钟清理一次

module.exports = proxy;