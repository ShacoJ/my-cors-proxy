// 文件路径: /api/proxy.js
// 这是最终的、增加了 CORS 预检处理的、绝对完整的代码

export default async function handler(request, response) {
  // ------------------------------------------------------------------
  // **新增的核心部分：处理 CORS 预检 (Preflight) 请求**
  // ------------------------------------------------------------------
  // 浏览器在发送真正的请求（如 POST）前，会先发送一个 OPTIONS 请求来“探路”。
  // 我们必须在这里直接响应它，告诉浏览器我们的代理是安全的。
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Origin', '*'); // 允许任何来源的跨域请求
    response.setHeader('Access-control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // 允许前端发送这些请求头

    // 发送一个 204 "No Content" 响应，表示预检成功
    return response.status(204).end();
  }

  // ------------------------------------------------------------------
  // **我们之前编写的、现在只处理非 OPTIONS 请求的代理逻辑**
  // ------------------------------------------------------------------
  const apiPath = request.query.path;

  if (!apiPath) {
    return response.status(400).json({ error: 'The path to proxy is missing.' });
  }
  
  const targetUrl = `https://zone.veloera.org/${apiPath}`;
  const apiKey = process.env.VELOERA_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API key is not configured on the proxy server.' });
  }

  console.log(`[PROXYING] Path: /${apiPath}, Target: ${targetUrl}`);

  try {
    const apiResponse = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: request.body,
    });

    // 在将响应返回给前端之前，我们也为 *真正的请求* 添加 CORS 头
    // 这可以防止一些边缘情况下的问题
    response.setHeader('Access-Control-Allow-Origin', '*');
    
    response.status(apiResponse.status);
    apiResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
        response.setHeader(key, value);
      }
    });

    const data = await apiResponse.json();
    response.json(data);

  } catch (error) {
    console.error("Proxy Error:", error);
    response.status(500).json({ error: 'Proxy request failed.' });
  }
}
