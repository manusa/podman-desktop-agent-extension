import http from 'http';

export const findFreePort = async () => {
  const server = http.createServer();
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  server.close();
  return port;
};
