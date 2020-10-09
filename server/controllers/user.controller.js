const Joi = require('joi');
const User = require('../models/user.model');

const userSchema = Joi.object({
  id: Joi.string().required(),
  username: Joi.string().required(),
  avatar: Joi.string().required(),
  avatarLink: Joi.string().required(),
  discriminator: Joi.string().required(),
  bot: Joi.boolean(),
  public_flags: Joi.number(),
  flags: Joi.number(),
  email: Joi.string().email().required(),
  locale: Joi.string(),
  verified: Joi.boolean().required(),
  isAdmin: Joi.boolean(),
  mfa_enabled: Joi.boolean(),
  premium_type: Joi.boolean()
})

const tokenRequestSchema = Joi.object({
  id: Joi.string().required(),
  username: Joi.string().required(),
  access_token: Joi.string().required(),
  token_type: Joi.string().required(),
  expires_in: Joi.number().required(),
  refresh_token: Joi.string().required(),
  scope: Joi.string().required()
})

const tokenRequestSchema = Joi.object({
  id: Joi.string().required(),
  username: Joi.string().required(),
  access_token: Joi.string().required(),
  token_type: Joi.string().required(),
  expires_in: Joi.number().required(),
  refresh_token: Joi.string().required(),
  scope: Joi.string().required()
})

const missionSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  type: Joi.string().required(),
  map: Joi.string().required(),
  description: Joi.string().required(),
  createDate: Joi.number().required(),
  updateDate: Joi.string().required()
})

async function insertUser(user) {
  user = await Joi.validate(user, tokenRequestSchema, { abortEarly: false });
  return await new User(user).save();
}

module.exports = {
  insert
}
