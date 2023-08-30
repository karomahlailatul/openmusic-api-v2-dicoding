const Joi = require('joi');

const PostCollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().max(50).required(),
  userId: Joi.string().max(50).required(),
});

module.exports = {
  PostCollaborationPayloadSchema,
};
