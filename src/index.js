// Cloudflare Worker - 使用 ES 模块语法
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 处理不同路由
    if (path === '/' || path === '/index.html') {
      return serveFrontend();
    } else if (path === '/api/releases') {
      return handleReleases(request, env);
    } else if (path.startsWith('/api/download')) {
      return handleDownload(request, url, env);
    } else if (path === '/api/refresh') {
      return handleRefresh(request, env);
    } else if (path === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

// 服务前端页面
async function serveFrontend() {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub Releases 代理</title>
    <style>
        :root { --primary: #24292e; --secondary: #0366d6; }
        body { font-family: -apple-system, sans-serif; margin: 0; padding: 20px; background: #f6f8fa; color: var(--primary); }
        .container { max-width: 1200px; margin: 0 auto; }
        header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #e1e4e8; }
        h1 { color: var(--primary); margin-bottom: 10px; }
        .controls { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .search { flex: 1; padding: 10px; border: 1px solid #e1e4e8; border-radius: 6px; max-width: 300px; }
        .btn { background: var(--secondary); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
        .repo-card { background: white; border: 1px solid #e1e4e8; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .repo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .repo-name { color: var(--secondary); font-size: 18px; font-weight: 600; text-decoration: none; }
        .asset-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f6f8fa; border-radius: 6px; margin: 5px 0; }
        .download-btn { background: #2ea44f; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; }
        .loading, .error { text-align: center; padding: 40px; }
        .error { background: #ffebee; color: #c62828; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="container">
        <header><h1>GitHub Releases 代理服务</h1><p>通过代理加速下载 GitHub Releases 文件</p></header>
        <div class="controls">
            <input type="text" class="search" placeholder="搜索仓库或文件..." id="search">
            <button class="btn" onclick="loadReleases(true)">↻ 刷新</button>
        </div>
        <div id="loading" class="loading">加载中...</div>
        <div id="content"></div>
        <div id="error" class="error" style="display:none;"></div>
        <div id="timestamp" style="text-align:center; color:#586069; margin-top:20px; font-size:12px;"></div>
    </div>
    <script>
        const API_BASE = window.location.origin + '/api';
        let cachedData = null;
        
        async function loadReleases(force = false) {
            const loading = document.getElementById('loading');
            const content = document.getElementById('content');
            const error = document.getElementById('error');
            
            loading.style.display = 'block';
            content.style.display = 'none';
            error.style.display = 'none';
            
            try {
                const cacheKey = 'releases_cache';
                const cacheTime = localStorage.getItem(cacheKey + '_time');
                const now = Date.now();
                
                if (!force && cachedData && cacheTime && (now - cacheTime < 300000)) {
                    displayReleases(cachedData);
                    return;
                }
                
                const response = await fetch(API_BASE + '/releases');
                const data = await response.json();
                
                if (data.success) {
                    cachedData = data;
                    localStorage.setItem(cacheKey, JSON.stringify(data));
                    localStorage.setItem(cacheKey + '_time', now);
                    displayReleases(data);
                    document.getElementById('timestamp').textContent = '最后更新: ' + new Date(data.timestamp).toLocaleString();
                } else {
                    throw new Error(data.error || '加载失败');
                }
            } catch (err) {
                error.style.display = 'block';
                error.textContent = '错误: ' + err.message;
                
                // 尝试使用缓存
                const cache = localStorage.getItem('releases_cache');
                if (cache) {
                    displayReleases(JSON.parse(cache));
                }
            } finally {
                loading.style.display = 'none';
                content.style.display = 'block';
            }
        }
        
        function displayReleases(data) {
            const content = document.getElementById('content');
            const search = document.getElementById('search').value.toLowerCase();
            
            let html = '';
            
            data.data.forEach(repo => {
                if (!repo.releases || repo.releases.length === 0) return;
                
                const repoName = repo.repo.toLowerCase();
                if (search && !repoName.includes(search)) {
                    let hasMatch = false;
                    repo.releases.forEach(r => {
                        r.assets.forEach(a => {
                            if (a.name.toLowerCase().includes(search)) hasMatch = true;
                        });
                    });
                    if (!hasMatch) return;
                }
                
                html += \`<div class="repo-card">
                    <div class="repo-header">
                        <a href="\${repo.url}" target="_blank" class="repo-name">\${repo.repo}</a>
                    </div>\`;
                
                repo.releases.forEach(release => {
                    html += \`<div style="margin-top:15px; padding-top:15px; border-top:1px solid #e1e4e8;">
                        <div><strong>\${release.name || release.tag_name}</strong> <span style="background:#f1f8ff; color:#0366d6; padding:2px 8px; border-radius:12px; font-size:12px;">\${release.tag_name}</span></div>\`;
                    
                    release.assets.forEach(asset => {
                        const size = formatSize(asset.size);
                        html += \`<div class="asset-item">
                            <div>\${asset.name} <span style="color:#586069; font-size:12px;">(\${size})</span></div>
                            <a href="\${asset.proxy_url}" class="download-btn" download>下载</a>
                        </div>\`;
                    });
                    
                    html += \`</div>\`;
                });
                
                html += \`</div>\`;
            });
            
            content.innerHTML = html || '<div class="repo-card">没有找到仓库</div>';
        }
        
        function formatSize(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        // 搜索功能
        document.getElementById('search').addEventListener('input', () => {
            if (cachedData) displayReleases(cachedData);
        });
        
        // 自动刷新
        setInterval(() => loadReleases(true), 600000);
        
        // 初始加载
        loadReleases();
    </script>
</body>
</html>`;
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

// 处理Releases API
async function handleReleases(request, env) {
  try {
    // 获取仓库列表URL
    const repoListUrl = env.REPO_LIST_URL || 'https://raw.githubusercontent.com/example/repo-list/main/url.txt';
    
    // 获取仓库列表
    const repoResponse = await fetch(repoListUrl);
    if (!repoResponse.ok) {
      throw new Error(`无法获取仓库列表: ${repoResponse.status}`);
    }
    
    const repoText = await repoResponse.text();
    const repos = parseRepoList(repoText);
    
    // 获取每个仓库的Releases
    const releasesPromises = repos.map(async (repo) => {
      try {
        const releases = await fetchGitHubReleases(repo.owner, repo.repo, env.GITHUB_TOKEN);
        
        const processedReleases = releases.map(release => ({
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
            proxy_url: `${new URL(request.url).origin}/api/download?owner=${repo.owner}&repo=${repo.repo}&assetId=${asset.id}&filename=${encodeURIComponent(asset.name)}`
          }))
        }));
        
        return {
          repo: `${repo.owner}/${repo.repo}`,
          url: repo.url,
          releases: processedReleases,
          error: null
        };
      } catch (error) {
        return {
          repo: `${repo.owner}/${repo.repo}`,
          url: repo.url,
          releases: null,
          error: error.message
        };
      }
    });
    
    const results = await Promise.all(releasesPromises);
    
    return new Response(JSON.stringify({
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
      source: 'cloudflare-worker'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 处理下载代理
async function handleDownload(request, url, env) {
  const params = url.searchParams;
  const owner = params.get('owner');
  const repo = params.get('repo');
  const assetId = params.get('assetId');
  const filename = params.get('filename');
  
  if (!owner || !repo || !assetId || !filename) {
    return new Response('缺少参数', { status: 400 });
  }
  
  try {
    const headers = {
      'Accept': 'application/octet-stream',
      'User-Agent': 'GitHub-Releases-Proxy/1.0'
    };
    
    if (env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${env.GITHUB_TOKEN}`;
    }
    
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/assets/${assetId}`,
      { headers }
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API错误: ${response.status}`);
    }
    
    // 创建可读流
    const { readable, writable } = new TransformStream();
    response.body.pipeTo(writable);
    
    return new Response(readable, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 处理缓存刷新
async function handleRefresh(request, env) {
  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/releases', request.url).toString());
  
  // 删除缓存
  await cache.delete(cacheKey);
  
  return new Response(JSON.stringify({
    success: true,
    message: '缓存已刷新'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// 解析仓库列表
function parseRepoList(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const cleanUrl = line.replace(/^https?:\/\//, '').replace('github.com/', '');
      const [owner, repo] = cleanUrl.split('/').filter(Boolean);
      return {
        owner,
        repo: repo?.replace(/\.git$/, '') || '',
        url: `https://github.com/${owner}/${repo}`
      };
    })
    .filter(repo => repo.owner && repo.repo);
}

// 获取GitHub Releases
async function fetchGitHubReleases(owner, repo, token) {
  const headers = {
    'User-Agent': 'GitHub-Releases-Proxy/1.0',
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/releases`,
    { headers }
  );
  
  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error(`GitHub API错误: ${response.status}`);
  }
  
  return await response.json();
}