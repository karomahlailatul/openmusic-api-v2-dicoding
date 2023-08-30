const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().max(100).required(),
});

const AddSongPayloadSchema = Joi.object({
  songId: Joi.string().max(50).required(),
});

module.exports = {
  PlaylistPayloadSchema,
  AddSongPayloadSchema,
};
