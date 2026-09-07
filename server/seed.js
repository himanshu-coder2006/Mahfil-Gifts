import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Coupon from './models/Coupon.js';
import Admin from './models/Admin.js';
import Collection from './models/Collection.js';
import Occasion from './models/Occasion.js';
import Review from './models/Review.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const LOCAL_MONGO = 'mongodb://127.0.0.1:27017/mahfilifts';
const PRIMARY_MONGO = process.env.MONGO_URI || process.env.MONGODB_URI || LOCAL_MONGO;

const connect = async () => {
  try {
    await mongoose.connect(PRIMARY_MONGO, { serverSelectionTimeoutMS: 8000 });
  } catch (error) {
    console.warn(`Primary database unreachable (${error.message}). Using local MongoDB.`);
    await mongoose.connect(LOCAL_MONGO, { serverSelectionTimeoutMS: 8000 });
  }
};

const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const seed = async () => {
  await connect();

  await User.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Coupon.deleteMany({});
  await Admin.deleteMany({});
  await Collection.deleteMany({});
  await Occasion.deleteMany({});
  await Review.deleteMany({});

  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
  const admin = await Admin.create({
    name: 'Mahfilifts Admin',
    email: process.env.ADMIN_EMAIL || 'admin@mahfilifts.com',
    password: adminPassword,
    role: 'super-admin',
  });

  const customer = await User.create({
    name: 'Demo Customer',
    email: 'customer@mahfilifts.com',
    mobile: '9999999999',
    password: await bcrypt.hash('Customer@123', 10),
    isVerified: true,
  });

  const categories = await Category.insertMany([
    { name: 'Bags & Totes', slug: 'bags-totes', description: 'Personalised bags, totes and box bags.', image: IMG('photo-1590874103328-eac38a683ce7'), status: true },
    { name: 'Wallets & Pouches', slug: 'wallets-pouches', description: 'Printed pouches and personalised wallets.', image: IMG('photo-1627123424574-724758594e93'), status: true },
    { name: 'Drinkware', slug: 'drinkware', description: 'Mugs, bottles and personalised drinkware.', image: IMG('photo-1495474472287-4d71bcdd2085'), status: true },
    { name: 'Home Decor', slug: 'home-decor', description: 'Cushions, lamps, frames and wall hangings.', image: IMG('photo-1507473885765-e6ed057f782c'), status: true },
    { name: 'Jewellery', slug: 'jewellery', description: 'Personalised necklaces and jewellery boxes.', image: IMG('photo-1515562141207-7a88fb7ce338'), status: true },
    { name: 'Kids', slug: 'kids', description: 'Bags, bottles and hampers made for little ones.', image: IMG('photo-1553062407-98eeb64c6a62'), status: true },
    { name: 'Travel', slug: 'travel', description: 'Passport covers, eye masks and neck pillows.', image: IMG('photo-1488646953014-85cb44e25828'), status: true },
    { name: 'Personalised Gifts', slug: 'personalised-gifts', description: 'Name engraved gifts for any occasion.', image: IMG('photo-1601925260368-ae2f83cf8b7f'), status: true },
  ]);

  const cat = (slug) => categories.find((c) => c.slug === slug)?._id;

  const products = [
    {
      name: 'Customized Floral Printed Black & White Handheld Box Bag', slug: 'customized-floral-printed-black-white-handheld-box-bag',
      category: cat('bags-totes'), brand: 'Mahfilifts', price: 1299, originalPrice: 2999, discount: 56, stock: 48,
      shortDescription: 'A chic box tote with a timeless black & white floral print, personalised with your name.',
      description: 'Carry a head-turner everywhere. This handheld box bag blends a classic monochrome floral print, a spacious structured silhouette and a personalised name — perfect for everyday use, gifting or travel.',
      images: [IMG('photo-1590874103328-eac38a683ce7'), IMG('photo-1548036328-c9fa89d128fa'), IMG('photo-1483985988355-763728e1935b')],
      thumbnail: IMG('photo-1590874103328-eac38a683ce7'),
      tags: ['box bag', 'tote', 'personalised', 'bestseller', 'women'], rating: 4.8, reviewCount: 436,
      featured: true, bestseller: true, newArrival: true,
    },
    {
      name: 'Personalised Geometric Printed Box Tote Bag Combo Gift Set', slug: 'personalised-geometric-printed-box-tote-bag-combo',
      category: cat('bags-totes'), brand: 'Mahfilifts', price: 1899, originalPrice: 3499, discount: 45, stock: 26,
      shortDescription: 'Matching box tote + pouch combo with a bold geometric print.',
      description: 'A stylish two-piece gift set — a roomy geometric-printed box tote with a matching pouch. Personalise both with your name for a gift that feels exclusive.',
      images: [IMG('photo-1483985988355-763728e1935b'), IMG('photo-1590874103328-eac38a683ce7'), IMG('photo-1441986300917-64674bd600d8')],
      thumbnail: IMG('photo-1483985988355-763728e1935b'),
      tags: ['gift set', 'combo', 'box bag', 'tote'], rating: 4.7, reviewCount: 21,
      featured: true, bestseller: true,
    },
    {
      name: 'Black & White Animal Printed Box Pouch', slug: 'black-white-animal-printed-box-pouch',
      category: cat('wallets-pouches'), brand: 'Mahfilifts', price: 499, originalPrice: 1499, discount: 66, stock: 80,
      shortDescription: 'Compact and classy — a printed box pouch that tucks into any bag.',
      description: 'A premium-feel box pouch with a playful zebra print. Perfect for organising daily essentials and small enough to carry anywhere.',
      images: [IMG('photo-1590874103328-eac38a683ce7'), IMG('photo-1627123424574-724758594e93'), IMG('photo-1548036328-c9fa89d128fa')],
      thumbnail: IMG('photo-1590874103328-eac38a683ce7'),
      tags: ['pouch', 'box pouch', 'unisex'], rating: 4.5, reviewCount: 64,
      featured: true, bestseller: true,
    },
    {
      name: 'Beautiful Girl Printed Box Pouch', slug: 'beautiful-girl-printed-box-pouch',
      category: cat('wallets-pouches'), brand: 'Mahfilifts', price: 499, originalPrice: 1499, discount: 66, stock: 90,
      shortDescription: 'Illustrated pouch with a bold artistic girl print.',
      description: 'Bold, vibrant and soft to the touch. This illustrated box pouch makes organising essentials feel fun. Excellent value at this price.',
      images: [IMG('photo-1522335789203-aabd1fc54bc9'), IMG('photo-1548036328-c9fa89d128fa'), IMG('photo-1627123424574-724758594e93')],
      thumbnail: IMG('photo-1522335789203-aabd1fc54bc9'),
      tags: ['pouch', 'women', 'makeup bag'], rating: 4.6, reviewCount: 64,
      bestseller: true, newArrival: true,
    },
    {
      name: 'Customized Geometric Printed Canvas Shoulder Bag', slug: 'customized-geometric-printed-canvas-shoulder-bag',
      category: cat('bags-totes'), brand: 'Mahfilifts', price: 1299, originalPrice: 2999, discount: 56, stock: 34,
      shortDescription: 'Structured canvas shoulder bag with a modern geometric print.',
      description: 'A sturdy canvas shoulder bag with a clean geometric print and a comfortable adjustable strap. Built for daily commutes and work bags.',
      images: [IMG('photo-1553062407-98eeb64c6a62'), IMG('photo-1590874103328-eac38a683ce7'), IMG('photo-1548036328-c9fa89d128fa')],
      thumbnail: IMG('photo-1553062407-98eeb64c6a62'),
      tags: ['shoulder bag', 'canvas', 'office bag'], rating: 4.4, reviewCount: 136,
      featured: true, bestseller: true,
    },
    {
      name: 'Customized Grey Jungle Printed Green Handheld Box Bag', slug: 'customized-grey-jungle-printed-green-box-bag',
      category: cat('bags-totes'), brand: 'Mahfilifts', price: 1299, originalPrice: 2999, discount: 56, stock: 41,
      shortDescription: 'Jungle-inspired print in earthy tones, personalised to order.',
      description: 'An expressive jungle-inspired print on a structured box bag. Personalised with the name of your choice to make it exclusively yours.',
      images: [IMG('photo-1445205170230-053b83016050'), IMG('photo-1590874103328-eac38a683ce7'), IMG('photo-1483985988355-763728e1935b')],
      thumbnail: IMG('photo-1445205170230-053b83016050'),
      tags: ['box bag', 'green', 'personalised', 'women'], rating: 4.7, reviewCount: 436,
      featured: true, bestseller: true,
    },
    {
      name: 'Personalised Animal Printed Box Bag Combo Gift Set', slug: 'personalised-animal-printed-box-bag-combo',
      category: cat('bags-totes'), brand: 'Mahfilifts', price: 1999, originalPrice: 3499, discount: 43, stock: 22,
      shortDescription: 'Matching set of box bag, pouch and accessories in one curated combo.',
      description: 'A complete curated combo — box bag, pouch and travel accessories in a matching print. One gift box, everything she needs.',
      images: [IMG('photo-1488646953014-85cb44e25828'), IMG('photo-1483985988355-763728e1935b'), IMG('photo-1590874103328-eac38a683ce7')],
      thumbnail: IMG('photo-1488646953014-85cb44e25828'),
      tags: ['gift set', 'combo', 'travel', 'bestseller'], rating: 4.8, reviewCount: 21,
      featured: true, bestseller: true,
    },
    {
      name: 'Personalised Peacock Printed Box Pouch', slug: 'personalised-peacock-printed-box-pouch',
      category: cat('wallets-pouches'), brand: 'Mahfilifts', price: 499, originalPrice: 1499, discount: 66, stock: 57,
      shortDescription: 'Pastel peacock artwork with a refined, elegant finish.',
      description: 'Graceful pastel peacock artwork printed on a durable box pouch — compact, classy and totally worth it.',
      images: [IMG('photo-1522335789203-aabd1fc54bc9'), IMG('photo-1548036328-c9fa89d128fa'), IMG('photo-1627123424574-724758594e93')],
      thumbnail: IMG('photo-1522335789203-aabd1fc54bc9'),
      tags: ['pouch', 'peacock', 'pastel'], rating: 4.6, reviewCount: 64,
      newArrival: true,
    },
    {
      name: 'Personalised Name Engraved Leather Wallet', slug: 'personalised-name-engraved-leather-wallet',
      category: cat('wallets-pouches'), brand: 'Mahfilifts', price: 799, originalPrice: 1999, discount: 60, stock: 38,
      shortDescription: 'Slim genuine-leather wallet with a personalised name stamp.',
      description: 'A clean, slim leather wallet that looks even better with a name embossed on the pocket. A thoughtful gift for him.',
      images: [IMG('photo-1627123424574-724758594e93'), IMG('photo-1548036328-c9fa89d128fa'), IMG('photo-1590874103328-eac38a683ce7')],
      thumbnail: IMG('photo-1627123424574-724758594e93'),
      tags: ['wallet', 'mens', 'leather', 'personalised'], rating: 4.5, reviewCount: 89,
      featured: true, bestseller: true,
    },
    {
      name: 'Customizable Premium Leather Travel Wallet', slug: 'customizable-premium-leather-travel-wallet',
      category: cat('wallets-pouches'), brand: 'Mahfilifts', price: 999, originalPrice: 2299, discount: 56, stock: 19,
      shortDescription: 'Organised travel wallet with card slots and a passport sleeve.',
      description: 'From boarding passes to foreign currency — everything in one place. Add a name to make it the ultimate travel companion.',
      images: [IMG('photo-1627123424574-724758594e93'), IMG('photo-1488646953014-85cb44e25828'), IMG('photo-1553062407-98eeb64c6a62')],
      thumbnail: IMG('photo-1627123424574-724758594e93'),
      tags: ['wallet', 'travel wallet', 'mens'], rating: 4.6, reviewCount: 32,
      featured: true,
    },
    {
      name: 'Personalised Photo Ceramic Mug', slug: 'personalised-photo-ceramic-mug',
      category: cat('drinkware'), brand: 'Mahfilifts', price: 399, originalPrice: 999, discount: 60, stock: 112,
      shortDescription: 'Print any photo or name on a glossy ceramic mug.',
      description: 'Turn a favourite photo into a mug they will use every day. High-definition print on a sturdy 350ml ceramic mug — dishwasher safe.',
      images: [IMG('photo-1514228742587-6b1558fcca3d'), IMG('photo-1514423862016-c2fb8e636abf'), IMG('photo-1544787219-7f47ccb76574')],
      thumbnail: IMG('photo-1514228742587-6b1558fcca3d'),
      tags: ['mug', 'personalised', 'photo mug', 'birthday'], rating: 4.7, reviewCount: 210,
      bestseller: true, newArrival: true,
    },
    {
      name: 'Personalised Coffee Mug With Name', slug: 'personalised-coffee-mug-with-name',
      category: cat('drinkware'), brand: 'Mahfilifts', price: 449, originalPrice: 1099, discount: 59, stock: 96,
      shortDescription: 'Classic white mug printed with any name or message.',
      description: 'A simple, classic mug with your chosen name or message printed crystal clear. The everyday pick for coffee lovers.',
      images: [IMG('photo-1495474472287-4d71bcdd2085'), IMG('photo-1514228742587-6b1558fcca3d'), IMG('photo-1544787219-7f47ccb76574')],
      thumbnail: IMG('photo-1495474472287-4d71bcdd2085'),
      tags: ['mug', 'name', 'coffee', 'gift'], rating: 4.6, reviewCount: 98,
      bestseller: true,
    },
    {
      name: 'Insulated Stainless Steel Water Bottle', slug: 'insulated-stainless-steel-water-bottle',
      category: cat('drinkware'), brand: 'Mahfilifts', price: 899, originalPrice: 1999, discount: 55, stock: 64,
      shortDescription: 'Keeps drinks cold for 12 hours — personalised with a name.',
      description: 'Double-walled vacuum insulation keeps water cold all day. Matte finish and a personalised name make it gym-ready and gift-ready.',
      images: [IMG('photo-1602143407151-7111542de6e8'), IMG('photo-1514228742587-6b1558fcca3d'), IMG('photo-1495474472287-4d71bcdd2085')],
      thumbnail: IMG('photo-1602143407151-7111542de6e8'),
      tags: ['bottle', 'steel', 'gym', 'personalised'], rating: 4.5, reviewCount: 51,
      featured: true,
    },
    {
      name: 'Personalised Cushion Cover', slug: 'personalised-cushion-cover',
      category: cat('home-decor'), brand: 'Mahfilifts', price: 699, originalPrice: 1499, discount: 53, stock: 47,
      shortDescription: 'Soft cushion cover with photos, names or love notes.',
      description: 'A 16x16 inch cushion cover printed with a photo, name or sweet note. Super-soft fabric, hidden zipper and premium print.',
      images: [IMG('photo-1584100936595-c0654b55a2e2'), IMG('photo-1493663284031-b7e3aefcae8e'), IMG('photo-1507473885765-e6ed057f782c')],
      thumbnail: IMG('photo-1584100936595-c0654b55a2e2'),
      tags: ['cushion', 'home decor', 'personalised', 'anniversary'], rating: 4.8, reviewCount: 143,
      featured: true, bestseller: true,
    },
    {
      name: 'Dream Catcher Wall Hanging Lamp', slug: 'dream-catcher-wall-hanging-lamp',
      category: cat('home-decor'), brand: 'Mahfilifts', price: 1099, originalPrice: 2499, discount: 56, stock: 29,
      shortDescription: 'Handwoven dream catcher that glows as a warm wall lamp.',
      description: 'Handwoven dream catcher with warm LED glow — adds boho charm to any wall. Runs on AA batteries, so no wiring needed.',
      images: [IMG('photo-1507473885765-e6ed057f782c'), IMG('photo-1513506003901-1e6a229e2d15'), IMG('photo-1493663284031-b7e3aefcae8e')],
      thumbnail: IMG('photo-1507473885765-e6ed057f782c'),
      tags: ['lamp', 'wall hanging', 'home decor', 'boho'], rating: 4.6, reviewCount: 71,
      newArrival: true,
    },
    {
      name: 'Personalised Photo Frame', slug: 'personalised-photo-frame',
      category: cat('home-decor'), brand: 'Mahfilifts', price: 549, originalPrice: 1299, discount: 57, stock: 55,
      shortDescription: 'Classic frame printed with a photo and name.',
      description: 'Turn your favourite memory into a framed keepsake. Add names, dates and a short message to make it a story worth keeping.',
      images: [IMG('photo-1513519245088-0e12902e5a38'), IMG('photo-1583364486568-4c5dbab9f4e3'), IMG('photo-1511690656952-34342bb7c2f2')],
      thumbnail: IMG('photo-1513519245088-0e12902e5a38'),
      tags: ['frame', 'photo frame', 'memories'], rating: 4.5, reviewCount: 37,
      featured: true,
    },
    {
      name: 'Wooden Photo Lamp With Personalised Name', slug: 'wooden-photo-lamp-with-personalised-name',
      category: cat('home-decor'), brand: 'Mahfilifts', price: 1299, originalPrice: 2799, discount: 53, stock: 33,
      shortDescription: 'Gorgeous LED lamp that projects a personalised photo and name.',
      description: 'A warm, dreamy LED lamp that displays a photo and name in soft light — the most loved selfie lamp gift under the sun.',
      images: [IMG('photo-1605365070336-ff7a4a5fda6c'), IMG('photo-1507473885765-e6ed057f782c'), IMG('photo-1513519245088-0e12902e5a38')],
      thumbnail: IMG('photo-1605365070336-ff7a4a5fda6c'),
      tags: ['lamp', 'photo lamp', 'selfie lamp', 'personalised'], rating: 4.8, reviewCount: 194,
      bestseller: true, featured: true,
    },
    {
      name: 'Personalised Wooden Keychain', slug: 'personalised-wooden-keychain',
      category: cat('personalised-gifts'), brand: 'Mahfilifts', price: 299, originalPrice: 799, discount: 62, stock: 150,
      shortDescription: 'Hand-finished wooden keychain engraved with a name.',
      description: 'A tiny keepsake with a big heart. Engraved wooden keychain with a name, initial or short message — budget gifting made memorable.',
      images: [IMG('photo-1601925260368-ae2f83cf8b7f'), IMG('photo-1522202176988-66273c2fd55f'), IMG('photo-1513506003901-1e6a229e2d15')],
      thumbnail: IMG('photo-1601925260368-ae2f83cf8b7f'),
      tags: ['keychain', 'wooden', 'budget', 'personalised'], rating: 4.4, reviewCount: 118,
      bestseller: true,
    },
    {
      name: 'Customised Name Necklace', slug: 'customised-name-necklace',
      category: cat('jewellery'), brand: 'Mahfilifts', price: 799, originalPrice: 1899, discount: 57, stock: 42,
      shortDescription: 'Dainty gold- or silver-tone necklace spelling any name.',
      description: 'Each necklace is handcrafted with love to spell your name in a dainty, everyday-wear font. Comes in a gift-ready box.',
      images: [IMG('photo-1515562141207-7a88fb7ce338'), IMG('photo-1535632066927-ab7c9ab60908'), IMG('photo-1599643478518-a784e5dc4c8f')],
      thumbnail: IMG('photo-1515562141207-7a88fb7ce338'),
      tags: ['necklace', 'name necklace', 'jewellery', 'women'], rating: 4.7, reviewCount: 156,
      featured: true, bestseller: true, newArrival: true,
    },
    {
      name: 'Personalised Passport Cover', slug: 'personalised-passport-cover',
      category: cat('travel'), brand: 'Mahfilifts', price: 599, originalPrice: 1299, discount: 54, stock: 61,
      shortDescription: 'Protect the passport with a personalised name-embossed cover.',
      description: 'Slim, durable passport cover with a name embossed in gold. The perfect travel gift for the person who is always jetting off.',
      images: [IMG('photo-1488646953014-85cb44e25828'), IMG('photo-1553062407-98eeb64c6a62'), IMG('photo-1502920917128-1aa500764cbd')],
      thumbnail: IMG('photo-1488646953014-85cb44e25828'),
      tags: ['passport', 'travel', 'personalised'], rating: 4.6, reviewCount: 44,
      featured: true,
    },
    {
      name: 'Kids Personalised Lunch Bag', slug: 'kids-personalised-lunch-bag',
      category: cat('kids'), brand: 'Mahfilifts', price: 649, originalPrice: 1499, discount: 56, stock: 73,
      shortDescription: 'Insulated lunch bag printed with a kid-friendly name and print.',
      description: 'Makes lunch the best part of the school day. Insulated interior, easy-clean lining and a personal name front and centre.',
      images: [IMG('photo-1622483767028-3f66f32aef97'), IMG('photo-1553062407-98eeb64c6a62'), IMG('photo-1583364486568-4c5dbab9f4e3')],
      thumbnail: IMG('photo-1622483767028-3f66f32aef97'),
      tags: ['kids', 'lunch bag', 'school', 'personalised'], rating: 4.5, reviewCount: 27,
      bestseller: true,
    },
    {
      name: 'Kids Duffle Bag With Name', slug: 'kids-duffle-bag-with-name',
      category: cat('kids'), brand: 'Mahfilifts', price: 999, originalPrice: 2199, discount: 54, stock: 48,
      shortDescription: 'Roomie duffle for school and activity days, personalised.',
      description: 'Perfect for school, swim class and weekend trips — a durable duffle with a name printed on the front. Roomy, lightweight, washable.',
      images: [IMG('photo-1553062407-98eeb64c6a62'), IMG('photo-1590874103328-eac38a683ce7'), IMG('photo-1622483767028-3f66f32aef97')],
      thumbnail: IMG('photo-1553062407-98eeb64c6a62'),
      tags: ['kids', 'duffle', 'school', 'personalised'], rating: 4.6, reviewCount: 18,
      newArrival: true,
    },
    {
      name: 'Kids Sling Bottle Combo', slug: 'kids-sling-bottle-combo',
      category: cat('kids'), brand: 'Mahfilifts', price: 749, originalPrice: 1699, discount: 55, stock: 52,
      shortDescription: 'Matching sling bag and bottle combo for tiny explorers.',
      description: 'A coordinated sling bag + steel bottle combo that makes outings easy. Lightweight, spill-proof and personalised with a name.',
      images: [IMG('photo-1602143407151-7111542de6e8'), IMG('photo-1553062407-98eeb64c6a62'), IMG('photo-1622483767028-3f66f32aef97')],
      thumbnail: IMG('photo-1602143407151-7111542de6e8'),
      tags: ['kids', 'combo', 'sling', 'bottle'], rating: 4.5, reviewCount: 12,
      newArrival: true,
    },
    {
      name: 'Eye Mask & Neck Pillow Travel Set', slug: 'eye-mask-neck-pillow-travel-set',
      category: cat('travel'), brand: 'Mahfilifts', price: 699, originalPrice: 1499, discount: 53, stock: 66,
      shortDescription: 'Silk eye mask and memory-foam neck pillow for sweet sleep.',
      description: 'Two travel essentials in one — a breathable eye mask and a supportive neck pillow. Personalised with initials for a premium feel.',
      images: [IMG('photo-1502920917128-1aa500764cbd'), IMG('photo-1488646953014-85cb44e25828'), IMG('photo-1544787219-7f47ccb76574')],
      thumbnail: IMG('photo-1502920917128-1aa500764cbd'),
      tags: ['travel', 'eye mask', 'neck pillow', 'airplane'], rating: 4.4, reviewCount: 29,
      bestseller: true,
    },
    {
      name: 'Personalised Laptop Sleeve', slug: 'personalised-laptop-sleeve',
      category: cat('bags-totes'), brand: 'Mahfilifts', price: 899, originalPrice: 1999, discount: 55, stock: 36,
      shortDescription: 'Padded laptop sleeve personalised with a name or print.',
      description: 'Shock-absorbing padded sleeve for 13" to 15" laptops. Soft inner lining, zip closure and your choice of print or name on the front.',
      images: [IMG('photo-1526498460520-4c246339dccb'), IMG('photo-1496181133206-80ce9b88a853'), IMG('photo-1531297484001-80022131f5a1')],
      thumbnail: IMG('photo-1526498460520-4c246339dccb'),
      tags: ['laptop sleeve', 'office', 'personalised'], rating: 4.7, reviewCount: 83,
      featured: true,
    },
    {
      name: 'Personalised Mug Set Of 2', slug: 'personalised-mug-set-of-2',
      category: cat('drinkware'), brand: 'Mahfilifts', price: 799, originalPrice: 1799, discount: 55, stock: 58,
      shortDescription: 'Matching pair of mugs for two, personalised to match.',
      description: 'Two glossy ceramic mugs printed with matching names or photos — the classic couple gift that never misses.',
      images: [IMG('photo-1544787219-7f47ccb76574'), IMG('photo-1514228742587-6b1558fcca3d'), IMG('photo-1495474472287-4d71bcdd2085')],
      thumbnail: IMG('photo-1544787219-7f47ccb76574'),
      tags: ['mug set', 'couple', 'anniversary', 'personalised'], rating: 4.7, reviewCount: 61,
      bestseller: true,
    },
  ];

  for (const p of products) {
    p.sku = `MF-${Math.floor(1000 + Math.random() * 9000)}`;
    p.lowStockThreshold = 5;
    p.status = true;
  }
  const productDocs = await Product.insertMany(products);

  await Collection.insertMany([
    { name: 'Bestsellers', slug: 'best-seller', description: 'Top selling gifts loved by thousands.', thumbnail: IMG('photo-1483985988355-763728e1935b'), status: true },
    { name: 'New Arrivals', slug: 'new-arrivals', description: 'Freshly launched personalised gifts.', thumbnail: IMG('photo-1601925260368-ae2f83cf8b7f'), status: true },
    { name: 'Gifts Under ₹499', slug: 'gifts-under-500', description: 'Cute, clever and budget-friendly.', thumbnail: IMG('photo-1601925260368-ae2f83cf8b7f'), status: true },
    { name: 'Gifts Under ₹999', slug: 'gifts-under-1000', description: 'Thoughtful without overspending.', thumbnail: IMG('photo-1514228742587-6b1558fcca3d'), status: true },
  ]);

  await Occasion.insertMany([
    { name: 'Birthday Gifts', slug: 'birthday', description: 'Celebrate another year with a personalised gift.' },
    { name: 'Anniversary Gifts', slug: 'anniversary-gifts', description: 'Mark the milestone with something memorable.' },
    { name: 'Valentine\'s Day Gifts', slug: 'valentines-gift', description: 'Show love with a personal touch.' },
    { name: 'Wedding Gifts', slug: 'wedding-gifts', description: 'For the couple just starting their story.' },
    { name: 'Housewarming Gifts', slug: 'housewarming-gifts', description: 'Warm wishes for a brand-new home.' },
  ]);

  await Review.insertMany([
    { product: productDocs[0]._id, user: customer._id, rating: 5, title: 'Elegant and perfect', comment: 'The print looks so classy and the name detail makes it feel extra special.' },
    { product: productDocs[2]._id, user: customer._id, rating: 5, title: 'Compact and classy', comment: 'Beautifully stitched, sturdy, and perfect for keeping essentials organised.' },
    { product: productDocs[10]._id, user: customer._id, rating: 5, title: 'Print quality is sharp', comment: 'The photo came out crystal clear on the mug. Loved it.' },
  ]);

  await Coupon.create({
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrderAmount: 999,
    maximumDiscount: 500,
    startDate: new Date(),
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    usageLimit: 50,
    status: true,
  });

  console.log('Seed data created successfully.');
  console.log('Admin email:', admin.email);
  console.log('Customer email:', customer.email);
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});