const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (
    server,
    { service, playlistService, validator },
  ) => {
    const collaborationsHandler = new CollaborationsHandler(
      service,
      playlistService,
      validator,
    );
    server.route(routes(collaborationsHandler));
  },
};
