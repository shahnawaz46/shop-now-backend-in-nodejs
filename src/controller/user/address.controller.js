// internal
import { Address } from '../../model/address.model.js';

export const addAddress = async (req, res) => {
  const userAddress = req.body;
  const addressDetails = { userId: req.data._id, ...userAddress };

  try {
    const address = await Address.create(addressDetails);

    return res.status(200).json({
      msg: 'Address Added Successfully',
      address,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: 'something gone wrong please try again', error });
  }
};

export const getAddress = async (req, res) => {
  try {
    const address = await Address.find({ userId: req.data._id });
    if (address) {
      return res.status(200).json({ userAddress: address });
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
  try {
    const updatedAddress = await Address.findByIdAndUpdate(
      req.body._id,
      { $set: { ...req.body } },
      { new: true }
    );

    return res.status(200).json({
      msg: 'Address Updated Successfully',
      address: updatedAddress,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: 'something gone wrong please try again' });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params._id);

    return res.status(200).json({ msg: 'Address Remove Successfully' });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: 'something gone wrong please try again' });
  }
};
