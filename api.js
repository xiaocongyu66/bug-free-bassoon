const axios = require('axios');
const config = require('./config');
const cache = require('./cache');
const ui = new (require('./ui').ConsoleUI)();

class GitHubAPI {
  constructor() {
    this.repoList = [];
    this.lastFetchTime = 0;
    
    // 设置 GitHub API 请求配置
    this.githubConfig = {
      headers: {}
    };
    
    if (config.githubToken) {
      this.githubConfig.headers.Authorization = `token ${config.githubToken}`;
      this.githubConfig.headers.Accept = 'application/vnd.github.v3+json';
    }
    
    // 设置 axios 实例
    this.axios = axios.create({
      timeout: 10000,
      ...this.githubConfig
    });
  }
  
  async fetchRepoList(force = false) {
    const cacheKey = 'repo_list';
    const now = Date.now();
    
    // 检查缓存
    if (!force && now - this.lastFetchTime < config.cacheDuration) {
      return this.repoList;
    }
    
    try {
      ui.log('正在获取仓库列表...');
      const response = await this.axios.get(config.repoListUrl);
      
      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // 解析仓库列表
      const text = response.data;
      const repos = this.parseRepoList(text);
      
      // 更新缓存
      this.repoList = repos;
      this.lastFetchTime = now;
      cache.set(cacheKey, repos, config.cacheDuration);
      
      ui.success(`获取到 ${repos.length} 个仓库`);
      return repos;
      
    } catch (error) {
      ui.error(`获取仓库列表失败: ${error.message}`);
      
      // 尝试从缓存获取
      const cached = cache.get(cacheKey);
      if (cached) {
        ui.warn('使用缓存数据');
        return cached;
      }
      
      throw error;
    }
  }
  
  parseRepoList(text) {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => {
        // 处理各种格式的 GitHub URL
        const url = line.startsWith('http') ? line : `https://github.com/${line}`;
        const match = url.match(/github\.com\/([^\/]+)\/([^\/\s#]+)/);
        
        if (match) {
          return {
            owner: match[1],
            repo: match[2].replace(/\.git$/, ''),
            url: `https://github.com/${match[1]}/${match[2]}`
          };
        }
        
        return null;
      })
      .filter(repo => repo !== null);
  }
  
  async fetchRepoReleases(owner, repo, force = false) {
    const cacheKey = `releases_${owner}_${repo}`;
    
    // 检查缓存
    if (!force) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      ui.debug(`获取 ${owner}/${repo} 的发布版本...`);
      
      const response = await this.axios.get(
        `${config.githubApiBase}/repos/${owner}/${repo}/releases`,
        {
          headers: this.githubConfig.headers
        }
      );
      
      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const releases = response.data;
      
      // 处理发布数据
      const processedReleases = releases.map(release => ({
        id: release.id,
        tag_name: release.tag_name,
        name: release.name,
        body: release.body,
        draft: release.draft,
        prerelease: release.prerelease,
        published_at: release.published_at,
        assets: release.assets.map(asset => ({
          id: asset.id,
          name: asset.name,
          size: asset.size,
          download_count: asset.download_count,
          browser_download_url: asset.browser_download_url,
          proxy_url: config.proxyEnabled 
            ? `${config.proxyBaseUrl || `http://${config.host}:${config.port}`}/api/download/${owner}/${repo}/${asset.id}/${encodeURIComponent(asset.name)}`
            : asset.browser_download_url
        }))
      }));
      
      // 按发布时间排序（最新的在前）
      processedReleases.sort((a, b) => 
        new Date(b.published_at) - new Date(a.published_at)
      );
      
      // 限制数量
      const limitedReleases = config.showAllReleases 
        ? processedReleases 
        : processedReleases.slice(0, config.maxReleasesPerRepo);
      
      // 缓存结果
      cache.set(cacheKey, limitedReleases, config.cacheDuration);
      
      return limitedReleases;
      
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          ui.debug(`仓库 ${owner}/${repo} 没有发布版本或不存在`);
          return [];
        } else if (error.response.status === 403) {
          ui.warn(`API 限制: ${owner}/${repo}`);
          throw new Error('GitHub API 限制，请稍后重试或使用 Token');
        }
      }
      
      ui.error(`获取 ${owner}/${repo} 发布失败: ${error.message}`);
      throw error;
    }
  }
  
  async getAllReleases() {
    try {
      const repos = await this.fetchRepoList();
      const results = [];
      
      ui.progress('获取发布版本', 0, repos.length);
      
      for (let i = 0; i < repos.length; i++) {
        const repo = repos[i];
        
        try {
          const releases = await this.fetchRepoReleases(repo.owner, repo.repo);
          
          if (releases.length > 0) {
            results.push({
              repo: `${repo.owner}/${repo.repo}`,
              url: repo.url,
              releases: releases
            });
          }
        } catch (error) {
          results.push({
            repo: `${repo.owner}/${repo.repo}`,
            url: repo.url,
            releases: [],
            error: error.message
          });
        }
        
        ui.progress('获取发布版本', i + 1, repos.length);
      }
      
      return results;
    } catch (error) {
      throw error;
    }
  }
  
  async getLatestReleases() {
    try {
      const allData = await this.getAllReleases();
      
      // 只保留每个仓库的最新发布
      return allData.map(repoData => ({
        ...repoData,
        releases: repoData.releases && repoData.releases.length > 0 
          ? [repoData.releases[0]] // 只取第一个（最新的）
          : []
      }));
    } catch (error) {
      throw error;
    }
  }
  
  async getRepoReleases(owner, repo) {
    return await this.fetchRepoReleases(owner, repo);
  }
  
  getRepoCount() {
    return this.repoList.length;
  }
  
  // 公开方法
  async getRepoList(force = false) {
    return await this.fetchRepoList(force);
  }
}

module.exports = new GitHubAPI();