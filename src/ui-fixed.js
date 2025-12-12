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
    curl -L -o "${output:-$filename}" \\
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
