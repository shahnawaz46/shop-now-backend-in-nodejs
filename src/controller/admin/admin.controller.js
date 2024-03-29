import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// internal
import { Admin } from '../../model/admin.model.js';

const hashPassword = (password) => {
  console.log(bcrypt.hashSync(password, 15));
};

// hashPassword('shanudev');

// export const signup = async (req, res) => {
//     const { fullName, email, phoneNo, password, cpassword } = req.body

//     try {
//         const admin = await Admin.findOne({ email })
//         if (admin) {
//             return res.status(400).json({ message: "admin already exist" })
//         }

//         const user = new Admin({ fullName, email, phoneNo, password, cpassword })
//         await user.save()
//         return res.status(200).json({ message: "registerd successfully" })

//     } catch (err) {
//         console.log(err)
//         return res.status(400).json({ message: "something gone wrong please try again" })
//     }
// }

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (admin && admin.role === 'admin') {
      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (passwordMatch) {
        const token = jwt.sign(
          { _id: admin._id, role: admin.role },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
        res.cookie('token', token, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        });

        return res.status(200).json({ message: 'Login Successfully' });
      }

      return res.status(400).json({ error: 'Invalid credential' });
    }

    return res.status(404).json({ error: 'No Account Found Please Try Again' });
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const signout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Signout Successfully' });
};
