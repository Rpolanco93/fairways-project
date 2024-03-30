const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const spotsRouter = require('./spots.js')
const bookingsRouter = require('./')
const reviewsRouter = require('./')
const spotImagesRouter = require('./')
const reviewImagesRouter = require('./')

const { restoreUser } = require('../../utils/auth.js');
const { User } = require('../../db/models');

// Connect restoreUser middleware to the API router
  // If current user session is valid, set req.user to the user in the database
  // If current user session is not valid, set req.user to null
router.use(restoreUser);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/spots', spotsRouter);
//!update the route variables at the top of the page
// router.use('/bookings', );

// router.use('/reviews', );

// router.use('/spot-images', );

// router.use('/review-images', );

router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;
