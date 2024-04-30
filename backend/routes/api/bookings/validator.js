const { body } = require('express-validator')
const { handleValidationErrors } = require('../../../utils/validation')

const validateBooking = [
    body('startDate')
        .exists({ checkFalsy: true })
        .toDate()
        .isAfter(new Date().toISOString())
        .withMessage('startDate cannot be in the past'),

    body('endDate')
        .exists({ checkFalsy: true })
        .toDate()
        .custom((value, { req, res }) => {
            if (req.body.startDate >= req.body.endDate) {
                throw new Error ("endDate cannot be on or before startDate")
            }
            return true;
        }),

    body(['startDate', 'endDate'])
        .exists({ checkFalsy: true })
        .toDate()
        .withMessage((_value, meta) => `Booking requires a ${meta.path === 'startDate' ? 'startDate' : 'endDate'} that is not null and a valid date`),

    handleValidationErrors
];

module.exports = {
    validateBooking
};
