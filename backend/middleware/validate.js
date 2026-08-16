const validate = (schemas) => (req, _res, next) => {
  try {
    for (const location of ['params', 'query', 'body']) {
      if (schemas[location]) req[location] = schemas[location].parse(req[location]);
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
