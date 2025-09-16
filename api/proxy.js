// 文件路径: /api/proxy.js
// 这是与 vercel.json 配合使用的最终代码

export default async function handler(request, response) {
  // 1. 感谢 vercel.json 的重写规则，我们现在可以从查询参数中获取路径
  // 对于请求 /api/proxy/v1/models, `request.query.path` 的值就是 "v1/models"
  const apiPath = request.query.path;

  // 2. 检查路径是否存在
  if (!apiPath) {
    return response.status(400).json({ error: 'The path to proxy is missing.' });
  }
  
  // 3. 构造最终要请求的目标 URL
  const targetUrl = `https://zone.veloera.org/${apiPath}`;

  const apiKey = process.env.VELOERA_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API key is not configured on the proxy server.' });
  }

  console.log(`[FORCED ROUTE SUCCESS] Proxying path: /${apiPath}`);
  console.log(`[FORCED ROUTE SUCCESS] Target URL: ${targetUrl}`);

  try {
    const apiResponse = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: request.body,
    });
    
    // ... (其余部分保持不变)
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
