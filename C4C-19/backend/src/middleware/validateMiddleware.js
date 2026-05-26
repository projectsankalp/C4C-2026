const validateRequiredFields = (

  fields

) => {

  return (req, res, next) => {

    for (const field of fields) {

      if (!req.body[field]) {

        return res.status(400).json({

          success: false,

          message: `${field} is required`

        });

      }

    }

    next();

  };

};

module.exports = {
  validateRequiredFields
};