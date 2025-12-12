// API 请求处理
export async function handleApiRequest(request, env, url) {
  const path = url.pathname;
  const searchParams = url.searchParams;
  
  // 获取仓库列表
  if (path === '/api/repos') {
    return await getRepoList(env);
  }
  
  // 获取最新版本
  if (path === '/api/latest') {
    return await getLatestReleases(env);
  }
  
  // 获取所有版本
  if (path === '/api/all') {
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    if (owner && repo) {
      return await getAllReleases(env, owner, repo);
    }
    return new Response(JSON.stringify({ error: 'Missing owner or repo' }), { status: 400 });
  }
  
  // 获取仓库详情
  if (path === '/api/repo') {
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    if (owner && repo) {
      return await getRepoDetails(env, owner, repo);
    }
    return new Response(JSON.stringify({ error: 'Missing owner or repo' }), { status: 400 });
  }
  
  // 代理下载
  if (path === '/api/download') {
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const assetId = searchParams.get('assetId');
    const filename = searchParams.get('filename');
    
    if (!owner || !repo || !assetId || !filename) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
    }
    
    return await proxyDownload(env, owner, repo, assetId, filename);
  }
  
  // 刷新缓存
  if (path === '/api/refresh') {
    // 这里可以添加缓存刷新逻辑
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Cache refresh endpoint' 
    }));
  }
  
  // Token 状态检查
  if (path === '/api/tokens/status') {
    return await getTokenStatus(env);
  }
  
  return new Response(JSON.stringify({ error: 'API endpoint not found' }), { status: 404 });
}

// Token 管理器类
class TokenManager {
  constructor(tokensString = '') {
    this.tokens = tokensString.split(',').map(t => t.trim()).filter(t => t);
    this.currentIndex = 0;
    this.tokenStats = {};
    this.tokens.forEach(token => {
      this.tokenStats[token.substring(0, 8) + '...'] = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        lastUsed: null,
        lastError: null
      };
    });
  }
  
  // 获取下一个可用的 Token
  getNextToken() {
    if (this.tokens.length === 0) {
      return null;
    }
    
    // 尝试找到可用的 Token
    const startIndex = this.currentIndex;
    let attempts = 0;
    
    while (attempts < this.tokens.length) {
      const token = this.tokens[this.currentIndex];
      const tokenKey = token.substring(0, 8) + '...';
      
      this.currentIndex = (this.currentIndex + 1) % this.tokens.length;
      attempts++;
      
      // 检查 Token 是否可用（这里可以根据需要添加更复杂的检查逻辑）
      if (this.tokenStats[tokenKey].failedRequests < 5) { // 连续失败5次则跳过
        this.tokenStats[tokenKey].totalRequests++;
        this.tokenStats[tokenKey].lastUsed = new Date().toISOString();
        return token;
      }
    }
    
    return this.tokens[0] || null; // 如果所有Token都失败过，返回第一个
  }
  
  // 记录请求结果
  recordResult(token, success, error = null) {
    const tokenKey = token.substring(0, 8) + '...';
    if (success) {
      this.tokenStats[tokenKey].successfulRequests++;
      this.tokenStats[tokenKey].failedRequests = 0; // 重置失败计数
    } else {
      this.tokenStats[tokenKey].failedRequests++;
      this.tokenStats[tokenKey].lastError = error;
    }
  }
  
  // 获取 Token 状态
  getStats() {
    return {
      totalTokens: this.tokens.length,
      tokens: this.tokens.map(t => t.substring(0, 8) + '...'),
      stats: this.tokenStats,
      currentIndex: this.currentIndex
    };
  }
  
  // 重置 Token 状态
  resetToken(token) {
    const tokenKey = token.substring(0, 8) + '...';
    if (this.tokenStats[tokenKey]) {
      this.tokenStats[tokenKey].failedRequests = 0;
      this.tokenStats[tokenKey].lastError = null;
    }
  }
}

