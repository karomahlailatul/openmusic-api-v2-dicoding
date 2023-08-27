/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlist_song_activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    action: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    time: {
      type: 'TIMESTAMP',
      notNull: true,
    },
  });

  pgm.addConstraint('playlist_song_activities', 'fk_playlist_id_playlists', {
    foreignKeys: {
      columns: 'playlist_id',
      references: 'playlists(id)',
      onDelete: 'CASCADE',
    },
  });
  pgm.addConstraint('playlist_song_activities', 'fk_song_id_songs', {
    foreignKeys: {
      columns: 'song_id',
      references: 'songs(id)',
      onDelete: 'CASCADE',
    },
  });
  pgm.addConstraint('playlist_song_activities', 'fk_user_id_users', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlist_song_activities', 'fk_playlist_id_playlists');
  pgm.dropConstraint('playlist_song_activities', 'fk_song_id_songs');
  pgm.dropConstraint('playlist_song_activities', 'fk_user_id_users');

  pgm.dropTable('playlist_song_activities');
};
