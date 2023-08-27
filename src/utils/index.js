const mapDBToModelSongs = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
});

const mapDBToModelAlbums = ({
  id, name, year, created_at, updated_at,
}) => ({
  id,
  name,
  year,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapDBToModelPlaylists = ({
  id,
  name,
  owner,
  created_at,
  updated_at,
  username,
}) => ({
  id,
  name,
  owner,
  createdAt: created_at,
  updatedAt: updated_at,
  username,
});

module.exports = {
  mapDBToModelSongs,
  mapDBToModelAlbums,
  mapDBToModelPlaylists,
};
