// DTOs (Data Transfer Objects)

export const getUserProfile = (user) => {
  return {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    location: user.location,
    phoneNo: user.phoneNo,
    profilePicture: user.profilePicture?.URL || null,
  };
};
