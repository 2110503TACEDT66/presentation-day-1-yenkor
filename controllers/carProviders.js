const getDistanceMatrix = require("../api/DistanceMatrixAPI");
const CarProvider = require("../models/CarProvider");

// @desc    Get all car providers
// @route   GET /api/v1/carproviders
// @access  Public
exports.getCarProviders = async (req, res, next) => {
  let query;

  const reqQuery = { ...req.query };

  const removeFields = ["select", "sort", "page", "limit"];

  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  query = CarProvider.find(JSON.parse(queryStr)).populate("renting");

  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-name");
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const total = await CarProvider.countDocuments();
    query = query.skip(startIndex).limit(limit);
    const carProviders = await query;
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: carProviders.length,
      data: carProviders,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
};

// @desc    Get single car provider
// @route   GET /api/v1/carproviders/:id
// @access  Public

exports.getCarProvider = async (req, res, next) => {
  try {
    const carProvider = await CarProvider.findById(req.params.id);

    if (!carProvider) {
      return res
        .status(400)
        .json({ success: false, message: "No car provider found" });
    }

    res.status(200).json({ success: true, data: carProvider });
  } catch (err) {
    res.status(400).json({ success: false, message: "No car provider found" });
  }
};

// @desc    Create new car provider
// @route   POST /api/v1/carproviders
// @access  Private
exports.createCarProvider = async (req, res, next) => {
  try {
    const { name, address, telephone, price } = req.body;

    const carProvider = await CarProvider.create({
      name,
      address,
      telephone,
      price,
    });

    res.status(201).json({
      success: true,
      data: carProvider,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: err });
  }
};

exports.updateCarProvider = async (req, res, next) => {
  try {
    const carProvider = await CarProvider.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!carProvider) {
      return res
        .status(400)
        .json({ success: false, message: "No car provider found" });
    }

    res.status(200).json({ success: true, data: carProvider });
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
};

// @desc    Delete car provider
// @route   DELETE /api/v1/carproviders/:id
// @access  Private
exports.deleteCarProvider = async (req, res, next) => {
  try {
    const carProvider = await CarProvider.findById(req.params.id);

    if (!carProvider) {
      return res
        .status(400)
        .json({ success: false, message: "No car provider found" });
    }

    await carProvider.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
};

// @desc    Get car providers within a radius
// @route   GET /api/v1/carproviders/nearyby
// @access  Private
exports.getNearByCarProviders = async (req, res, next) => {
  try {
    const userData = req.user.toObject();
    const origin = userData.address;
    console.log(userData.address);

    const carProviders = await CarProvider.find();
    console.log(carProviders);
    const destinations = carProviders.map((carProvider) => carProvider.address);
    console.log(destinations);
    // build the query string to pass to the API
    const destinationsStr = destinations.join("|");
    console.log(destinationsStr);
    const distanceMatrix = await getDistanceMatrix(origin, destinationsStr);
    console.log(distanceMatrix);
    // iterate through the rows and elements and if "status" : "NOT_FOUND" remove the element from the array
    const elements = distanceMatrix.rows[0].elements;
    console.log(elements);
    const top5NearbyCarProviders = [];
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.status === "OK") {
        carProviders[i].distance = element.distance.value;
        // top5NearbyCarProviders.push(carProviders[i]);
        top5NearbyCarProviders.push({
          name: carProviders[i].name,
          address: carProviders[i].address,
          telephone: carProviders[i].telephone,
          price: carProviders[i].price,
          distance: element.distance.value,
        });
      }
    }

    top5NearbyCarProviders.sort((a, b) => a.distance - b.distance);
    top5NearbyCarProviders.splice(5);
    console.log(top5NearbyCarProviders);

    res.status(200).json({ success: true, data: top5NearbyCarProviders });
  } catch (err) {
    res.status(400).json({ success: false, data: err });
  }
};
