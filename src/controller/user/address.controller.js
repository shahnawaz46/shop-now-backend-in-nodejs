// internal
import { Address } from '../../model/address.model.js';
import { generateURL } from '../../utils/GenerateURL.js';
import { errorTemplate } from '../../utils/MailTemplate.js';
import { sendMail } from '../../utils/SendMail.js';

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
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Add Address',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
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
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Get Address',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
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
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Update Address',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params._id);

    return res.status(200).json({ msg: 'Address Remove Successfully' });
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Delete Address',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};
