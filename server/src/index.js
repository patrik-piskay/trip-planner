import server, { port } from './server.js';

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
