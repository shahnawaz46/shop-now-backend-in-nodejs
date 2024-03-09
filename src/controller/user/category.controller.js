// internal
import { Category } from '../../model/category.model.js';
import getAllCategory from '../../utils/getAllCategory.js';

export const getCategory = async (req, res) => {
  const { slug } = req.params;
  try {
    const allCategory = await Category.find({});
    if (allCategory) {
      const categoryList = getAllCategory(allCategory, null, slug);

      return res.status(200).json({ categories: categoryList });
    }

    return res.status(404).json({ error: 'No Category Found' });
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};
