const express = require('express');
const axios = require('axios');
const cors = require('cors');
const config = require('./config');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 缓存存储
const cache = {
  repoList: null,
  repoListTime: 0,
  releases: {},
  releasesTime: {},
  files: {},
  filesTime: {},
};

// 工具函数：获取仓库列表
async function fetchRepoList() {
  try {
    const now = Date.now();
    if (cache.repoList && (now - cache.repoListTime < config.CACHE_DURATION)) {
      return cache.repoList;
    }

    const response = await axios.get(config.REPO_LIST_URL);
    const repos = response.data
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => {
        const [owner, repo] = line.replace('https://github.com/', '').split('/');
        return { owner, repo, url: line };
      });

    cache.repoList = repos;
    cache.repoListTime = now;
    return repos;
  } catch (error) {
    console.error('获取仓库列表失败:', error.message);
    return [];
  }
}

// 工具函数：获取仓库的Releases
async function fetchReleases(owner, repo) {
  const cacheKey = `${owner}/${repo}`;
  const now = Date.now();

  if (cache.releases[cacheKey] && cache.releasesTime[cacheKey] && 
      (now - cache.releasesTime[cacheKey] < config.CACHE_DURATION)) {
    return cache.releases[cacheKey];
  }

  try {
    const headers = {};
    if (config.GITHUB_TOKEN) {
      headers.Authorization = `token ${config.GITHUB_TOKEN}`;
    }

    const response = await axios.get(
      `${config.GITHUB_API_BASE}/repos/${owner}/${repo}/releases`,
      { headers }
    );

    const releases = response.data.map(release => ({
      id: release.id,
      tag_name: release.tag_name,
      name: release.name,
      published_at: release.published_at,
      assets: release.assets.map(asset => ({
        id: asset.id,
        name: asset.name,
        size: asset.size,
        download_count: asset.download_count,
        browser_download_url: asset.browser_download_url,
        proxy_url: `${config.PROXY_BASE_URL || `http://${config.HOST}:${config.PORT}`}/api/download/${owner}/${repo}/${asset.id}/${asset.name}`
      }))
    }));

    cache.releases[cacheKey] = releases;
    cache.releasesTime[cacheKey] = now;
    return releases;
  } catch (error) {
    console.error(`获取 ${owner}/${repo} 的Releases失败:`, error.message);
    return null;
  }
}

// API路由：获取所有仓库的Releases
app.get('/api/releases', async (req, res) => {
  try {
    const repos = await fetchRepoList();
    const releasesPromises = repos.map(repo => fetchReleases(repo.owner, repo.repo));
    const releasesResults = await Promise.allSettled(releasesPromises);

    const result = repos.map((repo, index) => ({
      repo: `${repo.owner}/${repo.repo}`,
      url: repo.url,
      releases: releasesResults[index].status === 'fulfilled' 
        ? releasesResults[index].value 
        : null,
      error: releasesResults[index].status === 'rejected' 
        ? releasesResults[index].reason.message 
        : null
    }));

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API路由：下载代理
app.get('/api/download/:owner/:repo/:assetId/:filename', async (req, res) => {
  const { owner, repo, assetId, filename } = req.params;

  try {
    const cacheKey = `${owner}/${repo}/${assetId}`;
    const now = Date.now();

    if (!cache.files[cacheKey] || !cache.filesTime[cacheKey] || 
        (now - cache.filesTime[cacheKey] > config.REFRESH_INTERVAL)) {
      
      const headers = {};
      if (config.GITHUB_TOKEN) {
        headers.Authorization = `token ${config.GITHUB_TOKEN}`;
        headers.Accept = 'application/octet-stream';
      }

      const response = await axios({
        method: 'GET',
        url: `${config.GITHUB_API_BASE}/repos/${owner}/${repo}/releases/assets/${assetId}`,
        headers: headers,
        responseType: 'stream'
      });

      cache.files[cacheKey] = response.data;
      cache.filesTime[cacheKey] = now;
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    cache.files[cacheKey].pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API路由：手动刷新缓存
app.post('/api/refresh/:owner?/:repo?', async (req, res) => {
  const { owner, repo } = req.params;
  
  try {
    if (owner && repo) {
      delete cache.releases[`${owner}/${repo}`];
      delete cache.releasesTime[`${owner}/${repo}`];
      
      // 清除该仓库的所有文件缓存
      Object.keys(cache.files).forEach(key => {
        if (key.startsWith(`${owner}/${repo}/`)) {
          delete cache.files[key];
          delete cache.filesTime[key];
        }
      });
    } else {
      // 清除所有缓存
      cache.repoList = null;
      cache.repoListTime = 0;
      cache.releases = {};
      cache.releasesTime = {};
      cache.files = {};
      cache.filesTime = {};
    }

    res.json({
      success: true,
      message: owner && repo 
        ? `已刷新 ${owner}/${repo} 的缓存`
        : '已刷新所有缓存'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 启动服务器
app.listen(config.PORT, config.HOST, () => {
  console.log(`服务器运行在 http://${config.HOST}:${config.PORT}`);
  console.log(`GitHub Token: ${config.GITHUB_TOKEN ? '已设置' : '未设置'}`);
  console.log(`仓库列表URL: ${config.REPO_LIST_URL}`);
  console.log(`缓存时间: ${config.CACHE_DURATION / 60000} 分钟`);
  console.log(`刷新间隔: ${config.REFRESH_INTERVAL / 60000} 分钟`);
});

// 定期刷新缓存
setInterval(async () => {
  console.log('开始定期刷新缓存...');
  await fetchRepoList();
}, config.REFRESH_INTERVAL);