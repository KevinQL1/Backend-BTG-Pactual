const allowOrigins = '*';

const setHeaders = (res, isError = false) => {
  res.header('Access-Control-Allow-Origin', allowOrigins);
  res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Content-Type', isError ? 'application/problem+json' : 'application/json');
};

const ok = (res, body) => {
  setHeaders(res);
  return res.status(200).json(body);
};

const serverError = (res, path = '/') => {
  setHeaders(res, true);
  return res.status(500).json({
    type: 'urn:problem:server-error',
    title: 'Server Error',
    detail: 'An unexpected error has occurred, contact the administrator.',
    status: 500,
    instance: path
  });
};

const badRequest = (res, error, path = '/') => {
  setHeaders(res, true);
  return res.status(400).json({
    type: 'urn:problem:bad-request',
    title: 'Bad Request',
    detail: error.message,
    status: 400,
    instance: path
  });
};

const notFound = (res, error, path = '/') => {
  setHeaders(res, true);
  return res.status(404).json({
    type: 'urn:problem:not-found',
    title: 'Not Found',
    detail: error.message,
    status: 404,
    instance: path
  });
};

module.exports = {
  ok,
  serverError,
  badRequest,
  notFound
};