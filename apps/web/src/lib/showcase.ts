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
  work(9002, "Blooming Bouquets", "Balloon & Floral Installations", "Hand-wrapped bouquets of gerberas, chrysanthemums and roses, finished with our signature card.", [3552, 3553, 3557, 3558]),
  work(9003, "Golden Hour Garland", "Backdrops & Setups", "An organic balloon garland in gold, sage and sky blue, styled for a sunset terrace.", [3555, 3556]),
  work(9004, "Black & Silver Bar Dinner", "Backdrops & Setups", "A statement chrome and black balloon arch with a custom welcome banner for a call to the bar dinner.", [3560, 3561]),
  work(9005, "I Love You Mummy", "Curated Gift Sets", "A purple Mother's Day hamper with a bubble balloon, flowers and a keepsake box.", [3538, 3543, 3548]),
  work(9006, "Fuel Coupon Bouquet", "Curated Gift Sets", "A thoughtful twist on a bouquet, made of fuel coupons and fresh daisies.", [3559]),
  work(9007, "Happy Mother's Day", "Surprise Setups", "A bubble balloon in rich reds, lettered in gold, with red blooms and a satin bow.", [3540, 3545, 3550]),
  work(9008, "Blush Bubble Balloon", "Surprise Setups", "Pink balloons inside a gold-lettered bubble, ready to surprise her.", [3541, 3546]),
  work(9009, "Mother's Day Hamper", "Special Day Packages", "A full pink gift box with a bubble balloon, flowers and a card for Mother's Day.", [3539, 3544, 3549]),
  work(9010, "Welcome to the World", "Special Day Packages", "A baby-shower balloon stack in sky and slate blue with a character topper.", [3562, 3564]),
];
