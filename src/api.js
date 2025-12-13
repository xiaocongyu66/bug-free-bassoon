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
  
  // 获取README
  if (path === '/api/readme') {
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    if (owner && repo) {
      return await getReadme(env, owner, repo);
    }
    return new Response(JSON.stringify({ error: 'Missing owner or repo' }), { status: 400 });
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

// 获取README文件
async function getReadme(env, owner, repo) {
  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Releases-Proxy'
    };
    
    if (env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${env.GITHUB_TOKEN}`;
    }
    
    // 尝试获取默认README（通常是最顶层的README.md）
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers }
    );
    
    if (!response.ok) {
      // 如果获取失败，尝试获取其他可能的README文件
      return new Response(JSON.stringify({
        success: false,
        error: 'README not found',
        message: '该仓库没有找到README文件'
      }), { status: 404 });
    }
    
    const data = await response.json();
    
    // GitHub API返回的是Base64编码的内容
    let content;
    if (data.content) {
      // 在Worker环境中使用atob解码Base64
      if (typeof atob === 'function') {
        content = atob(data.content.replace(/\n/g, ''));
      } else {
        // 如果在特殊环境中，使用Buffer
        content = Buffer.from(data.content, 'base64').toString('utf-8');
      }
    } else if (data.download_url) {
      // 如果提供了直接下载URL，也可以直接获取
      const downloadResponse = await fetch(data.download_url, { headers });
      content = await downloadResponse.text();
    } else {
      throw new Error('无法获取README内容');
    }
    
    // 处理README内容
    const readmeData = processReadmeContent(content, data.name);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        content: content,
        html: readmeData.html,
        name: data.name,
        path: data.path,
        size: data.size,
        download_url: data.download_url,
        type: readmeData.type
      },
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Error fetching README:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 });
  }
}

// 处理README内容
function processReadmeContent(content, filename) {
  const extension = filename.split('.').pop().toLowerCase();
  
  let html = '';
  let processedContent = content;
  
  // 根据文件类型处理
  switch (extension) {
    case 'md':
    case 'markdown':
      // 简单Markdown到HTML转换（基础版本）
      html = simpleMarkdownToHtml(content);
      break;
    case 'txt':
      // 纯文本，直接包裹在<pre>标签中
      html = `<pre class="readme-text">${escapeHtml(content)}</pre>`;
      break;
    case 'rst':
      // reStructuredText，暂时按纯文本处理
      html = `<pre class="readme-text">${escapeHtml(content)}</pre>`;
      break;
    default:
      // 其他格式按纯文本处理
      html = `<pre class="readme-text">${escapeHtml(content)}</pre>`;
  }
  
  return {
    content: content,
    html: html,
    type: extension
  };
}

// 简单的Markdown到HTML转换
function simpleMarkdownToHtml(markdown) {
  let html = markdown;
  
  // 转换标题
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  
  // 转换粗体和斜体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // 转换代码块
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 转换链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  
  // 转换列表
  html = html.replace(/^\s*[-*+] (.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  html = html.replace(/<\/ul>\n<ul>/g, '');
  
  // 转换段落
  const lines = html.split('\n');
  let inParagraph = false;
  let newHtml = '';
  
  for (const line of lines) {
    if (line.trim() === '') {
      if (inParagraph) {
        newHtml += '</p>\n';
        inParagraph = false;
      }
      continue;
    }
    
    // 跳过已经是块级元素的标签
    if (line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('<li') || 
        line.startsWith('<pre') || line.startsWith('<code') || line.startsWith('<blockquote')) {
      if (inParagraph) {
        newHtml += '</p>\n';
        inParagraph = false;
      }
      newHtml += line + '\n';
    } else {
      if (!inParagraph) {
        newHtml += '<p>';
        inParagraph = true;
      }
      newHtml += line + '<br>\n';
    }
  }
  
  if (inParagraph) {
    newHtml += '</p>';
  }
  
  return newHtml;
}

// HTML转义
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
