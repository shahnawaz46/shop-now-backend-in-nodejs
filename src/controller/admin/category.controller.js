import slugify from 'slugify';

// internal
import { Category } from '../../model/category.model.js';
import { getAllCategory } from '../../utils/Category.js';
import sendMail from '../../services/mail.service.js';
import { errorTemplate } from '../../template/ErrorMailTemplate.js';
import { generateURL } from '../../utils/GenerateURL.js';

export const createCategory = async (req, res) => {
  try {
    const categoryObj = {
      categoryName: req.body.categoryName,
      slug: slugify(req.body.categoryName),
    };

    if (req.body.parentCategoryId) {
      categoryObj.parentCategoryId = req.body.parentCategoryId;
    }

    const category = new Category(categoryObj);
    category.save((error, product) => {
      if (error) {
        return res
          .status(400)
          .json({ error: 'Category Already Exist Please Use Another Name' });
      }
      if (product) {
        return res
          .status(200)
          .json({ message: 'Category Created Successfully' });
      }
    });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Create Category',
        errorTemplate(generateURL(req, '', true), error.message)
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

export const getCategory = async (req, res) => {
  try {
    const allCategory = await Category.find({
      categoryName: {
        $nin: ["Men's Wardrobe", "Women's Wardrobe"],
      },
    }).select('categoryName');
    if (allCategory) {
      // const categoryList = getAllCategory(allCategory);

      return res.status(200).json({
        categories: allCategory,
        targetAudience: [{ name: 'Men' }, { name: 'Women' }],
      });
    }

    return res.status(404).json({ error: 'No Category Found' });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Get Category',
        errorTemplate(generateURL(req, '', true), error.message)
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

export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete({ _id: req.body.categoryId });
    return res.status(200).json({ message: 'Category Deleted Successfully' });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Delete Category',
        errorTemplate(generateURL(req, '', true), error.message)
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

export const editCategory = async (req, res) => {
  const { _id, categoryName, parentCategoryId } = req.body;
  try {
    const categoryObj = {
      categoryName,
      slug: slugify(categoryName),
    };
    if (parentCategoryId) {
      categoryObj.parentCategoryId = parentCategoryId;
    }
    await Category.findByIdAndUpdate({ _id }, categoryObj, {
      new: true,
    });
    return res.status(200).json({ message: 'Category Edit Successfully' });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Edit/Update Category',
        errorTemplate(generateURL(req, '', true), error.message)
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
