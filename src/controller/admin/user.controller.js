import { LIMIT } from '../../constant/pagination.js';
import { User } from '../../model/user.model.js';
import { generateURL } from '../../utils/GenerateURL.js';

export const getAllUsers = async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const allUsers = await User.find({})
      .select('firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);

    // generate next url for pagination
    const nextURL = generateURL(req, `page=${parseInt(page) + 1}`, true);

    return res.status(200).json({
      next: allUsers.length < LIMIT ? null : nextURL,
      users: allUsers,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const getUserStats = async (req, res) => {
  try {
    // first calculating total users, new users, active users
    // const userData = await User.aggregate([{}]);
    return res.status(200).json({ msg: 'done' });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const searchUsers = async (req, res) => {
  const { query, page = 1 } = req.query;

  try {
    // 'i': This option makes the regex search case-insensitive ex: PANT, Pant, pant
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);

    const nextURL = generateURL(req, `query=${query}&page=${page + 1}`, true);

    return res
      .status(200)
      .json({ next: users.length < LIMIT ? null : nextURL, users });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};
