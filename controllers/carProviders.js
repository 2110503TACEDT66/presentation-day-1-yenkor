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
    res.status(400).json({ success: false });
  }
};

// @desc    Get single car provider
// @route   GET /api/v1/carproviders/:id
// @access  Public

exports.getCarProvider = async (req, res, next) => {
  try {
    const carProvider = await CarProvider.findById(req.params.id);

    if (!carProvider) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: carProvider });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create new car provider
// @route   POST /api/v1/carproviders
// @access  Private
exports.createCarProvider = async (req, res, next) => {
  try {
    const carProvider = await CarProvider.create(req.body);

    res.status(201).json({
      success: true,
      data: carProvider,
    });
  } catch (err) {
    res.status(400).json({ success: false });
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
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: carProvider });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Delete car provider
// @route   DELETE /api/v1/carproviders/:id
// @access  Private
exports.deleteCarProvider = async (req, res, next) => {
  try {
    const carProvider = await CarProvider.findById(req.params.id);

    if (!carProvider) {
      return res.status(400).json({ success: false });
    }

    await carProvider.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
