import moment from 'moment';

// internal
import { LIMIT } from '../../constant/pagination.js';
import { User } from '../../model/user.model.js';
import { generateURL } from '../../utils/GenerateURL.js';
import sendMail from '../../services/mail.service.js';
import { errorTemplate } from '../../template/ErrorMailTemplate.js';

export const getAllUsers = async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const allUsers = await User.find({})
      .select('firstName lastName email role isEmailVerified lastLogin.date')
      .sort({ createdAt: -1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);

    // generate next url for pagination
    const nextURL = generateURL(req, `page=${parseInt(page) + 1}`, true);

    return res.status(200).json({
      next: allUsers.length < LIMIT ? null : nextURL,
      users: allUsers,
    });
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      '(Admin Panel) Error in Get All Users',
      errorTemplate(generateURL(req, '', true), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1; // months are 0 indexed
    const currentYear = new Date().getFullYear();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // $facet Operator allows us to run multiple pipelines in parallel and return multiple sets of data in a single aggregation.
    // 1st facets is usersInfo(for getting totalUsers, newUserCurrentMonth and activeUsers)
    // and 2nd facets is userGrowthGraph(for getting user monthly growth)
    const userData = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          newUserCurrentMonth: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$createdAt',
                    new Date(currentYear, currentMonth - 1, 1),
                  ],
                },
                1,
                0,
              ],
            },
          },
          activeUsers: {
            $sum: {
              $cond: [{ $gte: ['$lastLogin.date', thirtyDaysAgo] }, 1, 0],
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

    if (userData.length === 0) {
      return res.status(404).json({ error: 'No user stats found' });
    }

    // second calculating UserDemographics
    const allUsers = await User.find({});
    const currentDate = moment();
    const userDemographics = [
      { name: '<18', value: 0 },
      { name: '18-24', value: 0 },
      { name: '25-35', value: 0 },
      { name: '36-50', value: 0 },
      { name: '50+', value: 0 },
    ];

    for (let i = 0; i < allUsers.length; i++) {
      const dobDate = moment(allUsers[i].dob);
      const differenceInYears = currentDate.diff(dobDate, 'years');
      if (differenceInYears < 18) {
        userDemographics[0].value++;
      } else if (differenceInYears >= 18 && differenceInYears <= 24) {
        userDemographics[1].value++;
      } else if (differenceInYears >= 25 && differenceInYears <= 35) {
        userDemographics[2].value++;
      } else if (differenceInYears >= 36 && differenceInYears <= 50) {
        userDemographics[3].value++;
      } else if (differenceInYears > 50) {
        userDemographics[4].value++;
      }
    }

    const userStats = {
      ...userData[0],
      userDemographics,
    };

    return res.status(200).json({ ...userStats });
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      '(Admin Panel) Error in Get User Stats',
      errorTemplate(generateURL(req, '', true), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const getUserGrowthGraph = async (req, res) => {
  const currentYear = new Date().getFullYear();

  let year = req.query.year;
  year = year ? parseInt(year) : currentYear;

  try {
    const userGrowthGraph = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          users: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          users: 1,
        },
      },
    ]);

    // graph with initial value
    const monthGraph = [
      { month: 'Jan', users: 0 },
      { month: 'Feb', users: 0 },
      { month: 'Mar', users: 0 },
      { month: 'Apr', users: 0 },
      { month: 'May', users: 0 },
      { month: 'Jun', users: 0 },
      { month: 'Jul', users: 0 },
      { month: 'Aug', users: 0 },
      { month: 'Sep', users: 0 },
      { month: 'Oct', users: 0 },
      { month: 'Nov', users: 0 },
      { month: 'Dec', users: 0 },
    ];

    userGrowthGraph.forEach((data) => {
      const monthIndex = data.month - 1;
      monthGraph[monthIndex].users = data.users;
    });

    return res.status(200).json({ monthGraph });
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      '(Admin Panel) Error in Search Users',
      errorTemplate(generateURL(req, '', true), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
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
      .select('firstName lastName email role isEmailVerified lastLogin.date')
      .sort({ createdAt: -1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);

    const nextURL = generateURL(req, `query=${query}&page=${page + 1}`, true);

    return res
      .status(200)
      .json({ next: users.length < LIMIT ? null : nextURL, users });
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      '(Admin Panel) Error in Search Users',
      errorTemplate(generateURL(req, '', true), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(200)
        .json({ msg: 'User already deleted or User Not found' });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({ msg: 'User deleted Successfully' });
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      '(Admin Panel) Error in Search Users',
      errorTemplate(generateURL(req, '', true), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};
