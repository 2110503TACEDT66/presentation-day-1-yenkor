const User = require('../models/User');

//@desc    User Top up balance
//@route   POST /api/v1/topUp
//@access  Private

exports.topUp = async (req,res,next) => {
    try {
        if (req.body.balance <= 0) {
            return res.status(400).json({success: false, msg: 'The amount to be topped up must be greater than 0'});
        }
        const user = await User.findOneAndUpdate(
            { email: req.body.email },  // Topup to target account with target account's email
            { $inc: { balance: req.body.balance } }, // Increment the balance by the provided amount
            { new: true, runValidators: true } 
        );
    
        if (!user) {
          return res.status(400).json({ success: false , msg: `user with email: ${req.body.email} is not found`});
        }
    
        res.status(200).json({ success: true, data: user });
      } 
      catch (err) {
        res.status(400).json({ success: false });
      }
};

