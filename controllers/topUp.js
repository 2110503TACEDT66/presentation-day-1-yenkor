const User = require('../models/User');

//@desc    User Top up balance
//@route   POST /api/v1/topUp
//@access  Private

exports.topUp = async (req,res,next) => {
    try {

      if (req.user.role != 'admin') {  // If user's role is not admin They can only topUp them self.
        const userId = req.user.id;
        const balance = req.body.balance;

        await addBalance(req, res, userId, balance);

        // if (req.body.balance <= 0) {
        //     return res.status(400).json({success: false, msg: 'The amount to be topped up must be greater than 0'});
        // }
        // const user = await User.findByIdAndUpdate(
        //     userId,  // If user's role is not admin Topup by specify only balance amount
        //     { $inc: { balance: req.body.balance } }, // Increment the balance by the provided amount
        //     { new: true, runValidators: true } 
        // );
    
        // if (!user) {
        //   return res.status(400).json({ success: false , msg: `user with email: ${req.body.email} is not found`});
        // }
    
        // res.status(200).json({ success: true, data: user });

      } 
      else { // If user's role is admin They can topUp to any user.
        const {userId, balance} = req.body;
        
        await addBalance(req, res, userId, balance);
      }
    }
    catch (error) {
      console.log(error);
      res.status(400).json({ success: false });
    }
};

async function addBalance(req, res, userId, amount) {
  try {
    if (amount <= 0) {
      return res.status(400).json({success: false, msg: 'The amount to be topped up must be greater than 0'});
    }
    const user = await User.findByIdAndUpdate(
        userId,  
        { $inc: { balance: amount } }, // Increment the balance by the provided amount
        { new: true, runValidators: true } 
    );

    if (!user) {
      return res.status(400).json({ success: false , msg: `user is not found`});
    }

    res.status(200).json({ success: true, data: user });
  }
  catch(error) {
    console.log(error);
    res.status(400).json({ success: false });
  }
}
  



