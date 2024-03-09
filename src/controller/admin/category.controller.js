import slugify from 'slugify';

// internal
import { Category } from '../../model/category.model.js';
import getAllCategory from '../../utils/getAllCategory.js';

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
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const getCategory = async (req, res) => {
  try {
    const allCategory = await Category.find({});
    if (allCategory) {
      const categoryList = getAllCategory(allCategory);

      return res.status(200).json({ categories: categoryList });
    }

    return res.status(404).json({ error: 'No Category Found' });
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete({ _id: req.body.categoryId });
    return res.status(200).json({ message: 'Category Deleted Successfully' });
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
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
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};
