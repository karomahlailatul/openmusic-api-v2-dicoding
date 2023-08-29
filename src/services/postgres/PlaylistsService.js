const { nanoid } = require('nanoid');
const Pool = require('../../config/db');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapDBToModelPlaylists: mapDBToModel } = require('../../utils');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = Pool;
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
            FROM playlists
            INNER JOIN users ON playlists.owner = users.id  
            LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
            WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };

    const { rowCount, rows } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlists tidak Ditemukan');
    }

    return rows.map(mapDBToModel);
  }

  async getPlaylistsById(id) {
    const query = {
      text: `SELECT playlists.*, users.username
    FROM playlists
    LEFT JOIN users ON users.id = playlists.owner
    WHERE playlists.id = $1`,
      values: [id],
    };
    const { rowCount, rows } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist tidak Ditemukan');
    }

    return rows.map(mapDBToModel)[0];
  }

  async editPlaylistById(id, { name, owner }) {
    const query = {
      text: 'UPDATE playlists SET name = $1, owner = $2  WHERE id = $3 RETURNING id',
      values: [name, owner, id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError(
        'Failed memperbaharui playlist. Id tidak Ditemukan',
      );
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak Ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const { rowCount, rows } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist tidak Ditemukan');
    }
    const playlist = rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistName(name, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE name = $1 AND owner = $2',
      values: [name, owner],
    };
    const { rowCount } = await this._pool.query(query);

    if (rowCount) {
      throw new NotFoundError('Playlist name ditemukan');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async getUsersByUsername(username) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE username LIKE $1',
      values: [`%${username}%`],
    };
    const { rows } = await this._pool.query(query);
    return rows;
  }

  async verifySongPlaylist(songId, playlistId) {
    const query = {
      text: 'SELECT * FROM playlist_songs WHERE song_id = $1 AND playlist_id = $2',
      values: [songId, playlistId],
    };

    const { rowCount } = await this._pool.query(query);

    if (rowCount !== 0) {
      throw new NotFoundError('Lagu telah terdaftar pada playlist');
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `songplaylist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const { rows, rowCount } = await this._pool.query(query);
    if (rowCount === 0) {
      throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist');
    }
    return rows[0].id;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const { rowCount } = await this._pool.query(query);

    if (rowCount === 0) {
      throw new InvariantError('Lagu gagal dihapus');
    }
  }

  async getSongsFromPlaylist(playlistId) {
    const queryPlaylist = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    // const queryUser = {
    //   text: `SELECT users.username FROM users
    //   LEFT JOIN playlists ON users.id = playlists.owner
    //   WHERE playlists.id = $1 `,
    //   values: [playlistId],
    // };
    // const querySongs = {
    //   text: `SELECT songs.id, songs.title, songs.performer FROM songs
    //   LEFT JOIN playlist_songs ON songs.id = playlist_songs.song_id
    //   WHERE playlist_songs.playlist_id = $1`,
    //   values: [playlistId],
    // };

    const resultPlaylist = await this._pool.query(queryPlaylist);
    // const resultUser = await this._pool.query(queryUser);
    // const resultSongs = await this._pool.query(querySongs);

    if (!resultPlaylist.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    return {
      id: resultPlaylist.rows[0].id,
      name: resultPlaylist.rows[0].name,
      // username: resultUser.rows[0].username,
      // songs: resultSongs.rows,
    };
  }

  async getPlaylistActivities(id) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time FROM playlist_song_activities
      LEFT JOIN playlists ON playlist_song_activities.playlist_id=playlists.id
      LEFT JOIN users ON playlist_song_activities.user_id=users.id
      LEFT JOIN songs ON playlist_song_activities.song_id=songs.id
      WHERE playlist_song_activities.playlist_id=$1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    const activitiesResult = result.rows;

    return {
      playlistId: id,
      activities:
        activitiesResult.length !== 1 || activitiesResult[0].username != null
          ? activitiesResult
          : [],
    };
  }

  async addActivity({
    userId, playlistId, songId, action, time,
  }) {
    const id = `activity-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Activity gagal ditambahkan');
    }
  }
}

module.exports = PlaylistsService;
