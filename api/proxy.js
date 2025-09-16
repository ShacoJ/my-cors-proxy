// 文件路径: /api/proxy.js
// 这是最终的、必将成功的代码

export default async function handler(request, response) {
  // 1. 从完整的请求 URL 中，手动提取出需要代理的目标路径
  // 例如，对于请求 /api/proxy/v1/models，request.url 就是这个值
  // 我们将 "/api/proxy/" 这部分替换为空字符串，就得到了 "v1/models"
  const apiPath = request.url.replace('/api/proxy/', '');

  // 2. 检查路径是否为空
  if (!apiPath) {
    return response.status(400).json({ error: 'The path to proxy is missing. URL should be /api/proxy/<path-to-resource>.' });
  }
  
  // 3. 构造最终要请求的目标 URL
  const targetUrl = `https://zone.veloera.org/${apiPath}`;

  const apiKey = process.env.VELOERA_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API key is not configured on the proxy server.' });
  }

  console.log(`[SUCCESS] Proxying request for path: /${apiPath}`);
  console.log(`[SUCCESS] Full target URL: ${targetUrl}`);

  try {
    const apiResponse = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: request.body,
    });
    
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
