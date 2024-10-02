import { migration, updateFields, updateOrderSales } from './Migration.js';

export const allScript = () => {
  // migration();
  // updateFields();
  updateOrderSales();
};
