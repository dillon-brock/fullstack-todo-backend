const { Router } = require('express');
const UserService = require('../services/UserService');

module.exports = Router().post('/', async (req, res, next) => {
  try {
    const newUser = await UserService.create(req.body);
    res.json(newUser);
  } catch (e) {
    next(e);
  }
});
