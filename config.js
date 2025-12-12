// 配置文件
const config = {
  // 基础配置
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  
  // GitHub配置
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  GITHUB_API_BASE: 'https://api.github.com',
  
  // 代理配置
  PROXY_BASE_URL: process.env.PROXY_BASE_URL || '',
  REPO_LIST_URL: process.env.REPO_LIST_URL || 'https://raw.githubusercontent.com/xiaocongyu66/supreme-sniffle/refs/heads/main/public/url.txt',
  
  // 缓存配置
  CACHE_DURATION: parseInt(process.env.CACHE_DURATION) || 3600000, // 1小时
  REFRESH_INTERVAL: parseInt(process.env.REFRESH_INTERVAL) || 300000, // 5分钟
  
  // 安全配置
  ALLOWED_DOMAINS: (process.env.ALLOWED_DOMAINS || '').split(',').filter(Boolean),
  RATE_LIMIT: parseInt(process.env.RATE_LIMIT) || 100,
};

module.exports = config;