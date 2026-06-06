// A list of Bengali names to choose from
const BENGALI_NAMES = [
  'রহিম মিয়া',
  'সুমাইয়া বেগম',
  'করিম সাহেব',
  'আরিফ হোসেন',
  'ফাতেমা আক্তার',
  'সাকিব আল হাসান',
  'নুসরাত জাহান',
  'কামরুল হাসান',
  'সাদিয়া ইসলাম',
  'মাসুদ রানা',
  'তানজিনা আক্তার',
  'ইমরান খান',
  'ফারহানা ইয়াসমিন',
  'জসিম উদ্দিন',
  'রোকসানা পারভীন'
];

// A list of high-quality positive Bengali review comments
const BENGALI_REVIEWS = [
  'পণ্যটি অনেক ভালো, দ্রুত ডেলিভারি পেয়েছি। আমি সম্পূর্ণ সন্তুষ্ট।',
  'দারুণ পণ্য! মান একদম প্রিমিয়াম। প্যাকেজিং খুব সুন্দর ছিল, আবার অর্ডার করব।',
  'মান অনেক ভালো, দাম সাশ্রয়ী। ডেলিভারি একটু দেরি হলেও পণ্যের মান নিয়ে কোনো অভিযোগ নেই।',
  'খুবই চমৎকার প্রোডাক্ট! যেমন ছবিতে দেখেছি ঠিক তেমনই পেয়েছি। অনেক ধন্যবাদ বিক্রেতাকে।',
  'কোয়ালিটি খুবই ভালো এবং মজবুত। ব্যবহার করে অনেক আরাম পাচ্ছি। রিকমেন্ডেড!',
  'অল্প দামের মধ্যে সেরা প্রোডাক্ট। যেমন চেয়েছিলাম ঠিক তেমনই পেয়েছি।',
  'অসাধারণ কোয়ালিটি! ডেলিভারিও অনেক ফাস্ট ছিল। সবাই নিতে পারেন।',
  'খুবই ভালো সার্ভিস। প্রোডাক্টের ফিনিশিং চমৎকার। ভবিষ্যতে আবার কেনাকাটা করব।',
  'এতো কম দামে এমন প্রিমিয়াম প্রোডাক্ট আশা করিনি। ডেলিভারি ভাইয়ের ব্যবহারও ভালো ছিল।',
  'আমার কাছে খুব ভালো লেগেছে। প্যাকেজিং অনেক শক্তপোক্ত ছিল যাতে কোনো ক্ষতি না হয়।',
  'জিনিসটা দেখতে খুবই সুন্দর এবং কাজের। কোয়ালিটি নিয়ে কোনো সন্দেহ নেই।',
  '১০০% অরজিনাল প্রোডাক্ট। খুবই দ্রুত হাতে পেয়েছি। কাজের জন্য অত্যন্ত দরকারি পণ্য।'
];

// A helper function to generate deterministic pseudo-random values based on a string
// Uses a stronger hash mixing to avoid collisions for similar IDs
function getDeterministicValue(str, max) {
  if (!str) return 0;
  let hash = 2166136261; // FNV-1a offset basis (32-bit)
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0; // FNV prime, keep as unsigned 32-bit
  }
  return hash % max;
}

// Secondary hash with a different algorithm for more variation
function getSecondaryValue(str, max) {
  if (!str) return 0;
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)) % max;
}

export function getDemoReviews(productId, productName = '') {
  if (!productId) return [];

  // Use both productId and productName for seed to ensure uniqueness
  const combinedKey = `${productId}::${productName}`;
  const seed = getDeterministicValue(combinedKey, 100000);
  const seed2 = getSecondaryValue(productId, 100000);

  // Deterministically decide the number of reviews: 2, 3, 4, or 5
  const reviewCountOptions = [2, 3, 4, 5];
  const count = reviewCountOptions[seed % reviewCountOptions.length];

  const reviews = [];
  for (let i = 0; i < count; i++) {
    // Use both seeds for more varied selection per review slot
    const nameIndex = (seed + i * 11 + seed2) % BENGALI_NAMES.length;
    const reviewIndex = (seed2 + i * 17 + seed) % BENGALI_REVIEWS.length;

    // Deterministically assign rating: mostly 5, some 4
    const rating = ((seed + seed2 + i) % 5 === 0) ? 4 : 5;

    // Generate date: deterministically generate a date within the last 45 days
    const daysAgo = (seed + i * seed2 % 13) % 45;
    const date = new Date('2026-06-01T12:00:00Z');
    date.setDate(date.getDate() - daysAgo);

    reviews.push({
      user: { name: BENGALI_NAMES[nameIndex] },
      rating: rating,
      review: BENGALI_REVIEWS[reviewIndex],
      createdAt: date.toISOString(),
    });
  }

  return reviews;
}

export function getCombinedRatings(productId, productName = '', realRatings = []) {
  const demoReviews = getDemoReviews(productId, productName);
  
  // Combine real ratings with demo ratings, mapping custom names for guest reviews
  const allRatings = realRatings.map(r => ({
    ...r,
    user: { name: r.name || r.user?.name || 'গ্রাহক' }
  }));
  
  // Calculate average and total count including demo reviews
  const totalCount = allRatings.length + demoReviews.length;
  
  const totalRatingSum = allRatings.reduce((sum, r) => sum + r.rating, 0) + 
                         demoReviews.reduce((sum, r) => sum + r.rating, 0);
                         
  const averageRating = totalCount > 0 ? (totalRatingSum / totalCount) : 0;
  
  return {
    averageRating,
    reviewCount: totalCount,
    reviews: [...demoReviews, ...allRatings],
  };
}
