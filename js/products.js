/**
 * VoltEdge Luxury Furniture Store - Egyptian Market
 * Real Furniture Product Catalog: Living suites, Bedrooms, Desks, Vitrines, Chairs, Kids rooms
 */

// Central Price Formatter used across cards, cart, checkout, and notifications
function formatPrice(amount) {
  if (typeof amount !== 'number') {
    amount = Number(amount) || 0;
  }
  const formattedNumber = new Intl.NumberFormat('en-US').format(amount);
  return `${formattedNumber} ج.م`;
}

// Complete Authentic Egyptian Furniture Catalog with Natural Photographic Images
const PRODUCTS = [
  {
    id: "fur-01",
    name: "طقم أنتريه صالون مودرن فاخر",
    nameEn: "Modern Luxury Living Room Suite",
    price: 26999,
    rating: 5.0,
    reviewsCount: 54,
    badge: "الأكثر طلباً",
    category: "أنتريهات",
    image: "images/furniture-sofa.jpg",
    description: "طقم أنتريه مريح وأنيق مصنوع من خشب الزان الروماني وإسفنج كثافة 33 مع تنجيد قماش بوكليه وتر بروف عالي التحمل."
  },
  {
    id: "fur-02",
    name: "غرفة نوم ماستر مودرن متكاملة",
    nameEn: "Complete Master Bedroom Suite",
    price: 48500,
    rating: 4.9,
    reviewsCount: 38,
    badge: "طقم متكامل",
    category: "غرف نوم",
    image: "images/furniture-bedroom.jpg",
    description: "غرفة نوم ماستر كاملة: سرير 180 سم بظهر مبطن، دولاب جرار 260 سم، تسريحة بإضاءة ليد ذكية، و2 كومود بتشطيب أرو راقي."
  },
  {
    id: "fur-03",
    name: "مكتب عمل ودراسة تنفيذي بخشب البلوط",
    nameEn: "Executive Home & Work Desk",
    price: 11499,
    rating: 4.8,
    reviewsCount: 27,
    badge: "تصميم مريح",
    category: "مكاتب",
    image: "images/furniture-desk.jpg",
    description: "مكتب عمل عصري بسطح واسع مقاوم للخدش، مزود بوحدات أدراج جانبية سلسة الفتح ومسار مخفي لتنظيم كابلات اللابتوب والكهرباء."
  },
  {
    id: "fur-04",
    name: "نيش وبوفيه مودرن زجاج فاميه وإضاءة LED",
    nameEn: "Modern Dining Buffet & Vitrine with LED",
    price: 19800,
    rating: 5.0,
    reviewsCount: 46,
    badge: "الأعلى تقييماً",
    category: "نيش وبوفيه",
    image: "images/furniture-buffet-nish.jpg",
    description: "وحدة نيش وبوفيه عصرية بأبواب زجاجية مضلعة فاميه وأرفف متينة وإضاءة ورم داخلية لعرض أطقم الكريستال والصيني بأناقة."
  },
  {
    id: "fur-05",
    name: "كرسي فوتيه صالون استرخاء مبطن",
    nameEn: "Lounge Accent Armchair",
    price: 6899,
    rating: 4.9,
    reviewsCount: 61,
    badge: "راحة قصوى",
    category: "كراسي",
    image: "images/furniture-armchair.jpg",
    description: "كرسي فوتيه مريح بقاعدة خشب زان مدعمة وتصميم انسيابي للظهر يوفر دعماً ممتازاً للفقرات مع ملمس قماش كتاني ناعم."
  },
  {
    id: "fur-06",
    name: "غرفة أطفال وشباب سريرين ودولاب",
    nameEn: "Kids & Youth Double Bedroom",
    price: 27900,
    rating: 4.8,
    reviewsCount: 32,
    badge: "أمان وجودة",
    category: "غرف أطفال",
    image: "images/furniture-kids-room.jpg",
    description: "غرفة أطفال تضم سريرين 120 سم مع دولاب 3 دلف ومكتب دراسة، مصنعة بألوان هادئة ودهانات دوكو فرن آمنة وصحية للأطفال."
  },
  {
    id: "fur-07",
    name: "طاولة سفرة عائلية مع 6 كراسي مبطنة",
    nameEn: "Dining Table Set with 6 Chairs",
    price: 23500,
    rating: 4.9,
    reviewsCount: 29,
    badge: "سفرة عائلية",
    category: "سفرة وكراسي",
    image: "images/furniture-dining.jpg",
    description: "سفرة طعام مستطيلة تتسع لـ 6 أفراد بسطح خشب طبيعي معالج ضد الحرارة والسوائل مع كراسي مريحة مبطنة عالية الجودة."
  },
  {
    id: "fur-08",
    name: "طاولة قهوة صالون دائرية من البلوط",
    nameEn: "Round Oak Coffee Table",
    price: 8499,
    rating: 5.0,
    reviewsCount: 42,
    badge: "صالون ومعيشة",
    category: "طاولات",
    image: "images/coffee-table.jpg",
    description: "طاولة صالون مستديرة من خشب البلوط الطبيعي الدافئ بقاعدة ثلاثية متينة تضيف لمسة من الفخامة والانسيابية للصالون."
  }
];

// Available Filter Categories for the furniture store
const FURNITURE_CATEGORIES = [
  { id: "all", name: "جميع الأثاث" },
  { id: "أنتريهات", name: "أنتريهات وركنات" },
  { id: "غرف نوم", name: "غرف نوم ماستر" },
  { id: "مكاتب", name: "مكاتب عملية" },
  { id: "نيش وبوفيه", name: "نيش وبوفيه" },
  { id: "كراسي", name: "كراسي وفوتيهات" },
  { id: "غرف أطفال", name: "غرف أطفال" },
  { id: "سفرة وكراسي", name: "غرف سفرة" }
];

// Expose to window
window.formatPrice = formatPrice;
window.PRODUCTS = PRODUCTS;
window.FURNITURE_CATEGORIES = FURNITURE_CATEGORIES;
