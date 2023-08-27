const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(service, playlistService, validator) {
    this._service = service;
    this._playlistService = playlistService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);

    const collaborationId = await this._service.addCollaboration(
      playlistId,
      userId,
    );
    const response = h.response({
      status: 'success',
      message: 'Collaboration berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Collaborations berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
