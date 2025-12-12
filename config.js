require('dotenv').config();

const config = {
  // 服务器配置
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.PORT) || 3000,
  
  // GitHub 配置
  githubToken: process.env.GITHUB_TOKEN || '',
  githubApiBase: 'https://api.github.com',
  
  // 仓库列表配置
  repoListUrl: process.env.REPO_LIST_URL || 'https://raw.githubusercontent.com/example/repo-list/main/url.txt',
  
  // 缓存配置
  cacheDuration: parseInt(process.env.CACHE_DURATION) || 3600000, // 1小时
  refreshInterval: parseInt(process.env.REFRESH_INTERVAL) || 300000, // 5分钟
  
  // 显示配置
  showAllReleases: process.env.SHOW_ALL_RELEASES === 'true', // 默认只显示最新
  maxReleasesPerRepo: parseInt(process.env.MAX_RELEASES_PER_REPO) || 5, // 每个仓库最多显示几个发布
  
  // 安全配置
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000, // 1分钟
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100 // 最多100次请求
  },
  
  // 代理配置
  proxyEnabled: process.env.PROXY_ENABLED !== 'false', // 默认启用代理
  proxyBaseUrl: process.env.PROXY_BASE_URL || '',
  
  // 日志配置
  logLevel: process.env.LOG_LEVEL || 'info', // error, warn, info, debug
  logToFile: process.env.LOG_TO_FILE === 'true',
  logFile: process.env.LOG_FILE || 'github-proxy.log'
};

// 验证配置
if (!config.repoListUrl) {
  console.error('错误: 必须设置 REPO_LIST_URL 环境变量');
  process.exit(1);
}

module.exports = config;