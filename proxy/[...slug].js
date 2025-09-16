// 文件路径: /api/proxy/[...slug].js
// 这是需要粘贴的最终代码

export default async function handler(request, response) {
  // 从 Vercel 传入的 request.query 对象中解构出 slug 数组
  const { slug } = request.query;

  // 检查 slug 是否存在且是一个数组
  if (!slug || !Array.isArray(slug)) {
    return response.status(400).json({ error: 'Invalid path. The URL should be /api/proxy/<path-to-resource>.' });
  }

  // 将 slug 数组用 "/" 连接起来，重新构建出原始的API路径
  // 例如: ['v1', 'models'] 会变成 'v1/models'
  const apiPath = slug.join('/');

  // 构造最终要请求的目标 URL
  const targetUrl = `https://zone.veloera.org/${apiPath}`;

  const apiKey = process.env.VELOERA_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API key is not configured on the proxy server.' });
  }

  console.log(`Proxying request for path: /${apiPath}`);
  console.log(`Full target URL: ${targetUrl}`);

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
