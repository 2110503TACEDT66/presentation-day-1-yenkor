const Renting = require('../models/Renting');
const Provider = require('../models/CarProvider');
const User = require('../models/User');

//@desc     Get all renting
//@route    GET /api/v1/rentings
//@access   Public
exports.getRentings = async (req,res,next) => {
    let query;
    if(req.user.role == 'admin') {
        if(req.params.carProviderId) {
            query = Renting.find({user: req.user.carProviderId}).populate({
                path: 'carProvider',
                select: 'name address telephone price' //  Added price field to populate
            });
        }
        else {
            query = Renting.find().populate({
                path: 'carProvider',
                select: 'name address telephone price' //  Added price field to populate
            });
        }
    }
    else {
        query = Renting.find({user: req.user.id}).populate({
            path: 'carProvider',
            select: 'name address telephone price' //  Added price field to populate
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
//@route    GET /api/v1/rentings
//@access   Public
exports.getRenting = async (req,res,next) => {
    try{
        const renting = await Renting.findById(req.params.id).populate({
            path: 'carProvider',
            select: 'name address telephone price' //  Added price field to populate
        })

        if(!renting) return res.status(400).json({success: false, message: `No renting with the ID of ${req.params.id}`});

        res.status(200).json({success: true, data: renting});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({success: false, message: "Cannot find renting"});
    }
};

//@desc     Get near and overdue renting
//@route    GET /api/v1/rentings/nearandover
//@access   Public
exports.getOverdueRentings = async (req,res,next) => {
    let near,overdue;
    let today = new Date();
    let tomorrow = new Date();
    tomorrow.setDate(today.getDate()+1);
    if(req.user.role == 'admin') {
        near = Renting.find({rentTo: {$lte: tomorrow, $gte: today}});
        overdue = Renting.find({rentTo: {$lt: today}, returned: false});
    }
    else {
        near = Renting.find({user: req.user.id, rentTo: {$lte: tomorrow, $gte: today}});
        overdue = Renting.find({user: req.user.id, rentTo: {$lt: today}, returned: false});
    }
    near.populate({
        path: 'carProvider',
        select: 'name address telephone price'
    });
    overdue.populate({
        path: 'carProvider',
        select: 'name address telephone price'
    });

    try{
        const warn = await near;
        const over = await overdue;
        res.status(200).json({success: true, near: warn, overdue: over});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({success: false, message: "Cannot find renting"});
    }
};

//@desc     Make a Renting
//@route    POST /api/v1/carproviders/:carProviderId/rentings
//@access   Private
exports.addRenting = async (req,res,next) => {
    try {
        req.body.carProvider = req.params.carProviderId;

        const carProvider = await Provider.findById(req.params.carProviderId);
        if (!carProvider) return res.status(400).json({ success: false, message: `No car provider with the ID of ${req.params.id}` });
        
        // console.log(req);
        
        req.body.user = req.user.id;
        const existedRenting = await Renting.find({user: req.user.id});
        // const {rentDate, user} = req.body;
        
        /**************************** Deducted user's balance ************************** */
        const user = await User.findById(req.user.id);
        const isBalanceEnough = await user.checkBalance(carProvider.price);

        if (!isBalanceEnough && req.user.role != 'admin') {
            return res.status(400).json({success: false, message: `Your balance is not enough!`});
        }

        // const newBalance = user.setBalance(user.balance - carProvider.price);
        if (req.user.role != 'admin') {
            await user.updateOne( 
            { $inc: { balance: - carProvider.price } }
            );
        }
        
        /***************************************************************** */
        
        //renting limit
        if(existedRenting.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({success: false, message: `user ${req.user.id} has already made 3 rents`});
        }

        
        const {rentDate, rentTo, returned} = req.body;

        const renting = await Renting.create({  //rentDate, rentTo, user, carProvider, returned createAt
            rentDate,
            rentTo,
            user: req.body.user,
            carProvider: req.body.carProvider,
            returned
        });

        res.status(200).json({success: true, data: renting});
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({success: false, message: "Renting has not been made"});
    }
};

//@desc     Edit Renting
//@route    PUT /api/v1/rentings/:id
//@access   Private
exports.updateRenting = async (req, res, next) => {
    try {
        let renting = await Renting.findById(req.params.id);
        if (!renting) {
            return res.status(404).json({success: false, message: `No renting with id of ${req.params.id}`});
        }

        if(renting.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `user ${req.user.id} is not authorized to change this renting`})
        }

        renting = await Renting.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({success: true, data: renting});
    }
    catch(err) {
        return res.status(500).json({success: false, message: "Cannot update renting information"});
    }
}

//@desc     Delete a Renting
//@route    DELETE /api/v1/Renting/:id
//@access   Private
exports.deleteRenting = async (req,res,next) => { // Please Refund user's balance if User delete their renting
    try {
        const renting = await Renting.findById(req.params.id);

        if(!renting) return res.status(404).json({success: false, message:  `No renting with id of ${req.params.id}`});
        
        //Make sure user is the renting owner
        if (renting.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorize to delete this renting`});
        }

        const user = await User.findById(renting.user);
        const carProvider = await Provider.findById(renting.carProvider);

        await user.updateOne( 
            { $inc: { balance: carProvider.price } }
        );

        await renting.deleteOne();

        res.status(200).json({success: true, data: {}});
        
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({success: false, message: "Renting deletion is not completed"});
    }
}