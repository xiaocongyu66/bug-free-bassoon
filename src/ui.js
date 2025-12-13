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
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            padding-top: 0;
        }
        
        /* Header Styles */
        header {
            background: linear-gradient(135deg, var(--primary-color), #1a1e22);
            color: white;
            padding: 20px 30px;
            margin: 0 -20px 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .header-content {
            flex: 1;
        }
        
        h1 {
            font-size: 2.2rem;
            margin-bottom: 5px;
            font-weight: 600;
        }
        
        .subtitle {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1rem;
        }
        
        .actions {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .btn {
            background-color: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
        }
        
        .btn:hover {
            background-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
        
        .btn-primary {
            background-color: var(--accent-color);
            border-color: var(--accent-color);
        }
        
        .btn-primary:hover {
            background-color: #2c974b;
            border-color: #2c974b;
        }
        
        /* Main Layout */
        .main-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 25px;
            margin-bottom: 30px;
        }
        
        @media (min-width: 992px) {
            .main-grid {
                grid-template-columns: 2fr 1fr;
            }
        }
        
        /* Section Styles */
        section {
            background: var(--card-bg);
            border-radius: 10px;
            box-shadow: var(--shadow);
            overflow: hidden;
        }
        
        section > h2 {
            background: linear-gradient(to right, var(--secondary-color), #2ea44f);
            color: white;
            padding: 18px 25px;
            font-size: 1.4rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        section > h2 i {
            font-size: 1.2rem;
        }
        
        .section-content {
            padding: 25px;
        }
        
        /* Announcement Section */
        .announcement-content {
            padding: 25px;
        }
        
        .announcement-content p {
            margin-bottom: 15px;
            line-height: 1.6;
        }
        
        .announcement-content a {
            color: var(--secondary-color);
            text-decoration: none;
            font-weight: 500;
        }
        
        .announcement-content a:hover {
            text-decoration: underline;
        }
        
        /* Controls Section */
        .controls {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 25px;
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
            transition: border-color 0.3s, box-shadow 0.3s;
            background: var(--card-bg);
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
            gap: 25px;
            color: var(--text-secondary);
            font-size: 14px;
        }
        
        .stats-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        /* Repo List Section */
        #repoList {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .repo-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.3s;
        }
        
        .repo-card:hover {
            border-color: var(--secondary-color);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
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
            font-size: 1.1rem;
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
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .repo-url {
            color: var(--text-secondary);
            font-size: 14px;
            word-break: break-all;
        }
        
        /* 修复的 Repo Content 布局 - 右边高度完全跟随左边 */
        .repo-content {
            display: flex;
            gap: 20px;
            padding: 20px;
            align-items: stretch;
            position: relative;
        }
        
        @media (max-width: 768px) {
            .repo-content {
                flex-direction: column;
            }
            
            .latest-release {
                border-right: none;
                border-bottom: 1px solid var(--border-color);
                padding-right: 0;
                padding-bottom: 20px;
            }
        }
        
        .latest-release {
            flex: 2;
            border-right: 1px solid var(--border-color);
            padding-right: 20px;
            display: flex;
            flex-direction: column;
            min-height: 0;
        }
        
        .release-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 15px;
            color: var(--primary-color);
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
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
            font-size: 13px;
            margin-bottom: 20px;
            display: flex;
            gap: 15px;
            flex-shrink: 0;
        }
        
        .assets-list {
            flex: 1;
            overflow-y: auto;
            min-height: 0;
            max-height: 400px; /* 限制最大高度 */
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
            font-size: 14px;
        }
        
        .asset-size {
            color: var(--text-secondary);
            font-size: 11px;
        }
        
        .asset-actions {
            display: flex;
            gap: 8px;
        }
        
        .btn-small {
            padding: 6px 12px;
            font-size: 12px;
            border-radius: 4px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        
        .btn-download {
            background-color: var(--accent-color);
            color: white;
            border: none;
            text-decoration: none;
        }
        
        .btn-download:hover {
            background-color: #2c974b;
            color: white;
        }
        
        .history-section {
            flex: 1;
            padding: 15px;
            background-color: #fafbfc;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 0;
        }

        .history-title {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 15px;
            color: var(--primary-color);
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
        }

        .history-list {
            flex: 1;
            overflow-y: auto;
            min-height: 0;
            max-height: 400px; /* 限制最大高度 */
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
            font-size: 13px;
        }
        
        .history-date {
            color: var(--text-secondary);
            font-size: 11px;
        }
        
        /* 简化的 Statistics Section */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .stat-card {
            background: white;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .stat-icon {
            font-size: 2.5rem;
            color: var(--secondary-color);
            margin-bottom: 15px;
        }
        
        .stat-card h3 {
            font-size: 1rem;
            color: var(--text-secondary);
            margin-bottom: 10px;
        }
        
        .stat-value {
            font-size: 2.2rem;
            font-weight: 700;
            color: var(--primary-color);
            line-height: 1;
        }
        
        /* Loading States */
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
        
        /* Footer */
        footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-size: 14px;
        }
        
        footer p {
            margin-bottom: 10px;
        }
        
        footer a {
            color: var(--secondary-color);
            text-decoration: none;
        }
        
        footer a:hover {
            text-decoration: underline;
        }
        
        /* Modal */
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
            padding: 20px;
        }
        
        .modal-content {
            background-color: white;
            border-radius: 10px;
            width: 100%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
            padding: 20px 25px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(to right, var(--secondary-color), #2ea44f);
            color: white;
        }
        
        .modal-title {
            font-size: 1.2rem;
            font-weight: 600;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: white;
            opacity: 0.8;
            transition: opacity 0.3s;
            line-height: 1;
        }
        
        .modal-close:hover {
            opacity: 1;
        }
        
        .modal-body {
            padding: 25px;
        }
        
        /* Toast */
        .toast {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background-color: var(--accent-color);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            display: none;
            z-index: 1001;
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
        
        /* 简化右侧面板 */
        .simple-stats {
            margin-top: 20px;
        }
        
        .simple-stats-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .simple-stats-item:last-child {
            border-bottom: none;
        }
        
        .simple-stats-label {
            color: var(--text-secondary);
            font-size: 14px;
        }
        
        .simple-stats-value {
            font-weight: 600;
            color: var(--primary-color);
            font-size: 15px;
        }
        
        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #ccc;
        }
        
        .status-dot.online {
            background-color: #2ea44f;
        }
        
        .status-dot.offline {
            background-color: #c62828;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="header-content">
                <h1><i class="fas fa-code-branch"></i> GitHub Releases 代理服务</h1>
                <p class="subtitle">快速、稳定地访问 GitHub Releases，支持代理下载和历史版本查看</p>
            </div>
            <div class="actions">
                <a href="/api-docs" target="_blank" class="btn">
                    <i class="fas fa-book"></i> API 文档
                </a>
                <button class="btn btn-primary" onclick="refreshData()">
                    <i class="fas fa-sync-alt"></i> 手动刷新
                </button>
            </div>
        </header>
        
        <div class="main-grid">
            <div class="left-column">
                <section>
                    <h2><i class="fas fa-bell"></i> 公告</h2>
                    <div class="announcement-content">
                        <p><strong>服务说明：</strong>本服务提供 GitHub Releases 的代理访问和下载，解决国内访问 GitHub 缓慢的问题。</p>
                        <p><strong>使用方法：</strong>直接点击文件下载按钮即可通过代理下载，支持断点续传。</p>
                        <p><strong>数据更新：</strong>数据每 5 分钟自动刷新，也可以点击"手动刷新"按钮立即更新。</p>
                        <p><strong>支持仓库：</strong>需要在配置文件中添加 GitHub 仓库地址。</p>
                    </div>
                </section>
                
                <section>
                    <h2><i class="fas fa-tag"></i> 版本信息</h2>
                    <div class="section-content">
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
                        </div>
                        
                        <div id="loading" class="loading">
                            <div class="loading-spinner"></div>
                            <p>正在加载 GitHub Releases 数据...</p>
                        </div>
                        
                        <div id="error" class="error" style="display: none;"></div>
                        
                        <div id="repoList" style="display: none;"></div>
                        
                        <div id="emptyState" class="empty-state" style="display: none;">
                            <i class="fas fa-inbox"></i>
                            <h3>没有找到仓库数据</h3>
                            <p>请检查仓库列表配置或网络连接</p>
                        </div>
                    </div>
                </section>
            </div>
            
            <div class="right-column">
                <section>
                    <h2><i class="fas fa-chart-line"></i> 数据统计</h2>
                    <div class="section-content">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="fas fa-database"></i>
                                </div>
                                <h3>仓库总数</h3>
                                <div class="stat-value" id="totalRepos">-</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="fas fa-tags"></i>
                                </div>
                                <h3>版本总数</h3>
                                <div class="stat-value" id="totalReleases">-</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="fas fa-file-archive"></i>
                                </div>
                                <h3>文件总数</h3>
                                <div class="stat-value" id="totalAssets">-</div>
                            </div>
                        </div>
                        
                        <div class="simple-stats">
                            <div class="simple-stats-item">
                                <span class="simple-stats-label">热门仓库</span>
                                <span class="simple-stats-value" id="topRepoName">-</span>
                            </div>
                            <div class="simple-stats-item">
                                <span class="simple-stats-label">最近更新</span>
                                <span class="simple-stats-value" id="lastRepoUpdate">-</span>
                            </div>
                            <div class="simple-stats-item">
                                <span class="simple-stats-label">平均版本数</span>
                                <span class="simple-stats-value" id="avgReleases">-</span>
                            </div>
                            <div class="simple-stats-item">
                                <span class="simple-stats-label">服务状态</span>
                                <span class="status-indicator">
                                    <span class="status-dot" id="statusDot"></span>
                                    <span id="apiStatusText">检查中...</span>
                                </span>
                            </div>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-size: 13px; color: var(--text-secondary);">
                            <p style="margin-bottom: 10px;"><strong>统计说明：</strong></p>
                            <p>• 统计基于当前加载的仓库数据</p>
                            <p>• 点击"手动刷新"更新数据</p>
                            <p>• 所有下载通过代理进行</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
        
        <footer>
            <p>GitHub Releases Proxy Service v1.0</p>
            <p>数据来源：<span id="repoSource">GitHub API</span> • 部署于 Cloudflare Workers</p>
        </footer>
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
                    updateSimpleStatistics(data);
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
            repoListEl.style.display = 'block';
            
            let html = '';
            
            filteredRepos.forEach(repo => {
                html += generateRepoCard(repo);
            });
            
            repoListEl.innerHTML = html;
            
            // 动态调整历史版本高度
            setTimeout(() => adjustHistoryHeights(), 100);
        }
        
        // 调整历史版本高度
        function adjustHistoryHeights() {
            document.querySelectorAll('.repo-card').forEach(card => {
                const assetsList = card.querySelector('.assets-list');
                const historyList = card.querySelector('.history-list');
                
                if (assetsList && historyList) {
                    // 获取左边构建包的实际高度
                    const assetsHeight = assetsList.scrollHeight;
                    // 设置右边历史版本的最大高度与左边相同
                    historyList.style.maxHeight = assetsHeight + 'px';
                }
            });
        }
        
        // 生成仓库卡片
        function generateRepoCard(repo) {
            if (repo.error) {
                return \`
                <div class="repo-card" style="margin-bottom: 20px;">
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
                            <a href="\${asset.proxy_url}" class="btn-small btn-download" download>
                                <i class="fas fa-download"></i> 下载
                            </a>
                            <button class="btn-small copy-btn" onclick="copyToClipboard('\${asset.proxy_url}', '下载链接已复制')">
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
            <div class="repo-card" style="margin-bottom: 20px;">
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
                        \` : '<div style="color: var(--text-secondary); text-align: center; padding: 20px; flex: 1;">无发布版本</div>'}
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
        
        // 更新简化统计数据
        function updateSimpleStatistics(data) {
            const reposWithData = data.data.filter(repo => !repo.error);
            
            if (reposWithData.length === 0) return;
            
            // 基础统计
            const totalRepos = reposWithData.length;
            const totalReleases = reposWithData.reduce((sum, repo) => sum + (repo.totalReleases || 0), 0);
            const totalAssets = reposWithData.reduce((sum, repo) => 
                sum + (repo.latest && repo.latest.assets ? repo.latest.assets.length : 0), 0);
            
            document.getElementById('totalRepos').textContent = totalRepos;
            document.getElementById('totalReleases').textContent = totalReleases;
            document.getElementById('totalAssets').textContent = totalAssets;
            
            // 热门仓库（按版本数排序）
            const topRepo = [...reposWithData]
                .sort((a, b) => (b.totalReleases || 0) - (a.totalReleases || 0))[0];
            
            if (topRepo) {
                document.getElementById('topRepoName').textContent = \`\${topRepo.repo} (\${topRepo.totalReleases || 0})\`;
            }
            
            // 最近更新
            const lastUpdatedRepo = [...reposWithData]
                .filter(repo => repo.latest && repo.latest.published_at)
                .sort((a, b) => new Date(b.latest.published_at) - new Date(a.latest.published_at))[0];
            
            if (lastUpdatedRepo && lastUpdatedRepo.latest) {
                const timeAgo = formatTime(lastUpdatedRepo.latest.published_at);
                document.getElementById('lastRepoUpdate').textContent = \`\${lastUpdatedRepo.repo} • \${timeAgo}\`;
            }
            
            // 平均版本数
            const avgReleases = Math.round(totalReleases / totalRepos);
            document.getElementById('avgReleases').textContent = avgReleases;
        }
        
        // 保持原有的其他函数...
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
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <thead>
                            <tr style="background-color: var(--bg-color);">
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color);">文件名</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color);">大小</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color);">下载次数</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color);">操作</th>
                            </tr>
                        </thead>
                        <tbody>\`;
                
                release.assets.forEach(asset => {
                    const size = formatFileSize(asset.size);
                    assetsHTML += \`
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid var(--border-color);">
                            <i class="fas fa-file-archive"></i>
                            \${asset.name}
                        </td>
                        <td style="padding: 12px; border-bottom: 1px solid var(--border-color);">\${size}</td>
                        <td style="padding: 12px; border-bottom: 1px solid var(--border-color);">\${asset.download_count || 0}</td>
                        <td style="padding: 12px; border-bottom: 1px solid var(--border-color);">
                            <a href="\${asset.proxy_url}" class="btn-small btn-download" download style="margin-right: 5px;">
                                <i class="fas fa-download"></i> 下载
                            </a>
                            <button class="btn-small copy-btn" onclick="copyToClipboard('\${asset.proxy_url}')">
                                <i class="fas fa-copy"></i>
                            </button>
                        </td>
                    </tr>\`;
                });
                
                assetsHTML += '</tbody></table></div>';
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
                        <button class="btn-small" onclick="showHistoryDetails('\${repoFullName}', '\${release.tag_name}')" style="background: var(--secondary-color); color: white; border: none;">
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
            
            document.getElementById('repoCount').innerHTML = \`
                <i class="fas fa-box"></i>
                <span>\${reposWithData.length} 个仓库</span>
            \`;
            
            document.getElementById('releaseCount').innerHTML = \`
                <i class="fas fa-tag"></i>
                <span>\${totalReleases} 个版本</span>
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
                
                const statusDot = document.getElementById('statusDot');
                const statusText = document.getElementById('apiStatusText');
                
                if (data.success) {
                    statusDot.className = 'status-dot online';
                    statusText.textContent = '运行正常';
                    statusText.style.color = '#2ea44f';
                } else {
                    statusDot.className = 'status-dot offline';
                    statusText.textContent = '运行异常';
                    statusText.style.color = '#c62828';
                }
            } catch (error) {
                const statusDot = document.getElementById('statusDot');
                const statusText = document.getElementById('apiStatusText');
                statusDot.className = 'status-dot offline';
                statusText.textContent = '连接失败';
                statusText.style.color = '#c62828';
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
            document.getElementById('repoList').style.display = 'none';
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
            document.getElementById('repoList').style.display = 'none';
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
            if (!dateString) return '未知';
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
        
        // 窗口大小变化时重新调整高度
        window.addEventListener('resize', () => {
            setTimeout(() => adjustHistoryHeights(), 100);
        });
    </script>
</body>
</html>`;
}

// 生成 API 文档页面
export function generateAPIDocsHTML(env) {
  const workerUrl = env.WORKER_URL || '';
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub Releases Proxy - API 文档</title>
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
        
        header {
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
            margin-bottom: 20px;
        }
        
        .back-link {
            display: inline-block;
            color: var(--secondary-color);
            text-decoration: none;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        .back-link:hover {
            text-decoration: underline;
        }
        
        .api-overview {
            background: var(--card-bg);
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: var(--shadow);
        }
        
        .overview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .overview-item {
            text-align: center;
            padding: 20px;
            background: var(--bg-color);
            border-radius: 6px;
            border: 1px solid var(--border-color);
        }
        
        .overview-icon {
            font-size: 2rem;
            color: var(--secondary-color);
            margin-bottom: 10px;
        }
        
        .overview-count {
            font-size: 2rem;
            font-weight: bold;
            color: var(--accent-color);
        }
        
        .api-section {
            background: var(--card-bg);
            border-radius: 8px;
            margin-bottom: 30px;
            overflow: hidden;
            box-shadow: var(--shadow);
        }
        
        .section-header {
            background: linear-gradient(to right, var(--secondary-color), #2ea44f);
            color: white;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .section-icon {
            font-size: 1.5rem;
        }
        
        .section-title {
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .endpoint-list {
            padding: 20px;
        }
        
        .endpoint-item {
            margin-bottom: 25px;
            padding-bottom: 25px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .endpoint-item:last-child {
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
        
        .method-badge {
            padding: 6px 12px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 14px;
            color: white;
        }
        
        .method-get {
            background-color: #2ea44f;
        }
        
        .method-post {
            background-color: #0366d6;
        }
        
        .method-put {
            background-color: #e36209;
        }
        
        .method-delete {
            background-color: #d73a49;
        }
        
        .endpoint-path {
            font-family: monospace;
            font-size: 1.1rem;
            background: var(--code-bg);
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid var(--code-border);
            flex: 1;
        }
        
        .endpoint-description {
            margin-bottom: 20px;
            color: var(--text-secondary);
            line-height: 1.7;
        }
        
        .param-section {
            margin-bottom: 20px;
        }
        
        .param-title {
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
            font-size: 14px;
        }
        
        .param-table th,
        .param-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        
        .param-table th {
            background-color: var(--bg-color);
            font-weight: 600;
            color: var(--text-secondary);
        }
        
        .param-table td {
            font-family: monospace;
        }
        
        .param-required {
            color: #d73a49;
            font-weight: 600;
        }
        
        .param-optional {
            color: var(--accent-color);
        }
        
        .code-block {
            background: var(--code-bg);
            border: 1px solid var(--code-border);
            border-radius: 6px;
            overflow: hidden;
            margin: 15px 0;
        }
        
        .code-header {
            background: var(--border-color);
            padding: 10px 15px;
            font-weight: 600;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .copy-btn {
            background: none;
            border: none;
            color: var(--secondary-color);
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .copy-btn:hover {
            text-decoration: underline;
        }
        
        .code-content {
            padding: 20px;
            overflow-x: auto;
        }
        
        pre {
            margin: 0;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .response-section {
            margin-top: 20px;
        }
        
        .response-title {
            font-weight: 600;
            margin-bottom: 10px;
            color: var(--primary-color);
        }
        
        .response-example {
            margin-bottom: 10px;
        }
        
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-size: 14px;
        }
        
        .api-status {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
            justify-content: center;
        }
        
        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 5px;
        }
        
        .status-up {
            background-color: var(--accent-color);
        }
        
        .status-down {
            background-color: #d73a49;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 15px;
            }
            
            .overview-grid {
                grid-template-columns: 1fr;
            }
            
            .endpoint-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
            
            .endpoint-path {
                width: 100%;
            }
            
            .param-table {
                display: block;
                overflow-x: auto;
            }
        }
        
        .note {
            background: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .note-title {
            font-weight: 600;
            margin-bottom: 5px;
            color: #e36209;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .rate-limit {
            background: #e3f2fd;
            border-left: 4px solid var(--secondary-color);
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .quick-links {
            display: flex;
            gap: 15px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        
        .quick-link {
            display: inline-block;
            padding: 10px 20px;
            background: var(--secondary-color);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background-color 0.3s;
        }
        
        .quick-link:hover {
            background-color: #0256b9;
        }
        
        .curl-example {
            background: #263238;
            color: #eceff1;
            border-radius: 6px;
            overflow: hidden;
            margin: 15px 0;
        }
        
        .curl-header {
            background: #37474f;
            padding: 10px 15px;
            font-family: monospace;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .curl-content {
            padding: 20px;
            overflow-x: auto;
        }
        
        .try-it-btn {
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 10px;
        }
        
        .try-it-btn:hover {
            background-color: #2c974b;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <a href="/" class="back-link">
                <i class="fas fa-arrow-left"></i> 返回首页
            </a>
            <h1><i class="fas fa-code"></i> GitHub Releases Proxy API 文档</h1>
            <p class="subtitle">为 GitHub Releases 提供的 RESTful API 接口，支持代理下载和版本信息查询</p>
            
            <div class="quick-links">
                <a href="#repos" class="quick-link">
                    <i class="fas fa-list"></i> 仓库列表
                </a>
                <a href="#releases" class="quick-link">
                    <i class="fas fa-tag"></i> 版本信息
                </a>
                <a href="#download" class="quick-link">
                    <i class="fas fa-download"></i> 代理下载
                </a>
                <a href="#examples" class="quick-link">
                    <i class="fas fa-code"></i> 使用示例
                </a>
            </div>
        </header>
        
        <div class="api-overview">
            <h2><i class="fas fa-info-circle"></i> API 概览</h2>
            <p>所有 API 端点都基于当前部署的 Worker URL：<code>${workerUrl}</code></p>
            
            <div class="note">
                <div class="note-title">
                    <i class="fas fa-lightbulb"></i>
                    重要提示
                </div>
                <p>所有 API 请求都支持 CORS，可以直接在前端 JavaScript 中调用。数据默认缓存 5 分钟以提高性能。</p>
            </div>
            
            <div class="overview-grid">
                <div class="overview-item">
                    <div class="overview-icon">
                        <i class="fas fa-sitemap"></i>
                    </div>
                    <div class="overview-count">5</div>
                    <p>个主要端点</p>
                </div>
                <div class="overview-item">
                    <div class="overview-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    <div class="overview-count">100%</div>
                    <p>支持 CORS</p>
                </div>
                <div class="overview-item">
                    <div class="overview-icon">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <div class="overview-count">300s</div>
                    <p>缓存时间</p>
                </div>
            </div>
        </div>
        
        <!-- 仓库列表 API -->
        <div class="api-section" id="repos">
            <div class="section-header">
                <i class="fas fa-list section-icon"></i>
                <h3 class="section-title">仓库列表 API</h3>
            </div>
            <div class="endpoint-list">
                <div class="endpoint-item">
                    <div class="endpoint-header">
                        <span class="method-badge method-get">GET</span>
                        <code class="endpoint-path">/api/repos</code>
                    </div>
                    
                    <div class="endpoint-description">
                        获取配置的 GitHub 仓库列表。仓库列表从 <code>REPO_LIST_URL</code> 环境变量指定的 URL 加载。
                    </div>
                    
                    <div class="response-section">
                        <div class="response-title">响应示例</div>
                        <div class="code-block">
                            <div class="code-header">
                                <span>JSON Response</span>
                                <button class="copy-btn" onclick="copyCode(this)">
                                    <i class="fas fa-copy"></i> 复制
                                </button>
                            </div>
                            <div class="code-content">
                                <pre><code>{
  "success": true,
  "data": [
    {
      "owner": "owner1",
      "repo": "repo1",
      "url": "https://github.com/owner1/repo1"
    },
    {
      "owner": "owner2",
      "repo": "repo2",
      "url": "https://github.com/owner2/repo2"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}</code></pre>
                            </div>
                        </div>
                        
                        <button class="try-it-btn" onclick="testEndpoint('/api/repos')">
                            <i class="fas fa-play"></i> 测试此端点
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 版本信息 API -->
        <div class="api-section" id="releases">
            <div class="section-header">
                <i class="fas fa-tag section-icon"></i>
                <h3 class="section-title">版本信息 API</h3>
            </div>
            <div class="endpoint-list">
                
                <!-- 获取最新版本 -->
                <div class="endpoint-item">
                    <div class="endpoint-header">
                        <span class="method-badge method-get">GET</span>
                        <code class="endpoint-path">/api/latest</code>
                    </div>
                    
                    <div class="endpoint-description">
                        获取所有仓库的最新版本信息。返回每个仓库的最新版本和前 5 个历史版本。
                    </div>
                    
                    <div class="response-section">
                        <div class="response-title">响应示例</div>
                        <div class="code-block">
                            <div class="code-header">
                                <span>JSON Response</span>
                                <button class="copy-btn" onclick="copyCode(this)">
                                    <i class="fas fa-copy"></i> 复制
                                </button>
                            </div>
                            <div class="code-content">
                                <pre><code>{
  "success": true,
  "data": [
    {
      "repo": "owner/repo",
      "url": "https://github.com/owner/repo",
      "latest": {
        "tag_name": "v1.0.0",
        "name": "Release 1.0.0",
        "assets": [...],
        "published_at": "2024-01-01T00:00:00Z"
      },
      "history": [...],
      "totalReleases": 10
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}</code></pre>
                            </div>
                        </div>
                        
                        <button class="try-it-btn" onclick="testEndpoint('/api/latest')">
                            <i class="fas fa-play"></i> 测试此端点
                        </button>
                    </div>
                </div>
                
                <!-- 获取所有版本 -->
                <div class="endpoint-item">
                    <div class="endpoint-header">
                        <span class="method-badge method-get">GET</span>
                        <code class="endpoint-path">/api/all</code>
                    </div>
                    
                    <div class="endpoint-description">
                        获取指定仓库的所有版本信息。
                    </div>
                    
                    <div class="param-section">
                        <div class="param-title">
                            <i class="fas fa-sliders-h"></i>
                            查询参数
                        </div>
                        <table class="param-table">
                            <thead>
                                <tr>
                                    <th>参数</th>
                                    <th>类型</th>
                                    <th>必填</th>
                                    <th>描述</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>owner</td>
                                    <td>string</td>
                                    <td><span class="param-required">是</span></td>
                                    <td>仓库拥有者</td>
                                </tr>
                                <tr>
                                    <td>repo</td>
                                    <td>string</td>
                                    <td><span class="param-required">是</span></td>
                                    <td>仓库名称</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="response-section">
                        <div class="response-title">响应示例</div>
                        <div class="code-block">
                            <div class="code-header">
                                <span>JSON Response</span>
                                <button class="copy-btn" onclick="copyCode(this)">
                                    <i class="fas fa-copy"></i> 复制
                                </button>
                            </div>
                            <div class="code-content">
                                <pre><code>{
  "success": true,
  "data": {
    "repo": "owner/repo",
    "releases": [
      {
        "tag_name": "v1.0.0",
        "name": "Release 1.0.0",
        "assets": [...],
        "published_at": "2024-01-01T00:00:00Z"
      }
    ],
    "count": 10
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}</code></pre>
                            </div>
                        </div>
                        
                        <div class="curl-example">
                            <div class="curl-header">
                                <span>cURL 示例</span>
                                <button class="copy-btn" onclick="copyCode(this)">
                                    <i class="fas fa-copy"></i> 复制
                                </button>
                            </div>
                            <div class="curl-content">
                                <pre style="color: #eceff1;">curl "${workerUrl}/api/all?owner=github&repo=desktop"</pre>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 获取仓库详情 -->
                <div class="endpoint-item">
                    <div class="endpoint-header">
                        <span class="method-badge method-get">GET</span>
                        <code class="endpoint-path">/api/repo</code>
                    </div>
                    
                    <div class="endpoint-description">
                        获取指定仓库的详细信息，包括最新版本和最近 10 个历史版本。
                    </div>
                    
                    <div class="param-section">
                        <div class="param-title">
                            <i class="fas fa-sliders-h"></i>
                            查询参数
                        </div>
                        <table class="param-table">
                            <thead>
                                <tr>
                                    <th>参数</th>
                                    <th>类型</th>
                                    <th>必填</th>
                                    <th>描述</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>owner</td>
                                    <td>string</td>
                                    <td><span class="param-required">是</span></td>
                                    <td>仓库拥有者</td>
                                </tr>
                                <tr>
                                    <td>repo</td>
                                    <td>string</td>
                                    <td><span class="param-required">是</span></td>
                                    <td>仓库名称</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="response-section">
                        <div class="response-title">响应示例</div>
                        <div class="code-block">
                            <div class="code-header">
                                <span>JSON Response</span>
                                <button class="copy-btn" onclick="copyCode(this)">
                                    <i class="fas fa-copy"></i> 复制
                                </button>
                            </div>
                            <div class="code-content">
                                <pre><code>{
  "success": true,
  "data": {
    "repo": "owner/repo",
    "latest": {
      "tag_name": "v1.0.0",
      "name": "Release 1.0.0",
      "assets": [...],
      "published_at": "2024-01-01T00:00:00Z"
    },
    "history": [...],
    "total": 15
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}</code></pre>
                            </div>
                        </div>
                        
                        <button class="try-it-btn" onclick="testEndpoint('/api/repo?owner=github&repo=desktop')">
                            <i class="fas fa-play"></i> 测试此端点
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 代理下载 API -->
        <div class="api-section" id="download">
            <div class="section-header">
                <i class="fas fa-download section-icon"></i>
                <h3 class="section-title">代理下载 API</h3>
            </div>
            <div class="endpoint-list">
                <div class="endpoint-item">
                    <div class="endpoint-header">
                        <span class="method-badge method-get">GET</span>
                        <code class="endpoint-path">/api/download</code>
                    </div>
                    
                    <div class="endpoint-description">
                        代理下载 GitHub Releases 中的资源文件。支持大文件下载和断点续传。
                    </div>
                    
                    <div class="rate-limit">
                        <div class="note-title">
                            <i class="fas fa-tachometer-alt"></i>
                            速率限制
                        </div>
                        <p>下载端点使用流式传输，不限制文件大小。但是请注意 GitHub API 的速率限制（每小时 60 次请求）。</p>
                    </div>
                    
                    <div class="param-section">
                        <div class="param-title">
                            <i class="fas fa-sliders-h"></i>
                            查询参数
                        </div>
                        <table class="param-table">
                            <thead>
                                <tr>
                                    <th>参数</th>
                                    <th>类型</th>
                                    <th>必填</th>
                                    <th>描述</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>owner</td>
                                    <td>string</td>
                                    <td><span class="param-required">是</span></td>
                                    <td>仓库拥有者</td>
                                </tr>
                                <tr>
                                    <td>repo</td>
                                    <td>string</td>
                                    <td><span class="param-required">是</span></td>
                                    <td>仓库名称</td>
                                </tr>
                                <tr>
                                    <td>assetId</td>
                                    <td>number</td>
                                    <td><span class="param-required">是</span></td>
                                    <td>资源文件 ID</td>
                                </tr>
                                <tr>
                                    <td>filename</td>
                                    <td>string</td>
                                    <td><span class="param-required">是</span></td>
                                    <td>下载的文件名</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="response-section">
                        <div class="response-title">响应头信息</div>
                        <div class="code-block">
                            <div class="code-header">
                                <span>HTTP Headers</span>
                                <button class="copy-btn" onclick="copyCode(this)">
                                    <i class="fas fa-copy"></i> 复制
                                </button>
                            </div>
                            <div class="code-content">
                                <pre><code>Content-Type: application/octet-stream
Content-Disposition: attachment; filename="example.zip"
Cache-Control: public, max-age=86400</code></pre>
                            </div>
                        </div>
                        
                        <div class="curl-example">
                            <div class="curl-header">
                                <span>cURL 示例</span>
                                <button class="copy-btn" onclick="copyCode(this)">
                                    <i class="fas fa-copy"></i> 复制
                                </button>
                            </div>
                            <div class="curl-content">
                                <pre style="color: #eceff1;">curl -L -o "download.zip" \\
  "${workerUrl}/api/download?owner=github&repo=desktop&assetId=123456&filename=desktop.zip"</pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 缓存管理 API -->
        <div class="api-section">
            <div class="section-header">
                <i class="fas fa-sync-alt section-icon"></i>
                <h3 class="section-title">缓存管理 API</h3>
            </div>
            <div class="endpoint-list">
                <div class="endpoint-item">
                    <div class="endpoint-header">
                        <span class="method-badge method-get">GET</span>
                        <code class="endpoint-path">/api/refresh</code>
                    </div>
                    
                    <div class="endpoint-description">
                        刷新缓存端点。注意：这不会立即清除 Cloudflare 的 CDN 缓存，但会返回一个新的时间戳。
                    </div>
                    
                    <div class="response-section">
                        <div class="response-title">响应示例</div>
                        <div class="code-block">
                            <div class="code-header">
                                <span>JSON Response</span>
                                <button class="copy-btn" onclick="copyCode(this)">
                                    <i class="fas fa-copy"></i> 复制
                                </button>
                            </div>
                            <div class="code-content">
                                <pre><code>{
  "success": true,
  "message": "Cache refresh endpoint",
  "timestamp": "2024-01-01T00:00:00.000Z"
}</code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 使用示例 -->
        <div class="api-section" id="examples">
            <div class="section-header">
                <i class="fas fa-code section-icon"></i>
                <h3 class="section-title">使用示例</h3>
            </div>
            <div class="endpoint-list">
                
                <div class="endpoint-item">
                    <h4>JavaScript 示例</h4>
                    
                    <div class="code-block">
                        <div class="code-header">
                            <span>获取所有仓库的最新版本</span>
                            <button class="copy-btn" onclick="copyCode(this)">
                                <i class="fas fa-copy"></i> 复制
                            </button>
                        </div>
                        <div class="code-content">
                            <pre><code>async function getLatestReleases() {
  const response = await fetch('${workerUrl}/api/latest');
  const data = await response.json();
  
  if (data.success) {
    data.data.forEach(repo => {
      console.log(\`\${repo.repo}: \${repo.latest?.tag_name}\`);
    });
  }
}</code></pre>
                        </div>
                    </div>
                    
                    <div class="code-block" style="margin-top: 15px;">
                        <div class="code-header">
                            <span>获取特定仓库的版本</span>
                            <button class="copy-btn" onclick="copyCode(this)">
                                <i class="fas fa-copy"></i> 复制
                            </button>
                        </div>
                        <div class="code-content">
                            <pre><code>async function getRepoReleases(owner, repo) {
  const response = await fetch(
    \`${workerUrl}/api/all?owner=\${owner}&repo=\${repo}\`
  );
  const data = await response.json();
  
  if (data.success) {
    console.log(\`Found \${data.data.count} releases\`);
    data.data.releases.forEach(release => {
      console.log(\`- \${release.tag_name} (\${release.name})\`);
    });
  }
}</code></pre>
                        </div>
                    </div>
                </div>
                
                <div class="endpoint-item">
                    <h4>Python 示例</h4>
                    
                    <div class="code-block">
                        <div class="code-header">
                            <span>Python 请求示例</span>
                            <button class="copy-btn" onclick="copyCode(this)">
                                <i class="fas fa-copy"></i> 复制
                            </button>
                        </div>
                        <div class="code-content">
                            <pre><code>import requests
import json

# 获取仓库列表
response = requests.get('${workerUrl}/api/repos')
data = response.json()

if data['success']:
    for repo in data['data']:
        print(f"{repo['owner']}/{repo['repo']}")

# 下载文件
def download_file(owner, repo, asset_id, filename):
    url = f"${workerUrl}/api/download"
    params = {
        'owner': owner,
        'repo': repo,
        'assetId': asset_id,
        'filename': filename
    }
    
    response = requests.get(url, params=params, stream=True)
    with open(filename, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    print(f"Downloaded {filename}")</code></pre>
                        </div>
                    </div>
                </div>
                
                <div class="endpoint-item">
                    <h4>Shell 脚本示例</h4>
                    
                    <div class="code-block">
                        <div class="code-header">
                            <span>Bash 脚本</span>
                            <button class="copy-btn" onclick="copyCode(this)">
                                <i class="fas fa-copy"></i> 复制
                            </button>
                        </div>
                        <div class="code-content">
                            <pre><code>#!/bin/bash

# 获取所有仓库信息
get_latest_releases() {
    curl -s "${workerUrl}/api/latest" | jq '.data[] | .repo'
}

# 获取特定仓库的最新版本
get_repo_latest() {
    local owner=$1
    local repo=$2
    
    curl -s "${workerUrl}/api/repo?owner=$owner&repo=$repo" | \
    jq '.data.latest.tag_name'
}

# 下载最新版本
download_latest() {
    local owner=$1
    local repo=$2
    local output=$3
    
    # 获取仓库信息
    data=$(curl -s "${workerUrl}/api/repo?owner=$owner&repo=$repo")
    
    # 获取最新版本的第一个资源文件
    asset_id=$(echo $data | jq '.data.latest.assets[0].id')
    filename=$(echo $data | jq -r '.data.latest.assets[0].name')
    
    # 下载文件
    curl -L -o "\${output:-\$filename}" \\
        "${workerUrl}/api/download?owner=$owner&repo=$repo&assetId=$asset_id&filename=$filename"
}</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>GitHub Releases Proxy API v1.0 • 部署于 Cloudflare Workers</p>
            <div class="api-status">
                <span>API 状态:</span>
                <span class="status-indicator status-up"></span>
                <span id="apiStatusText">运行正常</span>
            </div>
            <p style="margin-top: 10px;">
                <a href="/" style="color: var(--secondary-color); text-decoration: none;">
                    <i class="fas fa-home"></i> 返回首页
                </a>
            </p>
        </div>
    </div>
    
    <script>
        // 复制代码功能
        function copyCode(button) {
            const codeBlock = button.closest('.code-block');
            const codeContent = codeBlock.querySelector('pre code');
            const text = codeContent.textContent;
            
            navigator.clipboard.writeText(text).then(() => {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> 已复制';
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
            });
        }
        
        // 测试 API 端点
        function testEndpoint(endpoint) {
            const fullUrl = '${workerUrl}' + endpoint;
            
            fetch(fullUrl)
                .then(response => response.json())
                .then(data => {
                    alert(\`端点测试成功！\\n状态: \${data.success ? '成功' : '失败'}\\n时间戳: \${data.timestamp}\`);
                })
                .catch(error => {
                    alert(\`端点测试失败: \${error.message}\`);
                });
        }
        
        // 检查 API 状态
        async function checkApiStatus() {
            try {
                const response = await fetch('${workerUrl}/api/repos');
                if (response.ok) {
                    document.getElementById('apiStatusText').textContent = '运行正常';
                } else {
                    document.getElementById('apiStatusText').textContent = '运行异常';
                    document.querySelector('.status-indicator').classList.remove('status-up');
                    document.querySelector('.status-indicator').classList.add('status-down');
                }
            } catch (error) {
                document.getElementById('apiStatusText').textContent = '连接失败';
                document.querySelector('.status-indicator').classList.remove('status-up');
                document.querySelector('.status-indicator').classList.add('status-down');
            }
        }
        
        // 页面加载时检查状态
        document.addEventListener('DOMContentLoaded', () => {
            checkApiStatus();
            
            // 平滑滚动到锚点
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 20,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && e.ctrlKey) {
                e.preventDefault();
                document.querySelector('.quick-links').scrollIntoView({ behavior: 'smooth' });
            }
            
            if (e.key === 'Escape') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    </script>
</body>
</html>`;
}

