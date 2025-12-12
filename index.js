#!/usr/bin/env node

const http = require('http');
const url = require('url');
const config = require('./config');
const ui = require('./ui');
const routes = require('./routes');

class GitHubReleasesProxy {
  constructor() {
    this.server = null;
    this.ui = null;
    this.cache = require('./cache');
    this.api = require('./api');
    this.proxy = require('./proxy');
  }

  async start() {
    try {
      // 初始化 UI
      this.ui = new ui.ConsoleUI();
      this.ui.showBanner();
      
      // 初始化缓存
      await this.cache.init();
      
      // 启动 HTTP 服务器
      this.server = http.createServer(this.handleRequest.bind(this));
      
      this.server.listen(config.port, config.host, () => {
        this.ui.log(`服务器已启动: http://${config.host}:${config.port}`);
        this.ui.log(`GitHub Token: ${config.githubToken ? '已设置' : '未设置'}`);
        this.ui.log(`仓库列表URL: ${config.repoListUrl}`);
        this.ui.log(`缓存时间: ${config.cacheDuration / 60000} 分钟`);
        this.ui.log(`刷新间隔: ${config.refreshInterval / 60000} 分钟`);
        this.ui.log('按 Ctrl+C 停止服务器\n');
        
        // 显示命令行界面
        this.showCommandLineInterface();
        
        // 初始加载数据
        this.loadInitialData();
        
        // 设置定期刷新
        this.setupAutoRefresh();
      });
      
      this.server.on('error', (error) => {
        this.ui.error(`服务器错误: ${error.message}`);
        process.exit(1);
      });
      
      process.on('SIGINT', () => {
        this.shutdown();
      });
      
    } catch (error) {
      this.ui.error(`启动失败: ${error.message}`);
      process.exit(1);
    }
  }
  
  async handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method.toUpperCase();
    
