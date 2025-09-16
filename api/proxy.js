// 文件路径: /api/proxy.js

export default async function handler(request, response) {
  // 1. 目标 API 的基础 URL
  const targetBaseUrl = 'https://zone.veloera.org';

  // 2. 从收到的请求中获取原始路径和查询参数
  // 例如，如果前端请求 /api/proxy/v1/models?q=test
  // `request.url` 的值就是 /v1/models?q=test
  const originalPath = request.url;

  // 3. 构造完整的、要请求的目标 URL
  const targetUrl = `${targetBaseUrl}${originalPath}`;

  console.log(`Proxying request to: ${targetUrl}`);

  try {
    // 4. 使用 fetch 向目标 API 发起请求
    const apiResponse = await fetch(targetUrl, {
      method: request.method, // 使用与前端请求相同的 HTTP 方法
      headers: {
        // 我们只转发必要的头信息
        'Content-Type': 'application/json',
        // 如果目标 API 需要认证，可以在这里安全地添加密钥
        // 'Authorization': `Bearer ${process.env.SOME_API_KEY}`
      },
      // 如果前端请求有 body (例如 POST)，则将其转发
      body: request.body,
    });

    // 5. 将目标 API 的响应原封不动地返回给你的前端
    
    // 设置状态码
    response.status(apiResponse.status);

    // 设置响应头 (可选，但推荐)
    // 这可以让浏览器正确处理如 Content-Type 等信息
    apiResponse.headers.forEach((value, key) => {
      response.setHeader(key, value);
    });

    // 发送响应体
    const data = await apiResponse.json();
    response.json(data);

  } catch (error) {
    console.error("Proxy Error:", error);
    // 6. 如果代理过程出错，返回一个服务器错误
    response.status(500).json({ error: 'Proxy request failed.' });
  }
}