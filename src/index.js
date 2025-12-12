// Cloudflare Worker - ES Module 格式
import { handleApiRequest } from './api.js';
import { generateHTML, generateApiDocsHTML } from './ui.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 设置 CORS 头 - 增强版
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Range, Authorization, Accept, X-Requested-With',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Content-Disposition, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
    };

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain; charset=utf-8'
        } 
      });
    }
    
    // 处理 HEAD 请求（用于检查文件大小和可下载性）
    if (request.method === 'HEAD') {
      console.log(`[HEAD] 请求路径: ${path}`);
      
      if (path.startsWith('/api/download')) {
        const owner = url.searchParams.get('owner');
        const repo = url.searchParams.get('repo');
        const assetId = url.searchParams.get('assetId');
        const filename = url.searchParams.get('filename');
        
        if (!owner || !repo || !assetId || !filename) {
          return new Response(null, {
            status: 400,
            headers: corsHeaders
          });
        }
        
        try {
          // 返回一个包含基本信息的响应，允许客户端检查
          return new Response(null, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/octet-stream',
              'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
              'Accept-Ranges': 'bytes',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'public, max-age=3600'
            },
            status: 200
          });
        } catch (error) {
          console.error('[HEAD] 请求错误:', error);
          return new Response(null, { 
            status: 500,
            headers: corsHeaders
          });
        }
      }
      
      // 对于其他 API 的 HEAD 请求，返回基本状态
      if (path.startsWith('/api/')) {
        return new Response(null, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Allow': 'GET, HEAD, OPTIONS'
          }
        });
      }
      
      // 对于页面请求的 HEAD
      return new Response(null, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
          'Allow': 'GET, HEAD, OPTIONS'
        }
      });
    }

    try {
      // 记录请求信息（用于调试）
      console.log(`[${request.method}] ${url.pathname}${url.search}`);
      
      // API 文档页面
      if (path === '/api-docs' || path === '/api-docs.html') {
        const html = generateApiDocsHTML(env);
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Cache-Control': 'public, max-age=3600',
            ...corsHeaders
          }
        });
      }
      
      // API 路由
      if (path.startsWith('/api/')) {
        // 添加请求超时保护
        const apiPromise = handleApiRequest(request, env, url);
        
        // 设置 API 请求超时
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('API请求超时')), 
            parseInt(env.API_TIMEOUT) || 30000);
        });
        
        try {
          const response = await Promise.race([apiPromise, timeoutPromise]);
          return response;
        } catch (timeoutError) {
          console.error('API请求超时:', timeoutError);
          return new Response(JSON.stringify({
            success: false,
            error: '请求处理超时，请稍后重试',
            timestamp: new Date().toISOString()
          }), {
            status: 504,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // 首页 - 返回动态生成的 HTML
      if (path === '/' || path === '/index.html') {
        // 添加缓存控制
        const cache = caches.default;
        const cacheKey = new Request(url.toString(), request);
        let response = await cache.match(cacheKey);
        
        if (!response) {
          console.log('生成新的HTML页面');
          const html = generateHTML(env);
          response = new Response(html, {
            headers: {
              'Content-Type': 'text/html;charset=UTF-8',
              'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
              ...corsHeaders
            }
          });
          
          // 将响应存入缓存
          ctx.waitUntil(cache.put(cacheKey, response.clone()));
        } else {
          console.log('从缓存返回HTML页面');
        }
        
        return response;
      }
      
      // 健康检查端点
      if (path === '/health' || path === '/healthz') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'github-releases-proxy',
          version: '1.0.0'
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // 服务信息端点
      if (path === '/info') {
        return new Response(JSON.stringify({
          service: 'GitHub Releases Proxy',
          description: '代理 GitHub Releases 下载，支持多 Token 轮询和缓存',
          version: '1.0.0',
          endpoints: [
            '/api/repos - 获取仓库列表',
            '/api/latest - 获取最新版本',
            '/api/all - 获取所有版本',
            '/api/repo - 获取仓库详情',
            '/api/download - 代理下载',
            '/api/tokens/status - Token 状态',
            '/api-docs - API 文档',
            '/health - 健康检查'
          ],
          cors: true,
          timestamp: new Date().toISOString()
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300',
            ...corsHeaders
          }
        });
      }
      
      // 静态资源路由（如果有的话）
      if (path === '/favicon.ico') {
        return new Response(null, { 
          status: 204,
          headers: corsHeaders 
        });
      }
      
      if (path === '/robots.txt') {
        return new Response('User-agent: *\nDisallow:', {
          headers: {
            'Content-Type': 'text/plain',
            ...corsHeaders
          }
        });
      }
      
      // 处理 404 页面
      const notFoundResponse = () => {
        const isApiRequest = request.headers.get('Accept')?.includes('application/json') ||
                           request.headers.get('Content-Type')?.includes('application/json') ||
                           path.startsWith('/api/');
        
        if (isApiRequest) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Endpoint not found',
            path: path,
            method: request.method,
            timestamp: new Date().toISOString()
          }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } else {
          // 返回 HTML 格式的 404 页面
          const html = `
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>页面未找到 - GitHub Releases Proxy</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background-color: #f6f8fa;
                  color: #24292e;
                  text-align: center;
                  padding: 50px;
                }
                h1 {
                  font-size: 3rem;
                  color: #0366d6;
                }
                p {
                  font-size: 1.2rem;
                  margin: 20px 0;
                }
                a {
                  color: #0366d6;
                  text-decoration: none;
                }
                a:hover {
                  text-decoration: underline;
                }
                .container {
                  max-width: 800px;
                  margin: 0 auto;
                  background: white;
                  padding: 40px;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .links {
                  margin-top: 30px;
                }
                .links a {
                  display: inline-block;
                  margin: 0 10px;
                  padding: 10px 20px;
                  background: #0366d6;
                  color: white;
                  border-radius: 4px;
                  transition: background 0.3s;
                }
                .links a:hover {
                  background: #0256b9;
                  text-decoration: none;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>404</h1>
                <h2>页面未找到</h2>
                <p>您访问的路径 <code>${path}</code> 不存在。</p>
                <p>请检查 URL 是否正确，或返回以下页面：</p>
                <div class="links">
                  <a href="/">返回首页</a>
                  <a href="/api-docs">查看 API 文档</a>
                </div>
                <p style="margin-top: 30px; font-size: 0.9rem; color: #586069;">
                  GitHub Releases Proxy v1.0.0
                </p>
              </div>
            </body>
            </html>
          `;
          
          return new Response(html, {
            status: 404,
            headers: {
              'Content-Type': 'text/html;charset=UTF-8',
              ...corsHeaders
            }
          });
        }
      };
      
      return notFoundResponse();
      
    } catch (error) {
      console.error('全局错误处理:', error);
      
      // 根据请求类型返回不同的错误响应
      const isApiRequest = request.headers.get('Accept')?.includes('application/json') ||
                         request.headers.get('Content-Type')?.includes('application/json') ||
                         path.startsWith('/api/');
      
      if (isApiRequest) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message || 'Internal server error',
          type: error.name || 'Error',
          timestamp: new Date().toISOString(),
          request_id: ctx.requestId || 'unknown'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } else {
        // HTML 错误页面
        const html = `
          <!DOCTYPE html>
          <html lang="zh-CN">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>服务器错误 - GitHub Releases Proxy</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background-color: #f6f8fa;
                color: #24292e;
                text-align: center;
                padding: 50px;
              }
              h1 {
                font-size: 3rem;
                color: #d73a49;
              }
              p {
                font-size: 1.2rem;
                margin: 20px 0;
              }
              .error-details {
                background: #ffebee;
                padding: 20px;
                border-radius: 4px;
                margin: 20px 0;
                text-align: left;
                font-family: monospace;
                font-size: 0.9rem;
                max-width: 800px;
                margin-left: auto;
                margin-right: auto;
                overflow-x: auto;
              }
              a {
                color: #0366d6;
                text-decoration: none;
              }
              a:hover {
                text-decoration: underline;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              }
              .links {
                margin-top: 30px;
              }
              .links a {
                display: inline-block;
                margin: 0 10px;
                padding: 10px 20px;
                background: #0366d6;
                color: white;
                border-radius: 4px;
                transition: background 0.3s;
              }
              .links a:hover {
                background: #0256b9;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>500</h1>
              <h2>服务器内部错误</h2>
              <p>抱歉，服务器处理您的请求时出现了错误。</p>
              ${env.WORKERS_DEV ? `
              <div class="error-details">
                <strong>错误详情：</strong><br>
                ${error.message || '未知错误'}<br>
                <small>${new Date().toISOString()}</small>
              </div>
              ` : ''}
              <div class="links">
                <a href="/">返回首页</a>
                <a href="javascript:location.reload()">重新加载</a>
                <a href="/api-docs">API 文档</a>
              </div>
              <p style="margin-top: 30px; font-size: 0.9rem; color: #586069;">
                GitHub Releases Proxy v1.0.0 • ${new Date().toLocaleDateString()}
              </p>
            </div>
          </body>
          </html>
        `;
        
        return new Response(html, {
          status: 500,
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            ...corsHeaders
          }
        });
      }
    }
  }
};

// 添加额外的错误监听器（可选）
if (typeof addEventListener === 'function') {
  addEventListener('unhandledrejection', event => {
    console.error('未处理的 Promise 拒绝:', event.reason);
    event.preventDefault();
  });
}
