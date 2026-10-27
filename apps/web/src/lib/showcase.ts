// Real pieces from Nhyira's Atelier, served from /public/assets/works. The page
// uses these for the hero and the services wheel, and for Our Works until
// pieces have been published from the admin.
const w = (n: number) => `/assets/works/${n}.jpg`;

export const HERO_IMAGES = [3541, 3556, 3538, 3558, 3560, 3562, 3539, 3552, 3555, 3553, 3544, 3559].map(
  (n) => ({ src: w(n) }),
);

// One cover per service, matched by the category name.
export const SERVICE_IMAGES: Record<string, string> = {
  "Balloon & Floral Installations": w(3541),
  "Backdrops & Setups": w(3556),
  "Curated Gift Sets": w(3538),
  "Surprise Setups": w(3540),
  "Special Day Packages": w(3562),
};

export const FLORAL_CATEGORY = "Bridal Florals";

/**
 * Nhyira's florals are shown on their own, apart from the balloon work. A piece
 * counts as floral when its category is about flowers and not about balloons, so
 * a category created in the admin called "Flowers" or "Floral Bouquets" lands on
 * the floral side by itself.
 */
export const isFloral = (category: string) =>
  /flor|flower|bouquet/i.test(category) && !/balloon/i.test(category);

// From the Atelier's Bridal Rate Card. Prices are starting prices, in cedis.
export type RateRow = { id: string; name: string; note: string; price: string };

export const BRIDAL_GROUPS: { title: string; rows: RateRow[] }[] = [
  {
    title: "The Bride",
    rows: [
      { id: "classic", name: "Classic Bouquet", note: "Small hand-tied bouquet of fresh blooms, greenery and satin ribbon.", price: "GH₵350+" },
      { id: "pearl", name: "Pearl Classic Bouquet", note: "Our classic bouquet with trailing pearl strands and a sheer ribbon bow.", price: "GH₵400+" },
      { id: "full", name: "Full Classic Bouquet", note: "A fuller, larger hand-tied bouquet with more blooms and greenery.", price: "GH₵550+" },
      { id: "cascade", name: "Luxe Cascade", note: "A statement cascade with premium blooms and a custom ribbon finish.", price: "GH₵1,450+" },
    ],
  },
  {
    title: "The Bridesmaids",
    rows: [
      { id: "mini", name: "Mini Bouquet", note: "A dainty bouquet of 2 to 3 stems, tied with ribbon. Price each.", price: "GH₵150+" },
      { id: "bridesmaid", name: "Bridesmaid Bouquet", note: "A hand-tied bouquet in the bride's palette. Price each.", price: "GH₵200+" },
    ],
  },
  {
    title: "The Groom & Family",
    rows: [
      { id: "groom", name: "Groom's Boutonnière", note: "Pinned or magnetic, with a bloom that matches the bouquet.", price: "GH₵90+" },
      { id: "groomsmen", name: "Groomsmen's Boutonnière", note: "A simpler coordinated version for groomsmen and fathers. Price each.", price: "GH₵70+" },
      { id: "corsage", name: "Corsage", note: "For mothers and grandmothers, wrist or pin style. Price each.", price: "GH₵100+" },
    ],
  },
];

export const CURATE_STEPS = [
  "Share your budget and your wedding colours or inspiration. Prefer artificial flowers? Just ask and we'll quote it.",
  "We curate the right blooms, size and style to get the most from your budget.",
  "Approve your design and pay a 50% deposit to secure your date.",
  "Receive your fresh bouquet on the day, ready for your photos.",
];

export const BUDGET_TIERS = [
  { price: "From GH₵350", text: "A small, neat hand-tied bridal bouquet with seasonal blooms and soft greenery." },
  { price: "GH₵550 – 900", text: "A fuller bouquet with accent blooms, texture and a custom ribbon." },
  { price: "GH₵900 and above", text: "A statement cascade with premium blooms and layered foliage." },
];

