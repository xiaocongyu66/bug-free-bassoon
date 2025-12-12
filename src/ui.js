// 生成 HTML 页面
export function generateHTML(env) {
  const workerUrl = env.WORKER_URL || '';
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub Releases 代理服务</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-color: #24292e;
            --secondary-color: #0366d6;
            --accent-color: #2ea44f;
            --bg-color: #f6f8fa;
            --card-bg: #ffffff;
            --border-color: #e1e4e8;
            --text-secondary: #586069;
            --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--primary-color);
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
        }
        
        h1 {
            color: var(--primary-color);
            margin-bottom: 10px;
            font-size: 2.5rem;
        }
        
        .subtitle {
            color: var(--text-secondary);
            font-size: 1.1rem;
        }
        
        .controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 15px;
            background: var(--card-bg);
            padding: 20px;
            border-radius: 8px;
            box-shadow: var(--shadow);
        }
        
        .search-container {
            flex: 1;
            max-width: 400px;
            position: relative;
        }
        
        .search-input {
            width: 100%;
            padding: 12px 45px 12px 15px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        .search-input:focus {
            outline: none;
            border-color: var(--secondary-color);
            box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
        }
        
        .search-icon {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-secondary);
        }
        
        .stats {
            display: flex;
            gap: 20px;
            color: var(--text-secondary);
            font-size: 14px;
        }
        
        .stats-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .btn {
            background-color: var(--secondary-color);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: background-color 0.3s;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn:hover {
            background-color: #0256b9;
        }
        
        .btn-primary {
            background-color: var(--accent-color);
        }
        
        .btn-primary:hover {
            background-color: #2c974b;
        }
        
        .repo-list {
            display: grid;
            gap: 25px;
        }
        
        .repo-card {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
            transition: box-shadow 0.3s;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .repo-card:hover {
            box-shadow: var(--shadow);
        }
        
        .repo-header {
            padding: 20px;
            border-bottom: 1px solid var(--border-color);
            background: linear-gradient(to right, #f6f8fa, #ffffff);
        }
        
        .repo-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .repo-name {
            font-size: 20px;
            font-weight: 600;
            color: var(--secondary-color);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .repo-name:hover {
            text-decoration: underline;
        }
        
        .repo-tag {
            background-color: #f1f8ff;
            color: var(--secondary-color);
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .repo-url {
            color: var(--text-secondary);
            font-size: 14px;
            word-break: break-all;
        }
        
        .repo-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
            padding: 20px;
        }
        
        @media (max-width: 768px) {
            .repo-content {
                grid-template-columns: 1fr;
            }
        }
        
        .latest-release {
            border-right: 1px solid var(--border-color);
            padding-right: 20px;
        }
        
        .release-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: var(--primary-color);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .release-tag {
            background-color: var(--accent-color);
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        
        .release-meta {
            color: var(--text-secondary);
            font-size: 14px;
            margin-bottom: 20px;
            display: flex;
            gap: 15px;
        }
        
        .assets-list {
            margin-top: 20px;
        }
        
        .asset-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background-color: var(--bg-color);
            border-radius: 6px;
            margin-bottom: 10px;
            transition: background-color 0.3s;
        }
        
        .asset-item:hover {
            background-color: #eaeef2;
        }
        
        .asset-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .asset-icon {
            color: var(--text-secondary);
        }
        
        .asset-name {
            font-weight: 500;
        }
        
        .asset-size {
            color: var(--text-secondary);
            font-size: 12px;
        }
        
        .asset-actions {
            display: flex;
            gap: 10px;
        }
        
        .btn-small {
            padding: 6px 12px;
            font-size: 12px;
            border-radius: 4px;
        }
        
        .btn-download {
            background-color: var(--accent-color);
        }
        
        .btn-download:hover {
            background-color: #2c974b;
        }
        
        .history-section {
            padding: 15px;
            background-color: #fafbfc;
            border-radius: 6px;
        }
        
        .history-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
            color: var(--primary-color);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .history-list {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .history-item {
            padding: 10px;
            border-bottom: 1px solid var(--border-color);
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .history-item:hover {
            background-color: #f0f3f6;
        }
        
        .history-item:last-child {
            border-bottom: none;
        }
        
        .history-tag {
            font-weight: 600;
            color: var(--secondary-color);
            margin-bottom: 5px;
        }
        
        .history-date {
            color: var(--text-secondary);
            font-size: 12px;
        }
        
        .loading {
            text-align: center;
            padding: 60px 20px;
            color: var(--text-secondary);
        }
        
        .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid var(--secondary-color);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .error {
            background-color: #ffebee;
            color: #c62828;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--text-secondary);
        }
        
        .empty-state i {
            font-size: 48px;
            margin-bottom: 20px;
            color: #e1e4e8;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 30px;
        }
        
        .page-btn {
            padding: 8px 16px;
            border: 1px solid var(--border-color);
            background-color: white;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .page-btn:hover {
            background-color: var(--bg-color);
        }
        
        .page-btn.active {
            background-color: var(--secondary-color);
            color: white;
            border-color: var(--secondary-color);
        }
        
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-size: 14px;
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        
        .modal-content {
            background-color: white;
            border-radius: 8px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-title {
            font-size: 20px;
            font-weight: 600;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--text-secondary);
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .history-details {
            margin-top: 20px;
        }
        
        .assets-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .assets-table th,
        .assets-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        
        .assets-table th {
            background-color: var(--bg-color);
            font-weight: 600;
        }
        
        .copy-btn {
            background-color: #6c757d;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            margin-left: 10px;
        }
        
        .copy-btn:hover {
            background-color: #5a6268;
        }
        
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--accent-color);
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            box-shadow: var(--shadow);
            display: none;
            z-index: 1001;
            
        }
    .api-docs-link {
            position: absolute;
            top: 30px;
            right: 30px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--secondary-color);
            text-decoration: none;
            font-weight: 500;
            padding: 8px 16px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background-color: var(--card-bg);
            transition: all 0.3s;
        }
        
        .api-docs-link:hover {
            background-color: var(--bg-color);
            border-color: var(--secondary-color);
        }
        
        @media (max-width: 768px) {
            .api-docs-link {
                position: static;
                margin-top: 15px;
                align-self: center;
            }
            header {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <a href="/api-docs" class="api-docs-link">
                <i class="fas fa-book"></i>
                API 文档
            </a>
            <h1><i class="fas fa-code-branch"></i> GitHub Releases 代理服务</h1>
            <p class="subtitle">快速、稳定地访问 GitHub Releases，支持代理下载和历史版本查看</p>
        </header>
        
        <div class="controls">
            <div class="search-container">
                <input type="text" class="search-input" id="searchInput" placeholder="搜索仓库或文件...">
                <i class="fas fa-search search-icon"></i>
            </div>
            
            <div class="stats">
                <div class="stats-item" id="repoCount">
                    <i class="fas fa-box"></i>
                    <span>加载中...</span>
                </div>
                <div class="stats-item" id="releaseCount">
                    <i class="fas fa-tag"></i>
                    <span>加载中...</span>
                </div>
                <div class="stats-item" id="lastUpdated">
                    <i class="fas fa-clock"></i>
                    <span>加载中...</span>
                </div>
            </div>
            
            <button class="btn" onclick="refreshData()">
                <i class="fas fa-sync-alt"></i>
                刷新数据
            </button>
        </div>
        
        <div id="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>正在加载 GitHub Releases 数据...</p>
        </div>
        
        <div id="error" class="error" style="display: none;"></div>
        
        <div id="repoList" class="repo-list" style="display: none;"></div>
        
        <div id="emptyState" class="empty-state" style="display: none;">
            <i class="fas fa-inbox"></i>
            <h3>没有找到仓库数据</h3>
            <p>请检查仓库列表配置或网络连接</p>
        </div>
        
        <div class="footer">
            <p>GitHub Releases Proxy v1.0 • 数据来源：<span id="repoSource">GitHub API</span></p>
            <p id="apiStatus">API 状态：<span class="status-indicator">检查中...</span></p>
        </div>
    </div>
    
    <!-- 历史版本详情模态框 -->
    <div id="historyModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title" id="modalTitle"></h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div id="modalContent"></div>
            </div>
        </div>
    </div>
    
    <!-- 复制成功提示 -->
    <div id="toast" class="toast"></div>
    
    <script>
        const API_BASE = window.location.origin;
        let allReposData = [];
        let currentFilter = '';
        
        // 页面加载时获取数据
        document.addEventListener('DOMContentLoaded', () => {
            loadLatestReleases();
            setupSearch();
            checkApiStatus();
        });
        
        // 加载最新版本数据
        async function loadLatestReleases() {
            showLoading();
            hideError();
            hideEmptyState();
            
            try {
                const response = await fetch(API_BASE + '/api/latest');
                const data = await response.json();
                
                if (data.success) {
                    allReposData = data.data;
                    displayRepos(allReposData);
                    updateStats(data);
                } else {
                    showError(data.error || '加载数据失败');
                }
            } catch (error) {
                showError('网络错误: ' + error.message);
            } finally {
                hideLoading();
            }
        }
        
        // 显示仓库数据
        function displayRepos(repos) {
            const repoListEl = document.getElementById('repoList');
            const searchTerm = currentFilter.toLowerCase();
            
            // 过滤数据
            const filteredRepos = repos.filter(repo => {
                if (!searchTerm) return true;
                
                const repoName = repo.repo.toLowerCase();
                const repoUrl = repo.url.toLowerCase();
                
                // 检查仓库名或URL是否匹配
                if (repoName.includes(searchTerm) || repoUrl.includes(searchTerm)) {
                    return true;
                }
                
                // 检查最新版本的文件名是否匹配
                if (repo.latest && repo.latest.assets) {
                    return repo.latest.assets.some(asset => 
                        asset.name.toLowerCase().includes(searchTerm)
                    );
                }
                
                return false;
            });
            
            if (filteredRepos.length === 0) {
                showEmptyState();
                repoListEl.style.display = 'none';
                return;
            }
            
            hideEmptyState();
            repoListEl.style.display = 'grid';
            
            let html = '';
            
            filteredRepos.forEach(repo => {
                html += generateRepoCard(repo);
            });
            
            repoListEl.innerHTML = html;
        }
        
        // 生成仓库卡片
        function generateRepoCard(repo) {
            if (repo.error) {
                return \`
                <div class="repo-card">
                    <div class="repo-header">
                        <div class="repo-title">
                            <a href="\${repo.url}" target="_blank" class="repo-name">
                                <i class="fas fa-exclamation-triangle"></i>
                                \${repo.repo}
                            </a>
                        </div>
                        <div class="repo-url">\${repo.url}</div>
                    </div>
                    <div style="padding: 20px; color: #c62828;">
                        <i class="fas fa-times-circle"></i> 加载失败: \${repo.error}
                    </div>
                </div>\`;
            }
            
            const latest = repo.latest;
            const history = repo.history || [];
            const totalReleases = repo.totalReleases || 0;
            
            let latestAssetsHTML = '';
            if (latest && latest.assets && latest.assets.length > 0) {
                latest.assets.forEach(asset => {
                    const size = formatFileSize(asset.size);
                    const downloads = asset.download_count || 0;
                    
                    latestAssetsHTML += \`
                    <div class="asset-item">
                        <div class="asset-info">
                            <i class="fas fa-file-archive asset-icon"></i>
                            <div>
                                <div class="asset-name">\${asset.name}</div>
                                <div class="asset-size">\${size} • \${downloads} 次下载</div>
                            </div>
                        </div>
                        <div class="asset-actions">
                            <a href="\${asset.proxy_url}" class="btn btn-small btn-download" download>
                                <i class="fas fa-download"></i> 下载
                            </a>
                            <button class="btn btn-small copy-btn" onclick="copyToClipboard('\${asset.proxy_url}', '下载链接已复制')">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>\`;
                });
            } else {
                latestAssetsHTML = '<div style="color: var(--text-secondary); text-align: center; padding: 20px;">无资源文件</div>';
            }
            
            let historyHTML = '';
            if (history.length > 0) {
                history.forEach((release, index) => {
                    const date = formatDate(release.published_at);
                    historyHTML += \`
                    <div class="history-item" onclick="showHistoryDetails('\${repo.repo}', '\${release.tag_name}')">
                        <div class="history-tag">\${release.tag_name}</div>
                        <div class="history-date">\${date}</div>
                    </div>\`;
                });
                
                if (totalReleases > history.length + 1) {
                    historyHTML += \`
                    <div class="history-item" onclick="loadAllReleases('\${repo.repo}')" style="text-align: center; color: var(--secondary-color);">
                        <i class="fas fa-ellipsis-h"></i>
                        查看全部 \${totalReleases} 个版本
                    </div>\`;
                }
            } else {
                historyHTML = '<div style="color: var(--text-secondary); text-align: center; padding: 10px;">暂无历史版本</div>';
            }
            
            return \`
            <div class="repo-card">
                <div class="repo-header">
                    <div class="repo-title">
                        <a href="\${repo.url}" target="_blank" class="repo-name">
                            <i class="fas fa-box"></i>
                            \${repo.repo}
                        </a>
                        <span class="repo-tag">\${totalReleases} 个版本</span>
                    </div>
                    <div class="repo-url">\${repo.url}</div>
                </div>
                
                <div class="repo-content">
                    <div class="latest-release">
                        <div class="release-title">
                            <i class="fas fa-star"></i>
                            最新版本
                            <span class="release-tag">\${latest ? latest.tag_name : '无'}</span>
                        </div>
                        
                        \${latest ? \`
                        <div class="release-meta">
                            <span><i class="far fa-calendar"></i> \${formatDate(latest.published_at)}</span>
                            <span><i class="fas fa-cube"></i> \${latest.assets ? latest.assets.length : 0} 个文件</span>
                            \${latest.prerelease ? '<span style="color: #f0ad4e;"><i class="fas fa-flask"></i> 预发布版</span>' : ''}
                        </div>
                        
                        <div class="assets-list">
                            \${latestAssetsHTML}
                        </div>
                        \` : '<div style="color: var(--text-secondary); text-align: center; padding: 20px;">无发布版本</div>'}
                    </div>
                    
                    <div class="history-section">
                        <div class="history-title">
                            <i class="fas fa-history"></i>
                            历史版本
                        </div>
                        <div class="history-list">
                            \${historyHTML}
                        </div>
                    </div>
                </div>
            </div>\`;
        }
        
        // 显示历史版本详情
        async function showHistoryDetails(repoFullName, tagName) {
            showLoading();
            
            try {
                const [owner, repo] = repoFullName.split('/');
                const response = await fetch(\`\${API_BASE}/api/all?owner=\${owner}&repo=\${repo}\`);
                const data = await response.json();
                
                if (data.success) {
                    const release = data.data.releases.find(r => r.tag_name === tagName);
                    if (release) {
                        showModal(repoFullName, release);
                    } else {
                        showError('未找到该版本');
                    }
                } else {
                    showError(data.error);
                }
            } catch (error) {
                showError('加载失败: ' + error.message);
            } finally {
                hideLoading();
            }
        }
        
        // 加载所有版本
        async function loadAllReleases(repoFullName) {
            showLoading();
            
            try {
                const [owner, repo] = repoFullName.split('/');
                const response = await fetch(\`\${API_BASE}/api/all?owner=\${owner}&repo=\${repo}\`);
                const data = await response.json();
                
                if (data.success) {
                    showAllReleasesModal(repoFullName, data.data.releases);
                } else {
                    showError(data.error);
                }
            } catch (error) {
                showError('加载失败: ' + error.message);
            } finally {
                hideLoading();
            }
        }
        
        // 显示模态框（单版本详情）
        function showModal(repoFullName, release) {
            const modal = document.getElementById('historyModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalContent = document.getElementById('modalContent');
            
            const date = formatDate(release.published_at);
            
            let assetsHTML = '';
            if (release.assets && release.assets.length > 0) {
                assetsHTML = \`
                <h4 style="margin-top: 20px; margin-bottom: 10px;">资源文件</h4>
                <table class="assets-table">
                    <thead>
                        <tr>
                            <th>文件名</th>
                            <th>大小</th>
                            <th>下载次数</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>\`;
                
                release.assets.forEach(asset => {
                    const size = formatFileSize(asset.size);
                    assetsHTML += \`
                    <tr>
                        <td>
                            <i class="fas fa-file-archive"></i>
                            \${asset.name}
                        </td>
                        <td>\${size}</td>
                        <td>\${asset.download_count || 0}</td>
                        <td>
                            <a href="\${asset.proxy_url}" class="btn btn-small btn-download" download>
                                <i class="fas fa-download"></i> 下载
                            </a>
                            <button class="btn btn-small copy-btn" onclick="copyToClipboard('\${asset.proxy_url}')">
                                <i class="fas fa-copy"></i>
                            </button>
                        </td>
                    </tr>\`;
                });
                
                assetsHTML += '</tbody></table>';
            } else {
                assetsHTML = '<p>无资源文件</p>';
            }
            
            modalTitle.textContent = \`\${repoFullName} - \${release.tag_name}\`;
            modalContent.innerHTML = \`
                <div>
                    <h3>\${release.name || release.tag_name}</h3>
                    <div style="color: var(--text-secondary); margin-bottom: 20px;">
                        <p><i class="far fa-calendar"></i> 发布时间: \${date}</p>
                        \${release.prerelease ? '<p><i class="fas fa-flask"></i> 预发布版本</p>' : ''}
                        \${release.draft ? '<p><i class="fas fa-pen"></i> 草稿版本</p>' : ''}
                    </div>
                    
                    \${assetsHTML}
                </div>\`;
            
            modal.style.display = 'flex';
        }
        
        // 显示所有版本模态框
        function showAllReleasesModal(repoFullName, releases) {
            const modal = document.getElementById('historyModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalContent = document.getElementById('modalContent');
            
            modalTitle.textContent = \`\${repoFullName} - 所有版本 (\${releases.length})\`;
            
            let releasesHTML = '';
            releases.forEach(release => {
                const date = formatDate(release.published_at);
                const assetCount = release.assets ? release.assets.length : 0;
                
                releasesHTML += \`
                <div class="history-item" style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <div style="font-weight: 600; color: var(--secondary-color);">
                                \${release.tag_name}
                                \${release.prerelease ? '<span style="font-size: 12px; color: #f0ad4e; margin-left: 5px;">(预发布)</span>' : ''}
                            </div>
                            <div style="color: var(--text-secondary); font-size: 14px;">\${release.name || '无标题'}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 12px; color: var(--text-secondary);">\${date}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">\${assetCount} 个文件</div>
                        </div>
                    </div>
                    
                    \${release.assets && release.assets.length > 0 ? \`
                    <div style="margin-top: 10px; font-size: 14px;">
                        \${release.assets.slice(0, 2).map(asset => \`
                            <span style="background: var(--bg-color); padding: 2px 6px; border-radius: 4px; margin-right: 5px; font-size: 12px;">
                                \${asset.name}
                            </span>
                        \`).join('')}
                        \${release.assets.length > 2 ? \`... 还有 \${release.assets.length - 2} 个文件\` : ''}
                    </div>
                    \` : ''}
                    
                    <div style="margin-top: 10px;">
                        <button class="btn btn-small" onclick="showHistoryDetails('\${repoFullName}', '\${release.tag_name}')">
                            <i class="fas fa-eye"></i> 查看详情
                        </button>
                    </div>
                </div>\`;
            });
            
            modalContent.innerHTML = \`
                <div style="max-height: 60vh; overflow-y: auto;">
                    \${releasesHTML}
                </div>\`;
            
            modal.style.display = 'flex';
        }
        
        // 关闭模态框
        function closeModal() {
            document.getElementById('historyModal').style.display = 'none';
        }
        
        // 刷新数据
        function refreshData() {
            loadLatestReleases();
            showToast('正在刷新数据...', 'info');
        }
        
        // 更新统计信息
        function updateStats(data) {
            const reposWithData = data.data.filter(repo => !repo.error);
            const totalReleases = reposWithData.reduce((sum, repo) => sum + (repo.totalReleases || 0), 0);
            const totalAssets = reposWithData.reduce((sum, repo) => 
                sum + (repo.latest && repo.latest.assets ? repo.latest.assets.length : 0), 0);
            
            document.getElementById('repoCount').innerHTML = \`
                <i class="fas fa-box"></i>
                <span>\${reposWithData.length} 个仓库</span>
            \`;
            
            document.getElementById('releaseCount').innerHTML = \`
                <i class="fas fa-tag"></i>
                <span>\${totalReleases} 个版本 • \${totalAssets} 个文件</span>
            \`;
            
            document.getElementById('lastUpdated').innerHTML = \`
                <i class="fas fa-clock"></i>
                <span>\${formatTime(data.timestamp)}</span>
            \`;
            
            // 更新数据来源
            const repoUrl = new URL(data.data[0]?.url || 'https://github.com');
            document.getElementById('repoSource').textContent = repoUrl.hostname;
        }
        
        // 检查 API 状态
        async function checkApiStatus() {
            try {
                const response = await fetch(API_BASE + '/api/repos');
                const data = await response.json();
                
                const statusEl = document.querySelector('#apiStatus .status-indicator');
                if (data.success) {
                    statusEl.innerHTML = '<span style="color: #2ea44f;"><i class="fas fa-check-circle"></i> 正常</span>';
                } else {
                    statusEl.innerHTML = '<span style="color: #c62828;"><i class="fas fa-times-circle"></i> 异常</span>';
                }
            } catch (error) {
                document.querySelector('#apiStatus .status-indicator').innerHTML = 
                    '<span style="color: #c62828;"><i class="fas fa-times-circle"></i> 连接失败</span>';
            }
        }
        
        // 设置搜索功能
        function setupSearch() {
            const searchInput = document.getElementById('searchInput');
            let searchTimeout;
            
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    currentFilter = searchInput.value;
                    displayRepos(allReposData);
                }, 300);
            });
        }
        
        // 复制到剪贴板
        function copyToClipboard(text, message = '已复制到剪贴板') {
            navigator.clipboard.writeText(text).then(() => {
                showToast(message);
            }).catch(err => {
                showToast('复制失败', 'error');
            });
        }
        
        // 显示提示
        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.style.backgroundColor = type === 'error' ? '#c62828' : 
                                       type === 'info' ? '#0366d6' : '#2ea44f';
            toast.style.display = 'block';
            
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        }
        
        // 显示/隐藏加载状态
        function showLoading() {
            document.getElementById('loading').style.display = 'block';
        }
        
        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
        }
        
        function showError(message) {
            const errorEl = document.getElementById('error');
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
        
        function hideError() {
            document.getElementById('error').style.display = 'none';
        }
        
        function showEmptyState() {
            document.getElementById('emptyState').style.display = 'block';
        }
        
        function hideEmptyState() {
            document.getElementById('emptyState').style.display = 'none';
        }
        
        // 工具函数：格式化文件大小
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        // 工具函数：格式化日期
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
        
        // 工具函数：格式化时间
        function formatTime(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diff = Math.floor((now - date) / 1000);
            
            if (diff < 60) return '刚刚';
            if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
            if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
            return Math.floor(diff / 86400) + '天前';
        }
        
        // 点击模态框外部关闭
        window.onclick = function(event) {
            const modal = document.getElementById('historyModal');
            if (event.target === modal) {
                closeModal();
            }
        };
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                refreshData();
            }
        });
    </script>
</body>
</html>`;
}




// 生成 API 文档页面
export function generateApiDocsHTML(env) {
  const workerUrl = env.WORKER_URL || window.location.origin;
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub Releases 代理服务 - API 文档</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/languages/json.min.js"></script>
    <script>hljs.highlightAll();</script>
    <style>
        :root {
            --primary-color: #24292e;
            --secondary-color: #0366d6;
            --accent-color: #2ea44f;
            --bg-color: #f6f8fa;
            --card-bg: #ffffff;
            --border-color: #e1e4e8;
            --text-secondary: #586069;
            --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            --code-bg: #f6f8fa;
            --code-border: #e1e4e8;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--primary-color);
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
            position: relative;
        }
        
        .back-link {
            position: absolute;
            left: 0;
            top: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--secondary-color);
            text-decoration: none;
            font-weight: 500;
            padding: 8px 16px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background-color: var(--card-bg);
            transition: all 0.3s;
        }
        
        .back-link:hover {
            background-color: var(--bg-color);
            border-color: var(--secondary-color);
        }
        
        h1 {
            color: var(--primary-color);
            margin: 20px 0 10px;
            font-size: 2.5rem;
        }
        
        .subtitle {
            color: var(--text-secondary);
            font-size: 1.1rem;
        }
        
        .api-section {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            margin-bottom: 30px;
            overflow: hidden;
            box-shadow: var(--shadow);
        }
        
        .section-header {
            background-color: var(--bg-color);
            padding: 20px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .section-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.5rem;
            color: var(--primary-color);
        }
        
        .section-content {
            padding: 20px;
        }
        
        .endpoint {
            margin-bottom: 25px;
            padding-bottom: 25px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .endpoint:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .endpoint-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .method {
            padding: 6px 12px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
        }
        
        .method.get {
            background-color: #e7f5ff;
            color: #0366d6;
            border: 1px solid #0366d6;
        }
        
        .method.post {
            background-color: #e6fffa;
            color: #0a7c71;
            border: 1px solid #0a7c71;
        }
        
        .endpoint-path {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 16px;
            color: var(--primary-color);
        }
        
        .endpoint-description {
            margin-bottom: 15px;
            color: var(--text-secondary);
        }
        
        .parameters, .response {
            margin-top: 20px;
        }
        
        .section-title-small {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
            color: var(--primary-color);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .param-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        .param-table th,
        .param-table td {
            padding: 10px 12px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        
        .param-table th {
            background-color: var(--bg-color);
            font-weight: 600;
        }
        
        .param-name {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-weight: 600;
        }
        
        .param-type {
            color: var(--secondary-color);
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .param-required {
            color: var(--accent-color);
            font-weight: 600;
            font-size: 12px;
        }
        
        .param-optional {
            color: var(--text-secondary);
            font-size: 12px;
        }
        
        .code-block {
            background-color: var(--code-bg);
            border: 1px solid var(--code-border);
            border-radius: 6px;
            padding: 20px;
            margin: 15px 0;
            overflow-x: auto;
        }
        
        pre {
            margin: 0;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
        }
        
        .try-it {
            margin-top: 20px;
            padding: 15px;
            background-color: var(--bg-color);
            border-radius: 6px;
            border-left: 4px solid var(--secondary-color);
        }
        
        .try-it-title {
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn {
            background-color: var(--secondary-color);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: background-color 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 10px;
            text-decoration: none;
        }
        
        .btn:hover {
            background-color: #0256b9;
        }
        
        .btn-primary {
            background-color: var(--accent-color);
        }
        
        .btn-primary:hover {
            background-color: #2c974b;
        }
        
        .example-request {
            margin-top: 10px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            color: var(--text-secondary);
        }
        
        .token-info {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        
        .token-info h4 {
            color: #856404;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .status-online {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-offline {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-size: 14px;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 15px;
            }
            
            .endpoint-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
            
            .param-table th,
            .param-table td {
                padding: 8px 10px;
                font-size: 14px;
            }
            
            .code-block {
                padding: 15px;
            }
            
            pre {
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="/" class="back-link">
                <i class="fas fa-arrow-left"></i>
                返回主页
            </a>
            <h1><i class="fas fa-book"></i> API 文档</h1>
            <p class="subtitle">GitHub Releases 代理服务完整 API 参考文档</p>
        </div>
        
        <div class="api-section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-info-circle"></i> 服务概述</h2>
            </div>
            <div class="section-content">
                <p>GitHub Releases 代理服务提供了一组 RESTful API，用于访问和代理 GitHub Releases 数据。所有 API 均支持 CORS，可直接在前端调用。</p>
                
                <div class="token-info">
                    <h4><i class="fas fa-key"></i> Token 轮询说明</h4>
                    <p>本服务支持多个 GitHub Token 轮询使用。当一个 Token 达到速率限制或失效时，系统会自动切换到下一个可用的 Token。</p>
                    <p>Token 状态可通过 <code>/api/tokens/status</code> 端点查看。</p>
                </div>
                
                <div class="try-it">
                    <div class="try-it-title">
                        <i class="fas fa-bolt"></i>
                        快速测试 API 状态
                    </div>
                    <p>点击下方按钮测试 API 服务是否正常运行：</p>
                    <button class="btn" onclick="testApiStatus()">
                        <i class="fas fa-play"></i>
                        测试 API 状态
                    </button>
                    <div id="apiTestResult" style="margin-top: 10px;"></div>
                </div>
            </div>
        </div>
        
        <div class="api-section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-list"></i> 仓库列表 API</h2>
            </div>
            <div class="section-content">
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="endpoint-path">/api/repos</span>
                    </div>
                    <p class="endpoint-description">获取配置的仓库列表。数据从外部 URL 加载，支持动态更新。</p>
                    
                    <div class="parameters">
                        <h4 class="section-title-small"><i class="fas fa-cog"></i> 参数</h4>
                        <p>此端点不接受任何查询参数。</p>
                    </div>
                    
                    <div class="response">
                        <h4 class="section-title-small"><i class="fas fa-code"></i> 响应示例</h4>
                        <div class="code-block">
                            <pre><code class="language-json">{
  "success": true,
  "data": [
    {
      "owner": "microsoft",
      "repo": "vscode",
      "url": "https://github.com/microsoft/vscode"
    },
    {
      "owner": "vercel",
      "repo": "next.js",
      "url": "https://github.com/vercel/next.js"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}</code></pre>
                        </div>
                    </div>
                    
                    <div class="try-it">
                        <div class="try-it-title">
                            <i class="fas fa-terminal"></i>
                            尝试调用此 API
                        </div>
                        <button class="btn" onclick="testEndpoint('/api/repos')">
                            <i class="fas fa-play"></i>
                            调用 /api/repos
                        </button>
                        <div id="testResultRepos" style="margin-top: 10px;"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="api-section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-star"></i> 最新版本 API</h2>
            </div>
            <div class="section-content">
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="endpoint-path">/api/latest</span>
                    </div>
                    <p class="endpoint-description">获取所有仓库的最新版本信息，包括最新版本和历史版本。</p>
                    
                    <div class="parameters">
                        <h4 class="section-title-small"><i class="fas fa-cog"></i> 参数</h4>
                        <p>此端点不接受任何查询参数。</p>
                    </div>
                    
                    <div class="response">
                        <h4 class="section-title-small"><i class="fas fa-code"></i> 响应示例</h4>
                        <div class="code-block">
                            <pre><code class="language-json">{
  "success": true,
  "data": [
    {
      "repo": "microsoft/vscode",
      "url": "https://github.com/microsoft/vscode",
      "latest": {
        "tag_name": "1.85.0",
        "name": "January 2024 (version 1.85)",
        "published_at": "2024-01-10T10:30:00Z",
        "assets": [
          {
            "id": 12345678,
            "name": "VSCode-win32-x64-1.85.0.zip",
            "size": 102400000,
            "download_count": 15000,
            "proxy_url": "${workerUrl}/api/download?owner=microsoft&repo=vscode&assetId=12345678&filename=VSCode-win32-x64-1.85.0.zip"
          }
        ]
      },
      "history": [...],
      "totalReleases": 150
    }
  ],
  "tokenStats": {
    "totalTokens": 3,
    "currentIndex": 1,
    "tokens": ["ghp_abc12...", "ghp_def34...", "ghp_ghi56..."],
    "stats": {
      "ghp_abc12...": {
        "totalRequests": 50,
        "successfulRequests": 48,
        "failedRequests": 2,
        "lastUsed": "2024-01-15T10:25:00Z"
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}</code></pre>
                        </div>
                    </div>
                    
                    <div class="try-it">
                        <div class="try-it-title">
                            <i class="fas fa-terminal"></i>
                            尝试调用此 API
                        </div>
                        <button class="btn" onclick="testEndpoint('/api/latest')">
                            <i class="fas fa-play"></i>
                            调用 /api/latest
                        </button>
                        <div id="testResultLatest" style="margin-top: 10px;"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="api-section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-boxes"></i> 仓库详情 API</h2>
            </div>
            <div class="section-content">
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="endpoint-path">/api/all</span>
                    </div>
                    <p class="endpoint-description">获取指定仓库的所有发布版本。</p>
                    
                    <div class="parameters">
                        <h4 class="section-title-small"><i class="fas fa-cog"></i> 查询参数</h4>
                        <table class="param-table">
                            <thead>
                                <tr>
                                    <th>参数</th>
                                    <th>类型</th>
                                    <th>必需</th>
                                    <th>描述</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span class="param-name">owner</span></td>
                                    <td><span class="param-type">string</span></td>
                                    <td><span class="param-required">是</span></td>
                                    <td>仓库所有者（用户名或组织名）</td>
                                </tr>
                                <tr>
                                    <td><span class="param-name">repo</span></td>
                                    <td><span class="param-type">string</span></td>
                                    <td><span class="param-required">是</span></td>
                                    <td>仓库名称</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="response">
                        <h4 class="section-title-small"><i class="fas fa-code"></i> 响应示例</h4>
                        <div class="code-block">
                            <pre><code class="language-json">{
  "success": true,
  "data": {
    "repo": "microsoft/vscode",
    "releases": [
      {
        "id": 12345678,
        "tag_name": "1.85.0",
        "name": "January 2024 (version 1.85)",
        "published_at": "2024-01-10T10:30:00Z",
        "prerelease": false,
        "draft": false,
        "assets": [...]
      }
    ],
    "count": 150
  },
  "timestamp": "2024-01-15T10:30:00Z"
}</code></pre>
                        </div>
                    </div>
                    
                    <div class="try-it">
                        <div class="try-it-title">
                            <i class="fas fa-terminal"></i>
                            尝试调用此 API
                        </div>
                        <p class="example-request">示例请求：${workerUrl}/api/all?owner=microsoft&repo=vscode</p>
                        <button class="btn" onclick="testEndpoint('/api/all?owner=microsoft&repo=vscode')">
                            <i class="fas fa-play"></i>
                            调用 /api/all
                        </button>
                        <div id="testResultAll" style="margin-top: 10px;"></div>
                    </div>
                </div>
                
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="endpoint-path">/api/repo</span>
                    </div>
                    <p class="endpoint-description">获取指定仓库的详细信息，包括最新版本和最近历史版本。</p>
                    
                    <div class="parameters">
                        <h4 class="section-title-small"><i class="fas fa-cog"></i> 查询参数</h4>
                        <table class="param-table">
                            <thead>
                                <tr>
                                    <th>参数</th>
                                    <th>类型</th>
                                    <th>必需</th>
                                    <th>描述</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span class="param-name">owner</span></td>
                                    <td><span class="param-type">string</span></td>
                                    <td><span class="param-required">是</span></td>
                                    <td>仓库所有者（用户名或组织名）</td>
                                </tr>
                                <tr>
                                    <td><span class="param-name">repo</span></td>
                                    <td><span class="param-type">string</span></td>
                                    <td><span class="param-required">是</span></td>
                                    <td>仓库名称</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="try-it">
                        <div class="try-it-title">
                            <i class="fas fa-terminal"></i>
                            尝试调用此 API
                        </div>
                        <p class="example-request">示例请求：${workerUrl}/api/repo?owner=microsoft&repo=vscode</p>
                        <button class="btn" onclick="testEndpoint('/api/repo?owner=microsoft&repo=vscode')">
                            <i class="fas fa-play"></i>
                            调用 /api/repo
                        </button>
                        <div id="testResultRepo" style="margin-top: 10px;"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="api-section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-download"></i> 下载代理 API</h2>
            </div>
            <div class="section-content">
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="endpoint-path">/api/download</span>
                    </div>
                    <p class="endpoint-description">代理下载 GitHub Releases 资源文件。支持 Token 轮询，提高下载成功率。</p>
                    
                    <div class="parameters">
                        <h4 class="section-title-small"><i class="fas fa-cog"></i> 查询参数</h4>
                        <table class="param-table">
                            <thead>
                                <tr>
                                    <th>参数</th>
                                    <th>类型</th>
                                    <th>必需</th>
                                    <th>描述</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span class="param-name">owner</span></td>
                                    <td><span class="param-type">string</span></td>
                                    <td><span class="param-required">是</span></td>
                                    <td>仓库所有者</td>
                                </tr>
                                <tr>
                                    <td><span class="param-name">repo</span></td>
                                    <td><span class="param-type">string</span></td>
                                    <td><span class="param-required">是</span></td>
                                    <td>仓库名称</td>
                                </tr>
                                <tr>
                                    <td><span class="param-name">assetId</span></td>
                                    <td><span class="param-type">integer</span></td>
                                    <td><span class="param-required">是</span></td>
                                    <td>资源文件 ID</td>
                                </tr>
                                <tr>
                                    <td><span class="param-name">filename</span></td>
                                    <td><span class="param-type">string</span></td>
                                    <td><span class="param-required">是</span></td>
                                    <td>下载的文件名</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="response">
                        <h4 class="section-title-small"><i class="fas fa-code"></i> 响应</h4>
                        <p>直接返回文件流，HTTP 状态码为 200，Content-Type 为 application/octet-stream，并带有 Content-Disposition 头部。</p>
                    </div>
                    
                    <div class="try-it">
                        <div class="try-it-title">
                            <i class="fas fa-terminal"></i>
                            生成下载链接
                        </div>
                        <p>下载链接通常在其它 API 响应的 <code>proxy_url</code> 字段中提供。</p>
                        <div class="code-block">
                            <pre><code class="language-json">// 示例下载链接格式
"proxy_url": "${workerUrl}/api/download?owner=microsoft&repo=vscode&assetId=12345678&filename=VSCode-win32-x64-1.85.0.zip"</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="api-section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-tools"></i> 工具 API</h2>
            </div>
            <div class="section-content">
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="endpoint-path">/api/tokens/status</span>
                    </div>
                    <p class="endpoint-description">查看所有 GitHub Token 的使用状态和统计信息。</p>
                    
                    <div class="response">
                        <h4 class="section-title-small"><i class="fas fa-code"></i> 响应示例</h4>
                        <div class="code-block">
                            <pre><code class="language-json">{
  "success": true,
  "data": {
    "totalTokens": 3,
    "tokens": ["ghp_abc12...", "ghp_def34...", "ghp_ghi56..."],
    "stats": {
      "ghp_abc12...": {
        "totalRequests": 150,
        "successfulRequests": 148,
        "failedRequests": 2,
        "lastUsed": "2024-01-15T10:25:00Z",
        "lastError": null
      }
    },
    "currentIndex": 1
  },
  "timestamp": "2024-01-15T10:30:00Z"
}</code></pre>
                        </div>
                    </div>
                    
                    <div class="try-it">
                        <div class="try-it-title">
                            <i class="fas fa-terminal"></i>
                            尝试调用此 API
                        </div>
                        <button class="btn" onclick="testEndpoint('/api/tokens/status')">
                            <i class="fas fa-play"></i>
                            查看 Token 状态
                        </button>
                        <div id="testResultTokens" style="margin-top: 10px;"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>GitHub Releases Proxy API v1.0 • 更新时间: <span id="currentDate"></span></p>
            <p>本 API 支持 Token 轮询、速率限制处理和自动重试机制</p>
        </div>
    </div>
    
    <script>
        // 更新当前日期
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('zh-CN');
        
        // 测试 API 状态
        async function testApiStatus() {
            const resultEl = document.getElementById('apiTestResult');
            resultEl.innerHTML = '<span style="color: #0366d6;"><i class="fas fa-spinner fa-spin"></i> 测试中...</span>';
            
            try {
                const response = await fetch('/api/repos');
                const data = await response.json();
                
                if (data.success) {
                    resultEl.innerHTML = '<span class="status-indicator status-online"><i class="fas fa-check-circle"></i> API 服务正常</span>';
                    resultEl.innerHTML += '<div style="margin-top: 10px; font-size: 14px; color: #586069;">发现 ' + data.data.length + ' 个仓库</div>';
                } else {
                    resultEl.innerHTML = '<span class="status-indicator status-offline"><i class="fas fa-times-circle"></i> API 服务异常</span>';
                }
            } catch (error) {
                resultEl.innerHTML = '<span class="status-indicator status-offline"><i class="fas fa-times-circle"></i> 连接失败: ' + error.message + '</span>';
            }
        }
        
        // 测试特定端点
        async function testEndpoint(endpoint) {
            const resultId = 'testResult' + endpoint.replace(/[^a-zA-Z0-9]/g, '');
            let resultEl = document.getElementById(resultId);
            
            if (!resultEl) {
                resultEl = document.createElement('div');
                resultEl.id = resultId;
                resultEl.style.marginTop = '10px';
                
                // 找到最近的按钮并插入结果
                const button = event.target;
                button.parentNode.appendChild(resultEl);
            }
            
            resultEl.innerHTML = '<span style="color: #0366d6;"><i class="fas fa-spinner fa-spin"></i> 请求中...</span>';
            
            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                
                if (data.success) {
                    resultEl.innerHTML = '<span class="status-indicator status-online"><i class="fas fa-check-circle"></i> 请求成功</span>';
                    
                    // 显示简要信息
                    let info = '';
                    if (endpoint.includes('/api/repos')) {
                        info = '仓库数量: ' + data.data.length;
                    } else if (endpoint.includes('/api/latest')) {
                        info = '获取 ' + data.data.length + ' 个仓库的最新版本';
                    } else if (endpoint.includes('/api/all')) {
                        info = '获取 ' + data.data.repo + ' 的 ' + data.data.count + ' 个版本';
                    } else if (endpoint.includes('/api/tokens/status')) {
                        info = 'Token 数量: ' + data.data.totalTokens;
                    }
                    
                    if (info) {
                        resultEl.innerHTML += '<div style="margin-top: 5px; font-size: 14px; color: #586069;">' + info + '</div>';
                    }
                    
                    // 显示响应时间
                    if (data.timestamp) {
                        const timeDiff = new Date() - new Date(data.timestamp);
                        resultEl.innerHTML += '<div style="margin-top: 5px; font-size: 12px; color: #586069;">响应时间: ' + timeDiff + 'ms</div>';
                    }
                } else {
                    resultEl.innerHTML = '<span class="status-indicator status-offline"><i class="fas fa-times-circle"></i> 请求失败: ' + (data.error || '未知错误') + '</span>';
                }
            } catch (error) {
                resultEl.innerHTML = '<span class="status-indicator status-offline"><i class="fas fa-times-circle"></i> 连接失败: ' + error.message + '</span>';
            }
        }
        
        // 页面加载时自动测试 API 状态
        window.addEventListener('load', () => {
            setTimeout(testApiStatus, 1000);
        });
        
        // 语法高亮
        hljs.highlightAll();
    </script>
</body>
</html>`;
}
