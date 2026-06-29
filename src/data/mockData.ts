import { Product, Order, Customer, StoreSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Ultra-wide Curved Monitor 34"',
    description: 'High performance ultra-wide 144Hz curved screen, perfect for productivity and immersive gaming.',
    price: 599.99,
    stock: 14,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    status: 'Active',
    sku: 'MON-34-UW',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'prod-2',
    name: 'Minimalist Mechanical Keyboard 65%',
    description: 'Anodized aluminum frame, hot-swappable linear switches, and customized keycaps with PBT material.',
    price: 129.99,
    stock: 45,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    status: 'Active',
    sku: 'KEY-MECH-65',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'prod-3',
    name: 'Ergonomic Premium Office Chair',
    description: 'Fully adjustable mesh high-back chair with adaptive lumbar support, dynamic 3D armrests, and headrest.',
    price: 349.99,
    stock: 4,
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    status: 'Active',
    sku: 'CHR-ERGO-01',
    images: [
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'prod-4',
    name: 'Active Noise Cancelling Headphones',
    description: 'Studio-quality wireless audio with custom noise cancelling processors, 40-hour battery life, and spatial support.',
    price: 249.99,
    stock: 28,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    status: 'Active',
    sku: 'ANC-HEAD-X2',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'prod-5',
    name: 'Full-Grain Leather Travel Backpack',
    description: 'Handcrafted weatherproof leather backpack featuring padded 16" laptop sleeve and quick-access pockets.',
    price: 189.50,
    stock: 12,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    status: 'Active',
    sku: 'BP-LTHR-TRV'
  },
  {
    id: 'prod-6',
    name: 'USB-C Multi-port Pro Hub',
    description: 'Premium aluminum hub featuring 4K HDMI, Gigabit Ethernet, SD readers, and 100W Power Delivery pass-through.',
    price: 49.99,
    stock: 60,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    status: 'Active',
    sku: 'HUB-USBC-8P'
  },
  {
    id: 'prod-7',
    name: 'Scented Organic Soy Wax Candle',
    description: 'Eco-friendly natural soy wax with premium essential oils of cedarwood, amber, and patchouli.',
    price: 24.00,
    stock: 3,
    category: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    status: 'Active',
    sku: 'CDL-SOY-SNT'
  },
  {
    id: 'prod-8',
    name: 'Fine Merino Wool Knit Sweater',
    description: 'Ultra-soft, temperature-regulating pure Merino wool sweater in classic navy grey, tailored fit.',
    price: 85.00,
    stock: 0,
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    status: 'Draft',
    sku: 'SWT-WOL-KNIT'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60',
    joinDate: '2025-11-12T09:15:00Z',
    totalOrders: 5,
    totalSpend: 1245.98,
    status: 'Active'
  },
  {
    id: 'cust-2',
    name: 'Michael Chen',
    email: 'm.chen@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
    joinDate: '2026-01-20T14:40:00Z',
    totalOrders: 3,
    totalSpend: 589.50,
    status: 'Active'
  },
  {
    id: 'cust-3',
    name: 'Emily Rodriguez',
    email: 'emily.r@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60',
    joinDate: '2025-08-05T10:22:00Z',
    totalOrders: 8,
    totalSpend: 2410.00,
    status: 'Active'
  },
  {
    id: 'cust-4',
    name: 'David Kim',
    email: 'd.kim@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60',
    joinDate: '2026-05-18T16:05:00Z',
    totalOrders: 1,
    totalSpend: 99.99,
    status: 'Active'
  },
  {
    id: 'cust-5',
    name: 'Jessica Taylor',
    email: 'jess.t@example.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60',
    joinDate: '2026-06-25T11:10:00Z',
    totalOrders: 0,
    totalSpend: 0.00,
    status: 'Active'
  },
  {
    id: 'cust-6',
    name: 'James Wilson',
    email: 'j.wilson@example.com',
    avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150&auto=format&fit=crop&q=60',
    joinDate: '2025-05-02T13:12:00Z',
    totalOrders: 2,
    totalSpend: 350.00,
    status: 'Suspended'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-9204',
    customerName: 'Emily Rodriguez',
    customerEmail: 'emily.r@example.com',
    items: [
      {
        productId: 'prod-3',
        productName: 'Ergonomic Premium Office Chair',
        price: 349.99,
        quantity: 1
      }
    ],
    status: 'Shipped',
    date: '2026-06-28T14:30:00Z',
    total: 399.99, // price + tax/shipping
    paymentMethod: 'Credit Card',
    shippingAddress: '456 Redwood Ave, San Francisco, CA 94107',
    tags: ['Priority', 'International']
  },
  {
    id: 'ORD-9192',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    items: [
      {
        productId: 'prod-6',
        productName: 'USB-C Multi-port Pro Hub',
        price: 49.99,
        quantity: 1
      },
      {
        productId: 'prod-2',
        productName: 'Minimalist Mechanical Keyboard 65%',
        price: 129.99,
        quantity: 1
      }
    ],
    status: 'Delivered',
    date: '2026-06-25T09:15:00Z',
    total: 204.98,
    paymentMethod: 'PayPal',
    shippingAddress: '789 Oak Lane, Seattle, WA 98101',
    tags: ['Wholesale']
  },
  {
    id: 'ORD-9181',
    customerName: 'Michael Chen',
    customerEmail: 'm.chen@example.com',
    items: [
      {
        productId: 'prod-4',
        productName: 'Active Noise Cancelling Headphones',
        price: 249.99,
        quantity: 1
      }
    ],
    status: 'Processing',
    date: '2026-06-29T10:00:00Z',
    total: 284.99,
    paymentMethod: 'Apple Pay',
    shippingAddress: '122 Maple St, Boston, MA 02108',
    tags: ['Priority']
  },
  {
    id: 'ORD-9170',
    customerName: 'David Kim',
    customerEmail: 'd.kim@example.com',
    items: [
      {
        productId: 'prod-5',
        productName: 'Full-Grain Leather Travel Backpack',
        price: 189.50,
        quantity: 1
      },
      {
        productId: 'prod-7',
        productName: 'Scented Organic Soy Wax Candle',
        price: 24.00,
        quantity: 2
      }
    ],
    status: 'Pending',
    date: '2026-06-29T12:45:00Z',
    total: 257.50,
    paymentMethod: 'Credit Card',
    shippingAddress: '101 Pine Rd, Austin, TX 78701',
    tags: []
  },
  {
    id: 'ORD-9162',
    customerName: 'Emily Rodriguez',
    customerEmail: 'emily.r@example.com',
    items: [
      {
        productId: 'prod-1',
        productName: 'Ultra-wide Curved Monitor 34"',
        price: 599.99,
        quantity: 2
      }
    ],
    status: 'Delivered',
    date: '2026-06-20T16:20:00Z',
    total: 1259.98,
    paymentMethod: 'Bank Transfer',
    shippingAddress: '456 Redwood Ave, San Francisco, CA 94107',
    tags: ['Wholesale', 'International']
  }
];

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'AeroTech Systems',
  supportEmail: 'ops@aerotech.io',
  currency: 'USD',
  taxRate: 8.5,
  shippingFee: 15.00,
  lowStockThreshold: 5
};