export const BRIDAL_PACKAGES: (RateRow & { save: string })[] = [
  { id: "couple", name: "The Couple", note: "1 Pearl Classic Bouquet + 1 Groom's Boutonnière", price: "GH₵450+", save: "Save GH₵40" },
  { id: "party", name: "The Bridal Party", note: "1 Pearl Classic Bouquet + 4 Bridesmaid Bouquets + 1 Groom's Boutonnière + 4 Groomsmen's Boutonnières", price: "GH₵1,450+", save: "Save GH₵120" },
  { id: "grand", name: "The Grand Celebration", note: "1 Luxe Cascade + 6 Bridesmaid Bouquets + 1 Groom's Boutonnière + 5 Groomsmen's Boutonnières + 2 Corsages", price: "GH₵2,950+", save: "Save GH₵340" },
];

export const BRIDAL_ADDONS = [
  { name: "Flower girl mini bouquet or petal basket", price: "GH₵150+" },
  { name: "Delivery and on-site handover", price: "Within Accra, quoted by location" },
  { name: "Rush orders (under 7 days' notice)", price: "+ 25%" },
];

export const BRIDAL_BOOKING =
  "All prices are starting prices, and your final quote depends on your design. Our bouquets are made with fresh flowers; artificial flowers are available on request. A 50% deposit secures your date, and the balance is due 3 days before the event. Please book at least 2 weeks ahead. Includes a short palette consultation.";

/** Everything on the rate card that can be named in an enquiry. */
export const BRIDAL_ENQUIRIES = [
  ...BRIDAL_GROUPS.flatMap((g) => g.rows),
  ...BRIDAL_PACKAGES,
].map((r) => ({
  id: `rate-${r.id}`,
  title: r.name,
  category: FLORAL_CATEGORY,
  images: [] as string[],
  price: r.price,
}));

const work = (
  id: number,
  title: string,
  category: string,
  description: string,
  images: number[],
) => ({
  id,
  title,
  category,
  description,
  images: images.map(w),
  tags: [] as string[],
  published: true,
  createdAt: "2026-01-01T00:00:00.000Z",
});

export const SHOWCASE_WORKS = [
  work(9001, "Mama Bubble Balloon", "Balloon & Floral Installations", "A clear bubble balloon with a hand-lettered name, set above fresh blooms in a mirrored pot.", [3537, 3542, 3547]),
  work(9002, "Gerbera & Chrysanthemum Bouquet", FLORAL_CATEGORY, "A hand-wrapped bouquet of pink gerberas, white chrysanthemums and baby's breath, finished with our signature card.", [3552, 3553]),
  work(9011, "Mixed Bloom Bouquet", FLORAL_CATEGORY, "A generous mixed bouquet of chrysanthemums, carnations and stock in rich pinks and golds.", [3557, 3558]),
  work(9003, "Golden Hour Garland", "Backdrops & Setups", "An organic balloon garland in gold, sage and sky blue, styled for a sunset terrace.", [3555, 3556]),
  work(9004, "Black & Silver Bar Dinner", "Backdrops & Setups", "A statement chrome and black balloon arch with a custom welcome banner for a call to the bar dinner.", [3560, 3561]),
  work(9005, "I Love You Mummy", "Curated Gift Sets", "A purple Mother's Day hamper with a bubble balloon, flowers and a keepsake box.", [3538, 3543, 3548]),
  work(9006, "Fuel Coupon Bouquet", "Curated Gift Sets", "A thoughtful twist on a bouquet, made of fuel coupons and fresh daisies.", [3559]),
  work(9007, "Happy Mother's Day", "Surprise Setups", "A bubble balloon in rich reds, lettered in gold, with red blooms and a satin bow.", [3540, 3545, 3550]),
  work(9008, "Blush Bubble Balloon", "Surprise Setups", "Pink balloons inside a gold-lettered bubble, ready to surprise her.", [3541, 3546]),
  work(9009, "Mother's Day Hamper", "Special Day Packages", "A full pink gift box with a bubble balloon, flowers and a card for Mother's Day.", [3539, 3544, 3549]),
  work(9010, "Welcome to the World", "Special Day Packages", "A baby-shower balloon stack in sky and slate blue with a character topper.", [3562, 3564]),
];
