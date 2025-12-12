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
  
  return new Response(JSON.stringify({ error: 'API endpoint not found' }), { status: 404 });
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
    const githubToken = env.GITHUB_TOKEN;
    
    for (const repo of repos.slice(0, 20)) { // 限制最多20个仓库
      try {
        const releases = await fetchGitHubReleases(repo.owner, repo.repo, githubToken);
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
    const githubToken = env.GITHUB_TOKEN;
    const releases = await fetchGitHubReleases(owner, repo, githubToken);
    
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
    const githubToken = env.GITHUB_TOKEN;
    const releases = await fetchGitHubReleases(owner, repo, githubToken);
    
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

// 代理下载
async function proxyDownload(env, owner, repo, assetId, filename) {
  try {
    const headers = {
      'Accept': 'application/octet-stream',
      'User-Agent': 'GitHub-Releases-Proxy'
    };
    
    if (env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${env.GITHUB_TOKEN}`;
    }
    
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/assets/${assetId}`,
      { headers }
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const { readable, writable } = new TransformStream();
    response.body.pipeTo(writable);
    
    return new Response(readable, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=86400'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 });
  }
}

// 解析仓库列表
function parseRepoList(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      // 处理各种格式
      const cleanLine = line.replace(/^https?:\/\//, '').replace('github.com/', '');
      const parts = cleanLine.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return {
          owner: parts[0],
          repo: parts[1].replace(/\.git$/, ''),
          url: `https://github.com/${parts[0]}/${parts[1]}`
        };
      }
      return null;
    })
    .filter(repo => repo !== null);
}

// 获取 GitHub Releases
async function fetchGitHubReleases(owner, repo, token) {
  const headers = {
    'User-Agent': 'GitHub-Releases-Proxy',
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
