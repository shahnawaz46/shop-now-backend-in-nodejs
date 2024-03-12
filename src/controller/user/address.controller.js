// internal
import { UserAddress } from '../../model/address.model.js';

export const addAddress = async (req, res) => {
  const userAddress = req.body;
  try {
    const userAddressAlready = await UserAddress.findOne({
      userId: req.data._id,
    });

    // if address is already present then push new address
    if (userAddressAlready) {
      const updatedAddress = await UserAddress.findOneAndUpdate(
        { userId: req.data._id },
        {
          $push: {
            address: userAddress,
          },
        },
        { new: true }
      );

      return res.status(200).json({
        msg: 'Address Added Successfully',
        address: updatedAddress.address,
      });
    } else {
      const newAddress = await UserAddress.create({
        userId: req.data._id,
        address: [userAddress],
      });

      return res
        .status(201)
        .json({ msg: 'Address Add Successfully', address: newAddress.address });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: 'something gone wrong please try again' });
  }
};

export const getAddress = async (req, res) => {
  try {
    const getUserAddress = await UserAddress.findOne({ userId: req.data._id });
    if (getUserAddress) {
      return res.status(200).json({ userAddress: getUserAddress.address });
    } else {
      return res.status(200).json({ userAddress: [] });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ msg: 'something gone wrong please try again' });
  }
};

export const updateAddress = async (req, res) => {
  // console.log(req.body)
  try {
    const updatedAddress = await UserAddress.findOneAndUpdate(
      { userId: req.data._id, 'address._id': req.body._id },
      { $set: { 'address.$': req.body } },
      { new: true }
    );

    return res.status(200).json({
      msg: 'Address Updated Successfully',
      address: updatedAddress.address,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: 'something gone wrong please try again' });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const updatedAddress = await UserAddress.findOneAndUpdate(
      { userId: req.data._id },
      { $pull: { address: { _id: req.params._id } } },
      { new: true }
    );

    return res.status(200).json({
      msg: 'Address Remove Successfully',
      address: updatedAddress.address,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ msg: 'something gone wrong please try again' });
  }
};
