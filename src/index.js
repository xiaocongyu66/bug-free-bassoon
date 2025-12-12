// Cloudflare Worker - ES Module 格式
import { handleApiRequest } from './api.js';
import { generateHTML, generateApiDocsHTML } from './ui.js';

// 在 index.js 的 fetch 函数中添加
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 设置 CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
      'Access-Control-Max-Age': '86400'
    };

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain; charset=utf-8'
        } 
      });
    }
    
    // 处理 HEAD 请求（用于检查文件大小）
    if (request.method === 'HEAD') {
      if (path.startsWith('/api/download')) {
        const owner = url.searchParams.get('owner');
        const repo = url.searchParams.get('repo');
        const assetId = url.searchParams.get('assetId');
        
        if (owner && repo && assetId) {
          try {
            // 返回一个包含基本信息的响应
            return new Response(null, {
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/octet-stream',
                'Accept-Ranges': 'bytes',
                'Access-Control-Allow-Origin': '*'
              },
              status: 200
            });
          } catch (error) {
            console.error('HEAD请求错误:', error);
          }
        }
      }
      return new Response(null, { status: 405 });
    }

    try {
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
        return await handleApiRequest(request, env, url);
      }
      
      // 首页 - 返回动态生成的 HTML
      if (path === '/' || path === '/index.html') {
        const html = generateHTML(env);
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Cache-Control': 'public, max-age=3600',
            ...corsHeaders
          }
        });
      }
      
      // 其他静态资源（如果有）
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders
      });
      
    } catch (error) {
      console.error('全局错误:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};
