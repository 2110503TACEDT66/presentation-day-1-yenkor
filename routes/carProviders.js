const express = require("express");
const {
  getCarProviders,
  getCarProvider,
  createCarProvider,
  updateCarProvider,
  deleteCarProvider,
} = require("../controllers/CarProviders");

const router = express.Router();
const CarProvider = require("../models/CarProvider");
// const { protect, authorize } = require("../middleware/auth");

router.route("/").get(getCarProviders).post(createCarProvider);

router
  .route("/:id")
  .get(getCarProvider)
  .put(updateCarProvider)
  .delete(deleteCarProvider);

module.exports = router;
