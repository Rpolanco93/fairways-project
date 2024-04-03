'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static calculateAvg(Spots) {
      for (let index of Spots) {
        const totalReviews = index.Reviews.length
        let totalReview = 0;
        for (let review of index.Reviews) {
            totalReview += review.stars
        }

        index.avgRating = totalReview / totalReviews

        index.SpotImages.forEach(image => {
            if (image.previewImage) {
                index.previewImage = image.url
            }
        })
        delete index.Reviews
        delete index.SpotImages
      }
      return Spots
    }

    static associate(models) {
      // define association here
      Spot.belongsTo(
        models.User,
        {
          foreignKey: 'id'
        }
      )

      Spot.hasMany(
        models.Booking,
        {
          foreignKey: 'spotId'
        }
      )

      Spot.hasMany(
        models.Review,
        {
          foreignKey: 'spotId'
        }
      )

      Spot.hasMany(
        models.SpotImages,
        {
          foreignKey: 'spotId'
        }
      )
    }
  }
  Spot.init({
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lat: {
      type: DataTypes.FLOAT,
    },
    lng: {
      type: DataTypes.FLOAT,
    },
    description: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};
