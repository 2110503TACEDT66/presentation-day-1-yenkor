const Renting = require('../models/Renting');
const Provider = require('../models/CarProvider');

//@desc     Get all renting
//@route    GET /api/v1/Rentings
//@access   Public
exports.getRentings = async (req,res,next) => {
    let query;
    if(req.user.role == 'admin') {
        if(req.param.carProviderId) {
            query = Renting.find({user: req.user.carProviderId}).populate({
                path: 'carProvider',
                select: 'name address telephone'
            });
        }
        else {
            query = Renting.find().populate({
                path: 'carProvider',
                select: 'name address telephone'
            });
        }
    }
    else {
        query = Renting.find({user: req.user.id}).populate({
            path: 'carProvider',
            select: 'name address telephone'
        });
    };

    try{
        const renting = await query;
        res.status(200).json({success: true, count: renting.length, data: renting});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({success: false, message: "Cannot find renting"});
    }
};

//@desc     Get a renting
//@route    GET /api/v1/Rentings
//@access   Public
exports.getRenting = async (req,res,next) => {
    try{
        const renting = await Renting.findById(req.param.id).populate({
            path: 'carProvider',
            select: 'name address telephone'
        })

        if(!renting) return res.status(400).json({success: false, message: `No renting with the ID of ${req.param.id}`});

        res.status(200).json({success: false, data: renting});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({success: false, message: "Cannot find renting"});
    }
};

//@desc     Make a Renting
//@route    POST /api/v1/hospitals/:hospitalId/Renting
//@access   Private
exports.addRenting = async (req,res,next) => {
    try {
        req.body.carProvider = req.param.carProviderId;

        const carProvider = await Provider.findById(req.param.carProviderId);
        if(!carProvider) return res.status(400).json({success: false, message: `No car provider with the ID of ${req.param.id}`});

        req.body.user = req.user.id;
        const existedRenting = await Renting.find({user: req.user.id});
        //renting limit
        if(existedRenting.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({success: false, message: `user ${req.user.id} has already made a rent`});
        }

        const renting = await Renting.create(req.body);
        res.status(200).json({success: false, data: renting});
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({success: false, message: "Renting has not been made"});
    }
};

//@desc     Edit Renting
//@route    PUT /api/v1/Renting/:id
//@access   Private
exports.updateRenting = async (req,res,next) => {
    try {
        let renting = await Renting.findById(req.param.id);
        if(!renting) {
            return res.status(404).json({success: false, message: `No renting with id of ${req.param.id}`});
        }

        if(Renting.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `user ${req.user.id} is not authorized to change this renting`})
        }

        renting = await Renting.findByIdAndUpdate(req.param.id, req.body, {new: true, runValidators: true});
        res.status(200).json({success: true, data: renting});
    }
    catch(err) {
        return res.status(500).json({success: false, message: "Cannot update renting information"});
    }
}

//@desc     Delete a Renting
//@route    DELETE /api/v1/Renting/:id
//@access   Private
exports.deleteRenting = async (req,res,next) => {
    try {
        const renting = await Renting.findById(req.param.id);

        if(!renting) return res.status(404).json({success: false, message:  `No renting with id of ${req.param.id}`});
        
        await Renting.deleteOne();
        res.status(200).json({success: true, data: {}});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({success: false, message: "Renting deletion is not completed"});
    }
}