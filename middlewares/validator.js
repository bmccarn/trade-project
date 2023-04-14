exports.validateId = (req, res, next) => {
    const { id } = req.params;

    // Check if the "id" parameter is a valid 24-bit hexadecimal string
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        // If valid, call the next middleware function
        next();
    } else {
        // If invalid, call the default error handler with a status code of 400
        let err = new Error('Invalid story id');
        err.status = 400;
        next(err);
    }
};

