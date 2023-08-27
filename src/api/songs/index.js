const SongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { service, albumsService, validator }) => {
    const songsHandler = new SongsHandler(service, albumsService, validator);
    server.route(routes(songsHandler));
  },
};
