const {body} = require("express-validator");
const {handleValidationErrors} = require("../../../utils/validation");

const validateSpotImages = [
    body('images')
        .optional({values: 'falsy'})
        .isArray({min: 1})
        .withMessage('At least one image must be provided'),
    body('images.*.url')
        .optional({values: 'falsy'})
        .isURL()
        .withMessage('An image must contain a url'),
    body('images.*.preview')
        .optional()
        .isBoolean()
        .withMessage('A spot image must denote if it is a preview image or not'),
    handleValidationErrors
];

module.exports = {
    validateSpotImages
};
