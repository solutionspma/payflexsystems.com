// PayFlex Marketplace - Product Model

export const ProductSchema = {
  id: String,
  name: String,
  category: String,              // 'banner' | 'signage' | 'print' | 'apparel'
  basePrice: Number,             // In cents
  sizes: Array,                  // Available sizes
  weight: Number,                // In ounces
  dimensions: Object,            // { width, height, depth } in inches
  productionTime: Number,        // In business days
  requiresMockup: Boolean,
  status: String,                // 'active' | 'disabled'
  createdAt: Date
};

export class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.category = data.category;
    this.basePrice = data.basePrice;
    this.sizes = data.sizes || [];
    this.weight = data.weight;
    this.dimensions = data.dimensions;
    this.productionTime = data.productionTime || 5;
    this.requiresMockup = data.requiresMockup || false;
    this.status = data.status || 'active';
    this.createdAt = data.createdAt || new Date();
  }

  getPriceForSize(size) {
    // Size-based pricing logic
    return this.basePrice;
  }
}

/**
 * Predefined swag products
 */
export const SWAG_PRODUCTS = [
  {
    id: 'banner_retractable_33x80',
    name: 'Retractable Banner (33" x 80")',
    category: 'banner',
    basePrice: 12900, // $129
    weight: 96,
    dimensions: { width: 33, height: 80, depth: 4 },
    productionTime: 3,
    requiresMockup: true
  },
  {
    id: 'banner_standup_24x63',
    name: 'Stand-Up Banner (24" x 63")',
    category: 'banner',
    basePrice: 8900,
    weight: 48,
    dimensions: { width: 24, height: 63, depth: 3 },
    productionTime: 3,
    requiresMockup: true
  },
  {
    id: 'countertop_sign_11x8',
    name: 'Countertop Sign (11" x 8.5")',
    category: 'signage',
    basePrice: 3900,
    weight: 8,
    dimensions: { width: 11, height: 8.5, depth: 0.25 },
    productionTime: 2,
    requiresMockup: true
  },
  {
    id: 'window_cling_12x18',
    name: 'Window Cling (12" x 18")',
    category: 'signage',
    basePrice: 1900,
    weight: 2,
    dimensions: { width: 12, height: 18, depth: 0.01 },
    productionTime: 2,
    requiresMockup: false
  },
  {
    id: 'table_tent_8x5',
    name: 'Table Tent (8" x 5")',
    category: 'signage',
    basePrice: 900,
    weight: 1,
    dimensions: { width: 8, height: 5, depth: 0.1 },
    productionTime: 2,
    requiresMockup: false
  },
  {
    id: 'poster_18x24',
    name: 'Poster (18" x 24")',
    category: 'print',
    basePrice: 2500,
    weight: 4,
    dimensions: { width: 18, height: 24, depth: 0.01 },
    productionTime: 2,
    requiresMockup: true
  },
  {
    id: 'stickers_3x3_100',
    name: 'Stickers (3" x 3", 100 pack)',
    category: 'print',
    basePrice: 4900,
    weight: 8,
    dimensions: { width: 6, height: 6, depth: 1 },
    productionTime: 3,
    requiresMockup: true
  }
];
