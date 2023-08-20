const router = require('express').Router();
const { createMovieValidation, movieIdValidation } = require('../utils/validate');

const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

// # возвращает все сохранённые текущим пользователем фильмы
router.get('/', getMovies);

//  # создаёт фильм с переданными в теле параметрами
router.post('/', createMovieValidation, createMovie);
// # удаляет сохранённый фильм по id
router.delete('/:movieId', movieIdValidation, deleteMovie); // validateMovieId

module.exports = router;