    // 设置响应头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    
    try {
      // 路由处理
      if (path === '/') {
        this.handleHome(req, res);
      } else if (path === '/api/releases') {
        await routes.handleReleases(req, res);
      } else if (path === '/api/latest') {
        await routes.handleLatestReleases(req, res);
      } else if (path.startsWith('/api/repo/')) {
        await routes.handleRepoReleases(req, res, path);
      } else if (path.startsWith('/api/download/')) {
        await routes.handleDownload(req, res, path);
      } else if (path === '/api/refresh') {
        await routes.handleRefresh(req, res);
      } else if (path === '/api/status') {
        await routes.handleStatus(req, res);
      } else if (path === '/api/repos') {
        await routes.handleRepoList(req, res);
      } else {
        this.handle404(req, res);
      }
    } catch (error) {
      this.ui.error(`请求处理错误: ${error.message}`);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        error: error.message 
      }));
    }
  }
  
  handleHome(req, res) {
    const html = this.generateHomePage();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }
  
  generateHomePage() {
    const { host, port } = config;
    return `
<!DOCTYPE html>
<html>
<head>
    <title>GitHub Releases 代理服务</title>
    <style>
        body { font-family: monospace; margin: 40px; }
        h1 { color: #333; }
        .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
        code { background: #e8e8e8; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>GitHub Releases 代理服务</h1>
    <p>服务器运行在: <code>http://${host}:${port}</code></p>
    
    <h2>API 端点:</h2>
    <div class="endpoint">
        <strong>GET /api/releases</strong><br>
        获取所有仓库的所有发布版本
    </div>
    
    <div class="endpoint">
        <strong>GET /api/latest</strong><br>
        获取所有仓库的最新发布版本
    </div>
    
    <div class="endpoint">
        <strong>GET /api/repo/{owner}/{repo}</strong><br>
        获取指定仓库的所有发布版本
    </div>
    
    <div class="endpoint">
        <strong>GET /api/download/{owner}/{repo}/{assetId}/{filename}</strong><br>
        代理下载文件
    </div>
    
    <div class="endpoint">
        <strong>POST /api/refresh</strong><br>
        刷新缓存
    </div>
    
    <div class="endpoint">
        <strong>GET /api/status</strong><br>
        获取服务器状态
    </div>
    
    <div class="endpoint">
        <strong>GET /api/repos</strong><br>
        获取仓库列表
    </div>
    
    <h2>控制台命令:</h2>
    <p>在服务器控制台输入以下命令:</p>
    <ul>
        <li><code>list</code> - 显示所有仓库</li>
        <li><code>latest</code> - 显示最新发布</li>
        <li><code>repo {owner}/{repo}</code> - 查看仓库详情</li>
        <li><code>search {关键词}</code> - 搜索发布</li>
        <li><code>refresh</code> - 刷新缓存</li>
        <li><code>status</code> - 服务器状态</li>
        <li><code>quit</code> 或 <code>exit</code> - 退出</li>
    </ul>
    
    <p>查看控制台获取交互式界面。</p>
</body>
</html>`;
  }
  
  handle404(req, res) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: false, 
      error: '未找到该路径' 
    }));
  }
  
  showCommandLineInterface() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> '
    });
    
    rl.prompt();
    
    rl.on('line', async (line) => {
      const input = line.trim().toLowerCase();
      const args = input.split(' ');
      const command = args[0];
      
      switch (command) {
        case 'list':
          await this.handleListCommand();
          break;
          
        case 'latest':
          await this.handleLatestCommand();
          break;
          
        case 'repo':
          if (args.length > 1) {
            await this.handleRepoCommand(args[1]);
          } else {
            this.ui.warn('请指定仓库，格式: owner/repo');
          }
          break;
          
        case 'search':
          if (args.length > 1) {
            await this.handleSearchCommand(args.slice(1).join(' '));
          } else {
            this.ui.warn('请指定搜索关键词');
          }
          break;
          
        case 'refresh':
          await this.handleRefreshCommand();
          break;
          
        case 'status':
          await this.handleStatusCommand();
          break;
          
        case 'help':
          this.showHelp();
          break;
          
        case 'quit':
        case 'exit':
          this.shutdown();
          break;
          
        case '':
          break;
          
        default:
          this.ui.warn(`未知命令: ${command}，输入 'help' 查看帮助`);
          break;
      }
      
      rl.prompt();
    }).on('close', () => {
      this.shutdown();
    });
  }
  
  async handleListCommand() {
    try {
      const repos = await this.api.getRepoList();
      
      if (repos.length === 0) {
        this.ui.info('没有找到仓库');
        return;
      }
      
      this.ui.log('\n📦 仓库列表:');
      this.ui.table(
        ['仓库', 'GitHub URL'],
        repos.map(repo => [
          `${repo.owner}/${repo.repo}`,
          repo.url
        ])
      );
      
      this.ui.log(`\n总计: ${repos.length} 个仓库`);
    } catch (error) {
      this.ui.error(`获取仓库列表失败: ${error.message}`);
    }
  }
  
  async handleLatestCommand() {
    try {
      const data = await this.api.getLatestReleases();
      
      if (!data || data.length === 0) {
        this.ui.info('没有找到发布版本');
        return;
      }
      
      let totalAssets = 0;
      
      this.ui.log('\n🚀 最新发布版本:');
      
      data.forEach(repo => {
        if (repo.releases && repo.releases.length > 0) {
          const latestRelease = repo.releases[0]; // 第一个是最新的
          
          this.ui.log(`\n📁 ${repo.repo}`);
          this.ui.log(`  📝 ${latestRelease.name || latestRelease.tag_name}`);
          this.ui.log(`  🏷️  标签: ${latestRelease.tag_name}`);
          this.ui.log(`  📅 发布时间: ${new Date(latestRelease.published_at).toLocaleString()}`);
          this.ui.log(`  📊 资源文件:`);
          
          if (latestRelease.assets && latestRelease.assets.length > 0) {
            latestRelease.assets.forEach(asset => {
              const size = this.formatFileSize(asset.size);
              const downloads = asset.download_count || 0;
              
              this.ui.log(`    • ${asset.name} (${size}) - ${downloads}次下载`);
              this.ui.log(`      下载: ${asset.proxy_url}`);
            });
            
            totalAssets += latestRelease.assets.length;
          } else {
            this.ui.log(`    • 无资源文件`);
          }
        }
      });
      
      this.ui.log(`\n总计: ${data.length} 个仓库有最新发布，${totalAssets} 个资源文件`);
    } catch (error) {
      this.ui.error(`获取最新发布失败: ${error.message}`);
    }
  }
  
  async handleRepoCommand(repoName) {
    try {
      const [owner, repo] = repoName.split('/');
      
      if (!owner || !repo) {
        this.ui.warn('仓库格式错误，请使用: owner/repo');
        return;
      }
      
      const releases = await this.api.getRepoReleases(owner, repo);
      
      if (!releases || releases.length === 0) {
        this.ui.info(`仓库 ${repoName} 没有发布版本`);
        return;
      }
      
      this.ui.log(`\n📚 ${repoName} - 所有发布版本:`);
      
      releases.forEach((release, index) => {
        this.ui.log(`\n${index + 1}. ${release.name || release.tag_name}`);
        this.ui.log(`   标签: ${release.tag_name}`);
        this.ui.log(`   时间: ${new Date(release.published_at).toLocaleString()}`);
        
        if (release.assets && release.assets.length > 0) {
          this.ui.log(`   资源文件 (${release.assets.length}个):`);
          
          release.assets.forEach(asset => {
            const size = this.formatFileSize(asset.size);
            this.ui.log(`     • ${asset.name} (${size})`);
          });
        }
      });
      
      this.ui.log(`\n总计: ${releases.length} 个发布版本`);
      
      // 显示最新版本的下载链接
      const latest = releases[0];
      if (latest.assets && latest.assets.length > 0) {
        this.ui.log(`\n🔗 最新版本下载链接:`);
        latest.assets.forEach(asset => {
          this.ui.log(`   ${asset.name}: ${asset.proxy_url}`);
        });
      }
    } catch (error) {
      this.ui.error(`获取仓库发布失败: ${error.message}`);
    }
  }
  
  async handleSearchCommand(keyword) {
    try {
      const data = await this.api.getAllReleases();
      
      if (!data || data.length === 0) {
        this.ui.info('没有找到发布版本');
        return;
      }
      
      const results = [];
      const searchLower = keyword.toLowerCase();
      
      data.forEach(repo => {
        if (repo.releases) {
          repo.releases.forEach(release => {
            // 搜索发布名称、标签名
            const releaseName = (release.name || '').toLowerCase();
            const tagName = release.tag_name.toLowerCase();
            
            if (releaseName.includes(searchLower) || tagName.includes(searchLower)) {
              results.push({
                repo: repo.repo,
                release: release
              });
            }
            
            // 搜索文件名
            if (release.assets) {
              release.assets.forEach(asset => {
                const fileName = asset.name.toLowerCase();
                if (fileName.includes(searchLower)) {
                  results.push({
                    repo: repo.repo,
                    release: release,
                    asset: asset
                  });
                }
              });
            }
          });
        }
      });
      
      if (results.length === 0) {
        this.ui.info(`没有找到包含 "${keyword}" 的结果`);
        return;
      }
      
      this.ui.log(`\n🔍 搜索结果 (${results.length} 个匹配项):`);
      
      results.forEach((result, index) => {
        this.ui.log(`\n${index + 1}. ${result.repo} - ${result.release.tag_name}`);
        this.ui.log(`   发布: ${result.release.name || result.release.tag_name}`);
        
        if (result.asset) {
          const size = this.formatFileSize(result.asset.size);
          this.ui.log(`   文件: ${result.asset.name} (${size})`);
          this.ui.log(`   下载: ${result.asset.proxy_url}`);
        }
      });
    } catch (error) {
      this.ui.error(`搜索失败: ${error.message}`);
    }
  }
  
  async handleRefreshCommand() {
    try {
      this.ui.log('🔄 正在刷新缓存...');
      await this.cache.clearAll();
      this.ui.success('缓存刷新完成');
    } catch (error) {
      this.ui.error(`刷新缓存失败: ${error.message}`);
    }
  }
  
  async handleStatusCommand() {
    const cacheStats = this.cache.getStats();
    const repoCount = this.api.getRepoCount();
    
    this.ui.log('\n📊 服务器状态:');
    this.ui.log(`   服务器: http://${config.host}:${config.port}`);
    this.ui.log(`   仓库数量: ${repoCount}`);
    this.ui.log(`   缓存命中: ${cacheStats.hits}`);
    this.ui.log(`   缓存未命中: ${cacheStats.misses}`);
    this.ui.log(`   缓存大小: ${Object.keys(cacheStats.cache).length} 个项目`);
    this.ui.log(`   内存使用: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
    this.ui.log(`   运行时间: ${Math.round(process.uptime())} 秒`);
  }
  
  showHelp() {
    this.ui.log('\n📖 可用命令:');
    this.ui.log('   list            - 显示所有仓库');
    this.ui.log('   latest          - 显示最新发布');
    this.ui.log('   repo owner/repo - 查看仓库详情');
    this.ui.log('   search 关键词   - 搜索发布');
    this.ui.log('   refresh         - 刷新缓存');
    this.ui.log('   status          - 服务器状态');
    this.ui.log('   help            - 显示帮助');
    this.ui.log('   quit/exit       - 退出服务器');
    this.ui.log('\n📡 API 端点:');
    this.ui.log('   GET /api/releases    - 所有发布');
    this.ui.log('   GET /api/latest      - 最新发布');
    this.ui.log('   GET /api/repo/:owner/:repo - 仓库发布');
    this.ui.log('   GET /api/download/:owner/:repo/:assetId/:filename - 下载');
    this.ui.log('   POST /api/refresh    - 刷新缓存');
    this.ui.log('   GET /api/status      - 服务器状态');
  }
  
  async loadInitialData() {
    this.ui.log('📥 正在加载初始数据...');
    try {
      await this.api.getRepoList(true); // 强制刷新
      this.ui.success('数据加载完成');
    } catch (error) {
      this.ui.error(`数据加载失败: ${error.message}`);
    }
  }
  
  setupAutoRefresh() {
    setInterval(async () => {
      try {
        await this.api.getRepoList(true);
        this.ui.log('🔄 自动刷新完成');
      } catch (error) {
        this.ui.error(`自动刷新失败: ${error.message}`);
      }
    }, config.refreshInterval);
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  shutdown() {
    this.ui.log('\n正在关闭服务器...');
    
    if (this.server) {
      this.server.close(() => {
        this.ui.log('服务器已关闭');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  }
}

// 启动服务器
if (require.main === module) {
  const proxy = new GitHubReleasesProxy();
  proxy.start();
}

module.exports = GitHubReleasesProxy;