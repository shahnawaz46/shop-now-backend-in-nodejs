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

export const searchCategory = async (req, res) => {
  const { search } = req.query;
  try {
    // .*: Matches any characters zero or more times (wildcard)
    // $options: 'i': Enables case-insensitive matching
    const category = await Category.find({
      $and: [
        { categoryName: { $regex: `${search}.*`, $options: 'i' } },
        { categoryName: { $nin: ["Men's Wardrobe", "Women's Wardrobe"] } }, // Exclude documents with name "Nothing"
      ],
    }).select('categoryName slug');

    return res.status(200).json({ result: category });
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};
