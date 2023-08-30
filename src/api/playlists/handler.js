const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, songsService, validator) {
    this._service = service;
    this._validator = validator;
    this._songsService = songsService;
    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistName(name, credentialId);

    const playlistId = await this._service.addPlaylist({
      name,
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async getPlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._service.getPlaylistsById(id);
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async putPlaylistByIdHandler(request) {
    this._validator.validatePlaylistPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    await this._service.editPlaylistById(id, request.payload);

    return {
      status: 'success',
      message: 'Playlist berhasil diperbarui',
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { songId } = request.payload;
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    await this._songsService.getSongById(songId);
    await this._service.verifySongPlaylist(songId, id);

    await this._service.addSongToPlaylist(id, songId);

    const action = 'add';
    const time = new Date().toISOString();
    await this._service.addActivity({
      userId: credentialId,
      playlistId: id,
      songId,
      action,
      time,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongFromPlaylistHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);

    const playlist = await this._service.getSongsFromPlaylist(id);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    await this._service.deleteSongFromPlaylist(id, songId);

    const action = 'delete';
    const time = new Date().toISOString();
    await this._service.addActivity({
      userId: credentialId,
      playlistId: id,
      songId,
      action,
      time,
    });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);

    const { playlistId, activities } = await this._service.getPlaylistActivities(id);

    return {
      status: 'success',
      data: { playlistId, activities },
    };
  }
}

module.exports = PlaylistsHandler;
