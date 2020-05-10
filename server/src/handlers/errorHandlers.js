export const catchErrors = (fn) => {
  return function (req, res, next) {
    try {
      fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export const notFound = (req, res, next) => {
  const err = new Error('Endpoint not found');
  err.status = 404;

  next(err);
};

export const errorHandler = (error, req, res, next) => {
  const message = !error.status || error.status === 500 ? 'Internal server error' : error.message;

  console.error(error);

  res.status(error.status || 500).send({
    error: message,
  });
};
