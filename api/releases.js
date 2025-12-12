// Vercel Serverless Function - /api/releases
const axios = require('axios');

module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_LIST_URL = process.env.REPO_LIST_URL || 'https://raw.githubusercontent.com/example/url.txt';

  try {
    // 获取仓库列表
    const repoResponse = await axios.get(REPO_LIST_URL);
    const repos = repoResponse.data
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => {
        const [owner, repo] = line.replace('https://github.com/', '').split('/');
        return { owner, repo, url: line };
      });

    // 获取每个仓库的Releases
    const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};
    const releasesPromises = repos.map(async (repo) => {
      try {
        const response = await axios.get(
          `https://api.github.com/repos/${repo.owner}/${repo.repo}/releases`,
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
            proxy_url: `${process.env.VERCEL_URL}/api/download?owner=${repo.owner}&repo=${repo.repo}&assetId=${asset.id}&filename=${encodeURIComponent(asset.name)}`
          }))
        }));

        return {
          repo: `${repo.owner}/${repo.repo}`,
          url: repo.url,
          releases: releases,
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

    // 设置缓存头
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
      source: 'vercel'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};