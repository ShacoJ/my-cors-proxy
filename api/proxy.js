// 文件路径: /api/proxy.js

export default async function handler(request, response) {
  const targetBaseUrl = 'https://zone.veloera.org';
  const originalPath = request.url;
  const targetUrl = `${targetBaseUrl}${originalPath}`;

  // 从 Vercel 的环境变量中安全地读取你的 API 密钥
  const apiKey = process.env.VELOERA_API_KEY;

  // 如果没有在 Vercel 中设置密钥，则返回错误，防止匿名访问
  if (!apiKey) {
    return response.status(500).json({ error: 'API key is not configured on the proxy server.' });
  }

  console.log(`Proxying request to: ${targetUrl}`);

  try {
    const apiResponse = await fetch(targetUrl, {
      method: request.method,
      headers: {
        // 关键步骤：添加 Authorization 头
        // 我们在这里构造 "Bearer <你的密钥>"
        'Authorization': `Bearer ${apiKey}`,
        
        // 如果你的 API 需要其他类型的 Key，可以像下面这样修改：
        // 'X-Api-Key': apiKey,

        // 同时也最好传递 Content-Type
        'Content-Type': 'application/json',
      },
      body: request.body,
    });

    // 将目标 API 的响应原封不动地返回给你的前端
    response.status(apiResponse.status);
    apiResponse.headers.forEach((value, key) => {
      response.setHeader(key, value);
    });
    const data = await apiResponse.json();
    response.json(data);

  } catch (error) {
    console.error("Proxy Error:", error);
    response.status(500).json({ error: 'Proxy request failed.' });
  }
}
