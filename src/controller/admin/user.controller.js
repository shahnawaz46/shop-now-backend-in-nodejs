import { LIMIT } from '../../constant/pagination.js';
import { User } from '../../model/user.model.js';
import { generateURL } from '../../utils/GenerateURL.js';

export const getAllUsers = async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const allUsers = await User.find({})
      .select('firstName lastName email role isEmailVerified')
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
    const currentMonth = new Date().getMonth() + 1; // months are 0 indexed
    const currentYear = new Date().getFullYear();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // first calculating total users, new users, active users
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          newUserCurrentMonth: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gte: [
                        '$createdAt',
                        new Date(currentYear, currentMonth - 1, 1),
                      ],
                    },
                    {
                      $lt: [
                        '$createdAt',
                        new Date(currentYear, currentMonth, 1),
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          activeUsers: {
            $sum: {
              $cond: [{ $gte: ['$lastLogin', thirtyDaysAgo] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalUsers: 1,
          newUserCurrentMonth: 1,
          activeUsers: 1,
        },
      },
    ]);
    return res.status(200).json({ userStats: userStats?.[0] || {} });
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
      .select('firstName lastName email role isEmailVerified')
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
