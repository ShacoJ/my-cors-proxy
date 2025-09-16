// 文件路径: /api/hello.js
export default function handler(request, response) {
  response.status(200).send('Hello World! The API directory is working!');
}
