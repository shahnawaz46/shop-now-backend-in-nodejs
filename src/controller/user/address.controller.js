// internal
import { Address } from '../../model/address.model.js';
import { generateURL } from '../../utils/GenerateURL.js';
import sendMail from '../../services/mail.service.js';
import { errorTemplate } from '../../template/ErrorMailTemplate.js';

export const addAddress = async (req, res) => {
  const userAddress = req.body;
  const addressDetails = { userId: req.data._id, ...userAddress };

  try {
    const addressAdded = await Address.create(addressDetails);
    const address = await Address.findById(addressAdded._id).select(
      'name mobileNumber pinCode state address locality cityDistrictTown landmark alternatePhone addressType'
    );

    return res.status(200).json({
      msg: 'Address Added Successfully',
      address,
    });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in Add Address',
        errorTemplate(generateURL(req), error.message)
      );
    } else {
      console.log(error);
    }

    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const getAddress = async (req, res) => {
  try {
    const address = await Address.find({ userId: req.data._id }).select(
      'name mobileNumber pinCode state address locality cityDistrictTown landmark alternatePhone addressType'
    );

    if (address) {
      return res.status(200).json({ userAddress: address });
    } else {
      return res.status(200).json({ userAddress: [] });
    }
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in Get Address',
        errorTemplate(generateURL(req), error.message)
      );
    } else {
      console.log(error);
    }

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
    ).select(
      'name mobileNumber pinCode state address locality cityDistrictTown landmark alternatePhone addressType'
    );

    return res.status(200).json({
      msg: 'Address Updated Successfully',
      address: updatedAddress,
    });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in Update Address',
        errorTemplate(generateURL(req), error.message)
      );
    } else {
      console.log(error);
    }

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
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in Delete Address',
        errorTemplate(generateURL(req), error.message)
      );
    } else {
      console.log(error);
    }

    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};
