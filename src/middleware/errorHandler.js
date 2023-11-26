const notFound = (req, res, next) => {
    const error = new Error(`Not found - ${req?.originalUrl || null}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode < 300 ? 500 : res.statusCode;
    let message = err.message;
    res.status(statusCode || 500).json({
        message: message,
        stack: err.stack,
    });
    next(err);
};

module.exports = {
    notFound,
    errorHandler,
};
