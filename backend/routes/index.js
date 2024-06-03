const express = require('express');
const router = express.Router();
const apiRouter = require('./api');

// Add a XSRF-TOKEN cookie
router.get("/api/csrf/restore", (req, res) => {
  // Add a XSRF-TOKEN cookie in development
  if (process.env.NODE_ENV !== 'production') {
  router.get('/api/csrf/restore', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.json({});
  });
  }

  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken);
  res.status(200).json({
      'XSRF-Token': csrfToken
  });
});

router.use('/api', apiRouter);

if (process.env.NODE_ENV === 'production') {
  const path = require('path');

  router.get('/', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    // Serve the frontend's index.html file at the root route
    return res.sendFile(
      path.resolve(__dirname, '../../frontend', 'dist', 'index.html')
    );
  });
  // this is using a relative path from express not this file
  router.use(express.static(path.resolve("../frontend/build")))

  // Serve the frontend's index.html file at all other routes NOT starting with /api
  router.get(/^(?!\/?api).*/, (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.sendFile(
      path.resolve(__dirname, '../../frontend', 'build', 'index.html')
    );
  });
}

module.exports = router;
