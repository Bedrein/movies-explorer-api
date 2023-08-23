const router = require('express').Router();
const { updateProfileInfoValidate } = require('../utils/validate');

const {
  updateProfileInfo,
  getUserInfo,
} = require('../controllers/users');

// # возвращает информацию о пользователе (email и имя)
router.get('/me', getUserInfo);
// # обновляет информацию о пользователе (email и имя)
router.patch('/me', updateProfileInfoValidate, updateProfileInfo);

module.exports = router;
