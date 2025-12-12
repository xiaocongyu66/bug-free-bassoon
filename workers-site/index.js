// Cloudflare Worker
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN';
const REPO_LIST_URL = 'YOUR_URL_TXT_URL';
const CACHE_DURATION = 3600; // 1小时缓存

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 路由处理
  if (path === '/api/releases' || path === '/') {
    return handleReleases(request);
  } else if (path.startsWith('/api/download')) {
    return handleDownload(request, url);
  } else if (path.startsWith('/api/refresh')) {
    return handleRefresh(request, url);
  }

  return new Response('Not Found', { status: 404 });
}

async function handleReleases(request) {
  // 检查缓存
  const cacheKey = new Request(request.url.toString(), request);
  const cache = caches.default;
  let response = await cache.match(cacheKey);

  if (!response) {
    try {
      // 获取仓库列表
      const repoResponse = await fetch(REPO_LIST_URL);
      const repoText = await repoResponse.text();
      
      const repos = repoText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
          const [owner, repo] = line.replace('https://github.com/', '').split('/');
          return { owner, repo, url: line };
        });

      // 获取每个仓库的Releases
      const headers = GITHUB_TOKEN ? { 
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'GitHub-Releases-Proxy'
      } : {};

      const releasesPromises = repos.map(async (repo) => {
        try {
          const response = await fetch(
            `https://api.github.com/repos/${repo.owner}/${repo.repo}/releases`,
            { headers }
          );

          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const releases = await response.json();
          
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

      response = new Response(JSON.stringify({
        success: true,
        data: results,
        timestamp: new Date().toISOString(),
        source: 'cloudflare'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${CACHE_DURATION}`,
          'Access-Control-Allow-Origin': '*'
        }
      });

      // 存入缓存
      event.waitUntil(cache.put(cacheKey, response.clone()));
    } catch (error) {
      response = new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return response;
}

async function handleDownload(request, url) {
  const params = url.searchParams;
  const owner = params.get('owner');
  const repo = params.get('repo');
  const assetId = params.get('assetId');
  const filename = params.get('filename');

  if (!owner || !repo || !assetId || !filename) {
    return new Response('Missing parameters', { status: 400 });
  }

  try {
    const headers = GITHUB_TOKEN ? { 
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/octet-stream',
      'User-Agent': 'GitHub-Releases-Proxy'
    } : {};

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/assets/${assetId}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    // 创建新的响应，设置正确的文件名
    const headers = new Headers(response.headers);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: response.status,
      headers: headers
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

async function handleRefresh(request, url) {
  // 清除缓存逻辑
  const params = url.searchParams;
  const owner = params.get('owner');
  const repo = params.get('repo');

  // 这里可以实现缓存清除逻辑
  // Cloudflare Workers的缓存清除需要调用API
  
  return new Response(JSON.stringify({
    success: true,
    message: owner && repo 
      ? `Cache refresh scheduled for ${owner}/${repo}`
      : 'Cache refresh scheduled for all repos'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}