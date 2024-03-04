const express = require("express");
const {
  getCarProviders,
  getCarProvider,
  createCarProvider,
  updateCarProvider,
  deleteCarProvider,
  getNearByCarProviders,
} = require("../controllers/CarProviders");

const rentingsRouter = require("./rentings");

const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(getCarProviders)
  .post(protect, authorize("admin"), createCarProvider);

router.use("/:carProviderId/rentings", rentingsRouter);

router.route("/nearby").get(protect, getNearByCarProviders);

router
  .route("/:id")
  .get(getCarProvider)
  .put(protect, authorize("admin"), updateCarProvider)
  .delete(protect, authorize("admin"), deleteCarProvider);

module.exports = router;