// 获取 Token 状态
async function getTokenStatus(env) {
  const tokenManager = new TokenManager(env.GITHUB_TOKENS || '');
  return new Response(JSON.stringify({
    success: true,
    data: tokenManager.getStats(),
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

// 使用 Token 轮询获取数据
async function fetchWithTokenRotation(url, options, tokenManager) {
  let lastError = null;
  
  // 如果没有 Token，直接请求
  if (!tokenManager || tokenManager.tokens.length === 0) {
    const response = await fetch(url, options);
    if (response.ok) {
      return response;
    }
    throw new Error(`Request failed: ${response.status}`);
  }
  
  // 尝试所有可用的 Token
  const maxAttempts = Math.min(tokenManager.tokens.length * 2, 10); // 最多尝试10次
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const token = tokenManager.getNextToken();
    if (!token) break;
    
    const tokenKey = token.substring(0, 8) + '...';
    
    try {
      const headers = {
        ...options.headers,
        'Authorization': `token ${token}`,
        'User-Agent': 'GitHub-Releases-Proxy',
        'Accept': 'application/vnd.github.v3+json'
      };
      
      const response = await fetch(url, { ...options, headers });
      
      if (response.status === 401 || response.status === 403) {
        // Token 无效或被限制
        tokenManager.recordResult(token, false, `Token ${tokenKey} failed with status ${response.status}`);
        lastError = new Error(`Token ${tokenKey} failed: ${response.status}`);
        
        // 如果是速率限制，等待一段时间
        const remaining = response.headers.get('X-RateLimit-Remaining');
        const resetTime = response.headers.get('X-RateLimit-Reset');
        
        if (response.status === 403 && remaining === '0') {
          const resetDate = new Date(resetTime * 1000);
          const waitTime = resetDate - new Date();
          if (waitTime > 0 && waitTime < 60000) { // 等待最多60秒
            await new Promise(resolve => setTimeout(resolve, waitTime + 1000));
          }
        }
        continue;
      }
      
      if (response.ok) {
        tokenManager.recordResult(token, true);
        return response;
      }
      
      // 其他错误，不换 Token 直接返回
      tokenManager.recordResult(token, true); // 认为 Token 是有效的，但请求有误
      return response;
      
    } catch (error) {
      tokenManager.recordResult(token, false, error.message);
      lastError = error;
    }
  }
  
  throw lastError || new Error('All tokens failed');
}

// 获取仓库列表
async function getRepoList(env) {
  try {
    const repoListUrl = env.REPO_LIST_URL || 'https://raw.githubusercontent.com/example/repo-list/main/url.txt';
    const response = await fetch(repoListUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch repo list: ${response.status}`);
    }
    
    const text = await response.text();
    const repos = parseRepoList(text);
    
    return new Response(JSON.stringify({
      success: true,
      data: repos,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 });
  }
}

// 获取最新版本
async function getLatestReleases(env) {
  try {
    const repoListUrl = env.REPO_LIST_URL;
    const repoResponse = await fetch(repoListUrl);
    const repoText = await repoResponse.text();
    const repos = parseRepoList(repoText);
    
    const results = [];
    const tokenManager = new TokenManager(env.GITHUB_TOKENS || '');
    
    for (const repo of repos.slice(0, 20)) { // 限制最多20个仓库
      try {
        const releases = await fetchGitHubReleases(repo.owner, repo.repo, tokenManager);
        if (releases && releases.length > 0) {
          const latestRelease = releases[0];
          const historyReleases = releases.slice(1, 6); // 最近5个历史版本
          
          results.push({
            repo: `${repo.owner}/${repo.repo}`,
            url: repo.url,
            latest: processRelease(latestRelease, repo.owner, repo.repo, env),
            history: historyReleases.map(r => processRelease(r, repo.owner, repo.repo, env)),
            totalReleases: releases.length
          });
        }
      } catch (error) {
        console.error(`Error fetching ${repo.owner}/${repo.repo}:`, error.message);
        results.push({
          repo: `${repo.owner}/${repo.repo}`,
          url: repo.url,
          error: error.message
        });
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: results,
      tokenStats: tokenManager.getStats(),
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 });
  }
}

// 获取仓库所有版本
async function getAllReleases(env, owner, repo) {
  try {
    const tokenManager = new TokenManager(env.GITHUB_TOKENS || '');
    const releases = await fetchGitHubReleases(owner, repo, tokenManager);
    
    const processedReleases = releases.map(r => 
      processRelease(r, owner, repo, env)
    );
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        repo: `${owner}/${repo}`,
        releases: processedReleases,
        count: releases.length
      },
      tokenStats: tokenManager.getStats(),
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 });
  }
}

// 获取仓库详情
async function getRepoDetails(env, owner, repo) {
  try {
    const tokenManager = new TokenManager(env.GITHUB_TOKENS || '');
    const releases = await fetchGitHubReleases(owner, repo, tokenManager);
    
    if (!releases || releases.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        data: {
          repo: `${owner}/${repo}`,
          latest: null,
          history: [],
          total: 0
        }
      }));
    }
    
    const latestRelease = releases[0];
    const historyReleases = releases.slice(1, 11); // 最近10个历史版本
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        repo: `${owner}/${repo}`,
        latest: processRelease(latestRelease, owner, repo, env),
        history: historyReleases.map(r => processRelease(r, owner, repo, env)),
        total: releases.length
      },
      tokenStats: tokenManager.getStats(),
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 });
  }
}

// 代理下载 - 优化版
async function proxyDownload(env, owner, repo, assetId, filename) {
  try {
    const tokenManager = new TokenManager(env.GITHUB_TOKENS || '');
    
    // 首先获取资产的下载URL（这会返回302重定向）
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/assets/${assetId}`;
    
    console.log(`[Download] 请求资产信息: ${apiUrl}`);
    
    // 获取资产信息，包含真实的下载URL
    const assetResponse = await fetchWithTokenRotation(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Releases-Proxy'
      }
    }, tokenManager);
    
    if (!assetResponse.ok) {
      console.error(`[Download] GitHub API 错误: ${assetResponse.status}`);
      throw new Error(`GitHub API error: ${assetResponse.status}`);
    }
    
    const assetInfo = await assetResponse.json();
    const downloadUrl = assetInfo.url; // GitHub 提供的下载URL
    
    console.log(`[Download] 资产信息获取成功, 下载URL: ${downloadUrl}`);
    
    // 使用fetch直接获取文件流，不设置Accept头让GitHub返回正确的重定向
    const fileResponse = await fetch(downloadUrl, {
      headers: {
        'Accept': 'application/octet-stream',
        'User-Agent': 'GitHub-Releases-Proxy'
      },
      // 重要：设置重定向策略为手动处理
      redirect: 'manual'
    });
    
    // 处理重定向
    if (fileResponse.status === 302 || fileResponse.status === 301) {
      const redirectUrl = fileResponse.headers.get('Location');
      console.log(`[Download] 重定向到: ${redirectUrl}`);
      
      if (!redirectUrl) {
        throw new Error('重定向URL为空');
      }
      
      // 跟随重定向，这次自动跟随
      const finalResponse = await fetch(redirectUrl, {
        headers: {
          'User-Agent': 'GitHub-Releases-Proxy'
        }
      });
      
      if (!finalResponse.ok) {
        throw new Error(`下载失败: ${finalResponse.status}`);
      }
      
      // 获取响应头
      const headers = new Headers();
      headers.set('Content-Type', finalResponse.headers.get('Content-Type') || 'application/octet-stream');
      headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      headers.set('Cache-Control', 'public, max-age=86400');
      
      // 传递 Content-Length（如果存在）
      const contentLength = finalResponse.headers.get('Content-Length');
      if (contentLength) {
        headers.set('Content-Length', contentLength);
      }
      
      console.log(`[Download] 开始流式传输, 文件大小: ${contentLength || '未知'} bytes`);
      
      // 使用更可靠的流传输方式
      return new Response(finalResponse.body, {
        headers: headers,
        status: finalResponse.status,
        statusText: finalResponse.statusText
      });
    }
    
    // 如果没有重定向，直接返回
    if (!fileResponse.ok) {
      throw new Error(`下载请求失败: ${fileResponse.status}`);
    }
    
    // 获取响应头
    const headers = new Headers();
    headers.set('Content-Type', fileResponse.headers.get('Content-Type') || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    headers.set('Cache-Control', 'public, max-age=86400');
    
    const contentLength = fileResponse.headers.get('Content-Length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    
    console.log(`[Download] 直接传输, 文件大小: ${contentLength || '未知'} bytes`);
    
    return new Response(fileResponse.body, {
      headers: headers,
      status: fileResponse.status,
      statusText: fileResponse.statusText
    });
    
  } catch (error) {
    console.error('[Download] 下载错误:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: '下载代理失败，请检查网络连接或重试'
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// 获取 GitHub Releases（使用 Token 轮询）
async function fetchGitHubReleases(owner, repo, tokenManager) {
  const url = `https://api.github.com/repos/${owner}/${repo}/releases`;
  
  const response = await fetchWithTokenRotation(url, {}, tokenManager);
  
  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  return await response.json();
}

// 处理单个 Release
function processRelease(release, owner, repo, env) {
  const baseUrl = env.WORKER_URL || '';
  
  return {
    id: release.id,
    tag_name: release.tag_name,
    name: release.name,
    published_at: release.published_at,
    prerelease: release.prerelease,
    draft: release.draft,
    assets: release.assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      size: asset.size,
      download_count: asset.download_count,
      browser_download_url: asset.browser_download_url,
      proxy_url: `${baseUrl}/api/download?owner=${owner}&repo=${repo}&assetId=${asset.id}&filename=${encodeURIComponent(asset.name)}`
    }))
  };
}


