export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductSpec {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sku?: string;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  category: string;
  quantity: number;
  specs: ProductSpec[];
  reviews: Review[];
  featured?: boolean;
  trending?: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  description: string;
}


export const PROMO_CODES: PromoCode[] = [
  { code: 'WELCOME10', discountType: 'percentage', value: 10, description: '10% discount for first-time buyers' }
];

const IS_SERVER = typeof window === 'undefined';

const getInitialDB = (key: string, defaultValue: any) => {
  if (IS_SERVER) return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setDB = (key: string, value: any) => {
  if (IS_SERVER) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

export const getStoredProducts = (): Product[] => {
  return getInitialDB('ec_products', PRODUCTS);
};

export const saveStoredProducts = (products: Product[]): void => {
  setDB('ec_products', products);
};

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  address: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  status: 'ordered' | 'packaging' | 'shipped' | 'out_for_delivery' | 'delivered';
  date: string;
  trackingNumber: string;
}

export const getStoredOrders = (userId: string): Order[] => {
  const allOrders = getInitialDB('ec_orders', []);
  return allOrders.filter((ord: Order) => ord.userId === userId);
};

export const getAllStoredOrders = (): Order[] => {
  return getInitialDB('ec_orders', []);
};

export const saveOrder = (order: Order): void => {
  const allOrders = getInitialDB('ec_orders', []);
  allOrders.unshift(order);
  setDB('ec_orders', allOrders);
};

export const updateOrderStatus = (orderId: string, status: Order['status']): void => {
  const allOrders = getInitialDB('ec_orders', []);
  const idx = allOrders.findIndex((ord: Order) => ord.id === orderId);
  if (idx !== -1) {
    allOrders[idx].status = status;
    setDB('ec_orders', allOrders);
  }
};

// export interface Review {
//   id: string;
//   author: string;
//   avatar: string;
//   rating: number;
//   comment: string;
//   date: string;
// }

// export interface ProductSpec {
//   name: string;
//   value: string;
// }

// export interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   originalPrice?: number;
//   rating: number;
//   reviewsCount: number;
//   images: string[];
//   category: string;
//   stock: number;
//   specs: ProductSpec[];
//   reviews: Review[];
//   featured?: boolean;
//   trending?: boolean;
// }

// export interface Category {
//   id: string;
//   name: string;
//   image: string;
//   description: string;
// }

// export interface PromoCode {
//   code: string;
//   discountType: 'percentage' | 'fixed';
//   value: number;
//   description: string;
// }

// export const CATEGORIES: Category[] = [
//   {
//     id: 'electronics',
//     name: 'Electronics & Gadgets',
//     image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
//     description: 'High-fidelity headphones, smartwatches, smartphones, and latest computing accessories.'
//   },
//   {
//     id: 'fashion',
//     name: 'Apparel & Fashion',
//     image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=80',
//     description: 'Premium everyday streetwear, athletic apparel, designer bags, and accessory collections.'
//   },
//   {
//     id: 'home',
//     name: 'Home & Living',
//     image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=80',
//     description: 'Minimalist designer lamps, ergonomic furniture, smart assistant appliances, and home decor.'
//   },
//   {
//     id: 'beauty',
//     name: 'Beauty & Skincare',
//     image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80',
//     description: 'Organic skin serums, luxury scents, makeup sets, and wellness remedies.'
//   },
//   {
//     id: 'sports',
//     name: 'Sports & Outdoors',
//     image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&auto=format&fit=crop&q=80',
//     description: 'Trekking gear, camping tools, water bottles, and intelligent exercise trackers.'
//   }
// ];

// export const PRODUCTS: Product[] = [
//   {
//     id: 'prod-1',
//     name: 'AeroSound Pro ANC Headphones',
//     description: 'Immerse yourself in pure acoustic bliss. Features hybrid active noise cancellation, custom-tuned 40mm dynamic drivers, and 45-hour battery life. Designed for seamless comfort with protein leather memory foam earcups.',
//     price: 249.99,
//     originalPrice: 299.99,
//     rating: 4.8,
//     reviewsCount: 142,
//     images: [
//       'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
//       'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
//       'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
//     ],
//     category: 'electronics',
//     stock: 25,
//     featured: true,
//     specs: [
//       { name: 'Driver Size', value: '40 mm Dynamic' },
//       { name: 'ANC Type', value: 'Hybrid Active (up to 42dB)' },
//       { name: 'Bluetooth Version', value: '5.2 (aptX Adaptive)' },
//       { name: 'Battery Life', value: 'Up to 45 Hours (ANC off)' },
//       { name: 'Charging Port', value: 'USB-C Fast Charging' }
//     ],
//     reviews: [
//       {
//         id: 'rev-1',
//         author: 'Alex Rivera',
//         avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
//         rating: 5,
//         comment: 'The ANC is absolutely mind-blowing. Better than headphones twice the price. Highly recommended!',
//         date: '2026-06-25'
//       },
//       {
//         id: 'rev-2',
//         author: 'Sarah Chen',
//         avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
//         rating: 4,
//         comment: 'Extremely comfortable for long flights. Sound signature is a bit bass-heavy but customizable via EQ.',
//         date: '2026-06-18'
//       }
//     ]
//   },
//   {
//     id: 'prod-2',
//     name: 'Chronos Smartwatch Series X',
//     description: 'Precision tracking meets elegant aesthetics. Chronos features an always-on AMOLED sapphire display, blood oxygen monitoring, multi-sport activity metrics, and wireless fast charge. Rated 5ATM waterproof.',
//     price: 189.99,
//     originalPrice: 219.99,
//     rating: 4.6,
//     reviewsCount: 98,
//     images: [
//       'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
//       'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
//     ],
//     category: 'electronics',
//     stock: 12,
//     trending: true,
//     specs: [
//       { name: 'Display', value: '1.43 in AMOLED Sapphire' },
//       { name: 'Sensors', value: 'HR, SpO2, Accelerometer, Gyro, GPS' },
//       { name: 'Water Resistance', value: '5 ATM (50m)' },
//       { name: 'Battery Life', value: 'Up to 7 Days typical use' },
//       { name: 'Material', value: 'Titanium bezel with silicone band' }
//     ],
//     reviews: [
//       {
//         id: 'rev-3',
//         author: 'Marcus Brody',
//         avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
//         rating: 5,
//         comment: 'Outstanding fitness tracker! The GPS locks on within seconds, and the screen looks premium.',
//         date: '2026-07-02'
//       }
//     ]
//   },
//   {
//     id: 'prod-3',
//     name: 'Nomad Premium Leather Backpack',
//     description: 'Meticulously crafted from full-grain vegetable-tanned leather, the Nomad features a dedicated padded laptop compartment (up to 16"), luggage passthrough strap, and quick-access pockets with magnetic closures.',
//     price: 159.00,
//     rating: 4.9,
//     reviewsCount: 76,
//     images: [
//       'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
//       'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80'
//     ],
//     category: 'fashion',
//     stock: 8,
//     featured: true,
//     specs: [
//       { name: 'Material', value: 'Full-Grain Vegetable-Tanned Leather' },
//       { name: 'Laptop Slot Size', value: 'Fits up to 16-inch laptops' },
//       { name: 'Volume Capacity', value: '22 Liters' },
//       { name: 'Hardware', value: 'YKK zipper, Brass hardware' },
//       { name: 'Weight', value: '1.2 kg' }
//     ],
//     reviews: [
//       {
//         id: 'rev-4',
//         author: 'Jane Foster',
//         avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
//         rating: 5,
//         comment: 'Stunning leather quality. It has aged beautifully in the 3 months I have owned it. Tons of compliments!',
//         date: '2026-05-14'
//       }
//     ]
//   },
//   {
//     id: 'prod-4',
//     name: 'Minimalist Matte Ceramic Lamp',
//     description: 'Cast a warm, tranquil glow over your modern space. Made from hand-thrown raw stoneware ceramic with a soft matte beige finish, paired with a natural textured flax linen shade. Dimmable smart switch integrated.',
//     price: 79.50,
//     originalPrice: 95.00,
//     rating: 4.7,
//     reviewsCount: 54,
//     images: [
//       'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
//       'https://images.unsplash.com/photo-1542728928-1413d1894ed1?w=800&auto=format&fit=crop&q=80'
//     ],
//     category: 'home',
//     stock: 19,
//     specs: [
//       { name: 'Material', value: 'Stoneware Ceramic & Linen' },
//       { name: 'Height', value: '18 inches' },
//       { name: 'Bulb Base', value: 'E26 (9W dimmable LED included)' },
//       { name: 'Cord Type', value: 'Braided fabric, 6ft' }
//     ],
//     reviews: [
//       {
//         id: 'rev-5',
//         author: 'Liam Davies',
//         avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
//         rating: 4,
//         comment: 'Fits the aesthetic of my living room perfectly. The dimming range is excellent. Love the linen shade.',
//         date: '2026-06-30'
//       }
//     ]
//   },
//   {
//     id: 'prod-5',
//     name: 'HydraGlow Peptide Recovery Serum',
//     description: 'Restore bounce and radiance overnight. A lightweight, fragrance-free formula supercharged with 5 active peptides, pure hyaluronic acid, and centella extract. Dermatologist tested and certified vegan.',
//     price: 38.00,
//     rating: 4.5,
//     reviewsCount: 215,
//     images: [
//       'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
//       'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=800&auto=format&fit=crop&q=80'
//     ],
//     category: 'beauty',
//     stock: 120,
//     trending: true,
//     specs: [
//       { name: 'Skin Concern', value: 'Dryness, fine lines, dull texture' },
//       { name: 'Key Ingredients', value: 'Peptides, Hyaluronic Acid, Centella Asiatica' },
//       { name: 'Volume Size', value: '50 ml / 1.7 fl.oz' },
//       { name: 'Free From', value: 'Parabens, sulfates, artificial fragrances' }
//     ],
//     reviews: [
//       {
//         id: 'rev-6',
//         author: 'Maya Lopez',
//         avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
//         rating: 5,
//         comment: 'My dry skin has never felt softer! It sinks in instantly without any greasy residue. Ordering a second bottle.',
//         date: '2026-07-04'
//       }
//     ]
//   },
//   {
//     id: 'prod-6',
//     name: 'Nomad Insulated Trail Flask',
//     description: 'Keeps drinks cold up to 24 hours or hot up to 12 hours. Constructed from double-wall vacuum insulated pro-grade stainless steel with a tough scratch-resistant powder coat and leaksafe flex cap.',
//     price: 34.00,
//     originalPrice: 39.99,
//     rating: 4.9,
//     reviewsCount: 180,
//     images: [
//       'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
//       'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&auto=format&fit=crop&q=80'
//     ],
//     category: 'sports',
//     stock: 45,
//     specs: [
//       { name: 'Material', value: '18/8 Pro-Grade Stainless Steel' },
//       { name: 'Liquid Volume', value: '32 oz (946 ml)' },
//       { name: 'Insulation', value: 'Double-wall vacuum TempShield' },
//       { name: 'Safety', value: 'BPA-free & Phthalate-free' }
//     ],
//     reviews: [
//       {
//         id: 'rev-7',
//         author: 'Dan Henderson',
//         avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80',
//         rating: 5,
//         comment: 'Holds ice solid for a whole day under hot sun during my hikes. Powder coating is super durable.',
//         date: '2026-07-01'
//       }
//     ]
//   },
//   {
//     id: 'prod-7',
//     name: 'AeroFit Performance Running Tees',
//     description: 'Engineered with dry-knit moisture-wicking technology to keep you dry and comfortable. Flatlock anti-chafe seams, reflective trim for dark conditions, and athletic cuts designed to moves with your pace.',
//     price: 45.00,
//     rating: 4.4,
//     reviewsCount: 62,
//     images: [
//       'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
//       'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800&auto=format&fit=crop&q=80'
//     ],
//     category: 'fashion',
//     stock: 50,
//     specs: [
//       { name: 'Material', value: '92% Polyester, 8% Elastane' },
//       { name: 'Fit Style', value: 'Athletic / Semi-fitted' },
//       { name: 'Care Type', value: 'Machine wash cold, tumble dry low' },
//       { name: 'Key features', value: 'Anti-odor treatment, reflective elements' }
//     ],
//     reviews: [
//       {
//         id: 'rev-8',
//         author: 'Thomas Wright',
//         avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
//         rating: 4,
//         comment: 'Very breathable. Does not drag when sweat-soaked. Fits perfectly round the shoulders.',
//         date: '2026-06-20'
//       }
//     ]
//   },
//   {
//     id: 'prod-8',
//     name: 'SoundBar Ultra Compact 360',
//     description: 'Transform your audio experience. Features full 360-degree acoustics, deep bass passive resonators, and dual Bluetooth multi-link pairing. Perfect for room-filling sound on the go. Dustproof/waterproof IP67 rated.',
//     price: 119.99,
//     originalPrice: 149.99,
//     rating: 4.7,
//     reviewsCount: 115,
//     images: [
//       'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
//       'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&auto=format&fit=crop&q=80'
//     ],
//     category: 'electronics',
//     stock: 30,
//     specs: [
//       { name: 'Audio Output', value: '24W Total Peak Power' },
//       { name: 'Battery Capacity', value: '5200mAh (Up to 15 hours)' },
//       { name: 'IP Rating', value: 'IP67 Waterproof/Dustproof' },
//       { name: 'Wireless Range', value: 'Up to 100 feet' }
//     ],
//     reviews: [
//       {
//         id: 'rev-9',
//         author: 'Emily Stone',
//         avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
//         rating: 5,
//         comment: 'Unbelievable volume from such a tiny speaker. Bass really hits when placed near a wall!',
//         date: '2026-06-12'
//       }
//     ]
//   }
// ];

// export const PROMO_CODES: PromoCode[] = [
//   {
//     code: 'WELCOME10',
//     discountType: 'percentage',
//     value: 10,
//     description: '10% discount on entire cart for first-time buyers'
//   },
//   {
//     code: 'SAVE20',
//     discountType: 'percentage',
//     value: 20,
//     description: '20% discount on order values of $150 or more'
//   },
//   {
//     code: 'FREESHIP50',
//     discountType: 'fixed',
//     value: 15.00,
//     description: 'Flat $15 discount representing free express shipping'
//   },
//   {
//     code: 'SUPER50',
//     discountType: 'percentage',
//     value: 50,
//     description: 'Super 50% discount for testing implementation features!'
//   }
// ];

// // Helper database functions to manage mock state persistence using simple window global or fallback
// const IS_SERVER = typeof window === 'undefined';

// const getInitialDB = (key: string, defaultValue: any) => {
//   if (IS_SERVER) return defaultValue;
//   try {
//     const data = localStorage.getItem(key);
//     return data ? JSON.parse(data) : defaultValue;
//   } catch (e) {
//     return defaultValue;
//   }
// };

// const setDB = (key: string, value: any) => {
//   if (IS_SERVER) return;
//   try {
//     localStorage.setItem(key, JSON.stringify(value));
//   } catch (e) {
//     console.error('Failed to save to localStorage', e);
//   }
// };

// export const getStoredProducts = (): Product[] => {
//   return getInitialDB('ec_products', PRODUCTS);
// };

// export const saveStoredProducts = (products: Product[]): void => {
//   setDB('ec_products', products);
// };

// export interface Order {
//   id: string;
//   userId: string;
//   items: {
//     productId: string;
//     name: string;
//     image: string;
//     price: number;
//     quantity: number;
//   }[];
//   subtotal: number;
//   discount: number;
//   tax: number;
//   shipping: number;
//   total: number;
//   address: {
//     name: string;
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
//     country: string;
//   };
//   paymentMethod: string;
//   status: 'ordered' | 'packaging' | 'shipped' | 'out_for_delivery' | 'delivered';
//   date: string;
//   trackingNumber: string;
// }

// export const getStoredOrders = (userId: string): Order[] => {
//   const allOrders = getInitialDB('ec_orders', []);
//   return allOrders.filter((ord: Order) => ord.userId === userId);
// };

// export const getAllStoredOrders = (): Order[] => {
//   return getInitialDB('ec_orders', []);
// };

// export const saveOrder = (order: Order): void => {
//   const allOrders = getInitialDB('ec_orders', []);
//   allOrders.unshift(order); // Newest first
//   setDB('ec_orders', allOrders);
// };

// export const updateOrderStatus = (orderId: string, status: Order['status']): void => {
//   const allOrders = getInitialDB('ec_orders', []);
//   const idx = allOrders.findIndex((ord: Order) => ord.id === orderId);
//   if (idx !== -1) {
//     allOrders[idx].status = status;
//     setDB('ec_orders', allOrders);
//   }
// };
