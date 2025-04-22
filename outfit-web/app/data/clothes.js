// 分类、子分类、场景、季节定义
export const categories = ['tops', 'bottoms', 'dresses', 'outerwear', 'footwear', 'bags', 'accessories'];
export const subCategories = {
  'tops': ['tshirt', 'shirt', 'sweater', 'hoodie', 'vest'],
  'bottoms': ['jeans', 'casual_pants', 'formal_pants', 'sport_pants', 'shorts', 'skirt'],
  'dresses': ['short_dress', 'midi_dress', 'long_dress', 'jumpsuit'],
  'outerwear': ['blazer', 'jacket', 'trench_coat', 'coat', 'down_jacket', 'vest_outerwear'],
  'footwear': ['sneakers', 'leather_shoes', 'boots', 'sandals', 'flats', 'heels'],
  'bags': ['handbag', 'shoulder_bag', 'backpack', 'crossbody', 'wallet'],
  'accessories': ['scarf', 'hat', 'belt', 'watch', 'jewelry'],
};
export const occasions = ['daily', 'work', 'casual', 'date', 'sport', 'formal'];
export const seasons = ['spring', 'summer', 'autumn', 'winter'];

// 可用的样式标签
export const styleOptions = ['basic', 'slim_fit', 'straight', 'loose', 'floral', 'striped'];

// 可选颜色列表
export const availableColors = [
  { name: 'white', value: '#FFFFFF' },
  { name: 'black', value: '#000000' },
  { name: 'gray', value: '#9CA3AF' },
  { name: 'beige', value: '#F5F5DC' },
  { name: 'blue', value: '#3B82F6' },
  { name: 'red', value: '#EF4444' },
  { name: 'green', value: '#10B981' },
  { name: 'yellow', value: '#F59E0B' },
  { name: 'pink', value: '#EC4899' },
  { name: 'purple', value: '#8B5CF6' },
  { name: 'brown', value: '#92400E' },
  { name: 'orange', value: '#F97316' },
];

// 衣物数据
export const clothesData = [
  // === T恤 ===
  {
    id: 'tshirt-crewneck-regular-white',
    nameKey: 'items.basic_crew_tshirt',
    category: 'tops',
    subCategory: 'tshirt',
    styleKey: 'style.basic',
    tags: ['casual', 'versatile', 'basic'],
    suitableSeasons: ['spring', 'summer', 'autumn'],
    suitableOccasions: ['daily', 'casual'],
    colorName: 'white',
    colorValue: '#FFFFFF',
    layer: 0,
    formality: 1
  },
  {
    id: 'tshirt-crewneck-regular-black',
    nameKey: 'items.basic_crew_tshirt',
    category: 'tops',
    subCategory: 'tshirt',
    styleKey: 'style.basic',
    tags: ['casual', 'versatile', 'basic'],
    suitableSeasons: ['spring', 'summer', 'autumn'],
    suitableOccasions: ['daily', 'casual'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 0,
    formality: 1
  },
  {
    id: 'tshirt-vneck-slim-white',
    nameKey: 'items.vneck_tshirt',
    category: 'tops',
    subCategory: 'tshirt',
    styleKey: 'style.slim_fit',
    tags: ['casual', 'versatile'],
    suitableSeasons: ['spring', 'summer'],
    suitableOccasions: ['daily', 'casual', 'date'],
    colorName: 'white',
    colorValue: '#FFFFFF',
    layer: 0,
    formality: 2
  },
  {
    id: 'tshirt-crewneck-loose-gray',
    nameKey: 'items.loose_tshirt',
    category: 'tops',
    subCategory: 'tshirt',
    styleKey: 'style.loose',
    tags: ['casual', 'comfortable'],
    suitableSeasons: ['spring', 'summer', 'autumn'],
    suitableOccasions: ['daily', 'casual', 'sport'],
    colorName: 'gray',
    colorValue: '#9CA3AF',
    layer: 0,
    formality: 1
  },
  {
    id: 'tshirt-crewneck-striped-blue',
    nameKey: 'items.striped_tshirt',
    category: 'tops',
    subCategory: 'tshirt',
    styleKey: 'style.striped',
    tags: ['casual', 'pattern'],
    suitableSeasons: ['spring', 'summer'],
    suitableOccasions: ['daily', 'casual'],
    colorName: 'blue',
    colorValue: '#3B82F6',
    layer: 0,
    formality: 2
  },
  
  // === 衬衫 ===
  {
    id: 'shirt-basic-white',
    nameKey: 'items.basic_shirt',
    category: 'tops',
    subCategory: 'shirt',
    styleKey: 'style.basic',
    tags: ['work', 'formal', 'basic'],
    suitableSeasons: ['spring', 'summer', 'autumn', 'winter'],
    suitableOccasions: ['work', 'formal', 'daily'],
    colorName: 'white',
    colorValue: '#FFFFFF',
    layer: 0,
    formality: 3
  },
  {
    id: 'shirt-basic-blue',
    nameKey: 'items.basic_shirt',
    category: 'tops',
    subCategory: 'shirt',
    styleKey: 'style.basic',
    tags: ['work', 'formal', 'basic'],
    suitableSeasons: ['spring', 'summer', 'autumn', 'winter'],
    suitableOccasions: ['work', 'formal', 'daily'],
    colorName: 'blue',
    colorValue: '#3B82F6',
    layer: 0,
    formality: 3
  },
  {
    id: 'shirt-slim-fit-white',
    nameKey: 'items.slim_fit_shirt',
    category: 'tops',
    subCategory: 'shirt',
    styleKey: 'style.slim_fit',
    tags: ['work', 'formal', 'slim'],
    suitableSeasons: ['spring', 'summer', 'autumn', 'winter'],
    suitableOccasions: ['work', 'formal', 'date'],
    colorName: 'white',
    colorValue: '#FFFFFF',
    layer: 0,
    formality: 4
  },
  {
    id: 'shirt-plaid-red',
    nameKey: 'items.plaid_shirt',
    category: 'tops',
    subCategory: 'shirt',
    styleKey: 'style.basic',
    tags: ['casual', 'pattern'],
    suitableSeasons: ['autumn', 'winter'],
    suitableOccasions: ['daily', 'casual'],
    colorName: 'red',
    colorValue: '#EF4444',
    layer: 0,
    formality: 2
  },
  
  // === 针织衫/毛衣 ===
  {
    id: 'sweater-basic-beige',
    nameKey: 'items.basic_sweater',
    category: 'tops',
    subCategory: 'sweater',
    styleKey: 'style.basic',
    tags: ['casual', 'work', 'basic'],
    suitableSeasons: ['autumn', 'winter', 'spring'],
    suitableOccasions: ['casual', 'work', 'daily'],
    colorName: 'beige',
    colorValue: '#F5F5DC',
    layer: 0,
    formality: 2
  },
  {
    id: 'sweater-basic-gray',
    nameKey: 'items.basic_sweater',
    category: 'tops',
    subCategory: 'sweater',
    styleKey: 'style.basic',
    tags: ['casual', 'work', 'basic'],
    suitableSeasons: ['autumn', 'winter'],
    suitableOccasions: ['casual', 'work', 'daily'],
    colorName: 'gray',
    colorValue: '#9CA3AF',
    layer: 0,
    formality: 2
  },
  {
    id: 'sweater-vneck-black',
    nameKey: 'items.vneck_sweater',
    category: 'tops',
    subCategory: 'sweater',
    styleKey: 'style.basic',
    tags: ['work', 'smart'],
    suitableSeasons: ['autumn', 'winter'],
    suitableOccasions: ['work', 'formal', 'date'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 0,
    formality: 3
  },
  
  // === 卫衣 ===
  {
    id: 'hoodie-basic-gray',
    nameKey: 'items.basic_hoodie',
    category: 'tops',
    subCategory: 'hoodie',
    styleKey: 'style.basic',
    tags: ['casual', 'comfortable'],
    suitableSeasons: ['autumn', 'winter', 'spring'],
    suitableOccasions: ['casual', 'sport', 'daily'],
    colorName: 'gray',
    colorValue: '#9CA3AF',
    layer: 1,
    formality: 1
  },
  {
    id: 'hoodie-basic-black',
    nameKey: 'items.basic_hoodie',
    category: 'tops',
    subCategory: 'hoodie',
    styleKey: 'style.basic',
    tags: ['casual', 'comfortable'],
    suitableSeasons: ['autumn', 'winter', 'spring'],
    suitableOccasions: ['casual', 'sport', 'daily'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 1,
    formality: 1
  },
  
  // === 下装：牛仔裤 ===
  {
    id: 'jeans-straight-blue',
    nameKey: 'items.straight_jeans',
    category: 'bottoms',
    subCategory: 'jeans',
    styleKey: 'style.straight',
    tags: ['casual', 'versatile', 'basic'],
    suitableSeasons: ['spring', 'summer', 'autumn', 'winter'],
    suitableOccasions: ['daily', 'casual', 'work'],
    colorName: 'blue',
    colorValue: '#3B82F6',
    layer: 0,
    formality: 2
  },
  {
    id: 'jeans-slim-blue',
    nameKey: 'items.slim_jeans',
    category: 'bottoms',
    subCategory: 'jeans',
    styleKey: 'style.slim_fit',
    tags: ['casual', 'versatile', 'slim'],
    suitableSeasons: ['spring', 'summer', 'autumn', 'winter'],
    suitableOccasions: ['daily', 'casual', 'date'],
    colorName: 'blue',
    colorValue: '#3B82F6',
    layer: 0,
    formality: 2
  },
  {
    id: 'jeans-slim-black',
    nameKey: 'items.slim_jeans',
    category: 'bottoms',
    subCategory: 'jeans',
    styleKey: 'style.slim_fit',
    tags: ['casual', 'versatile', 'slim'],
    suitableSeasons: ['spring', 'summer', 'autumn', 'winter'],
    suitableOccasions: ['daily', 'casual', 'date', 'work'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 0,
    formality: 2
  },
  {
    id: 'jeans-wide-blue',
    nameKey: 'items.wide_jeans',
    category: 'bottoms',
    subCategory: 'jeans',
    styleKey: 'style.loose',
    tags: ['casual', 'comfortable', 'trendy'],
    suitableSeasons: ['spring', 'autumn', 'winter'],
    suitableOccasions: ['daily', 'casual'],
    colorName: 'blue',
    colorValue: '#3B82F6',
    layer: 0,
    formality: 1
  },
  
  // === 休闲裤 ===
  {
    id: 'pants-straight-black',
    nameKey: 'items.straight_casual_pants',
    category: 'bottoms',
    subCategory: 'casual_pants',
    styleKey: 'style.straight',
    tags: ['work', 'formal', 'basic'],
    suitableSeasons: ['spring', 'autumn', 'winter'],
    suitableOccasions: ['work', 'formal', 'daily'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 0,
    formality: 3
  },
  {
    id: 'pants-chino-beige',
    nameKey: 'items.chino_pants',
    category: 'bottoms',
    subCategory: 'casual_pants',
    styleKey: 'style.straight',
    tags: ['casual', 'work', 'basic'],
    suitableSeasons: ['spring', 'summer', 'autumn'],
    suitableOccasions: ['daily', 'casual', 'work'],
    colorName: 'beige',
    colorValue: '#F5F5DC',
    layer: 0,
    formality: 3
  },
  {
    id: 'jogger-black',
    nameKey: 'items.jogger_pants',
    category: 'bottoms',
    subCategory: 'sport_pants',
    styleKey: 'style.loose',
    tags: ['casual', 'sport', 'comfortable'],
    suitableSeasons: ['spring', 'autumn', 'winter'],
    suitableOccasions: ['casual', 'sport', 'daily'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 0,
    formality: 1
  },
  {
    id: 'jogger-gray',
    nameKey: 'items.jogger_pants',
    category: 'bottoms',
    subCategory: 'sport_pants',
    styleKey: 'style.loose',
    tags: ['casual', 'sport', 'comfortable'],
    suitableSeasons: ['spring', 'autumn', 'winter'],
    suitableOccasions: ['casual', 'sport', 'daily'],
    colorName: 'gray',
    colorValue: '#9CA3AF',
    layer: 0,
    formality: 1
  },
  
  // === 西裤/正装裤 ===
  {
    id: 'pants-suit-black',
    nameKey: 'items.black_formal_pants',
    category: 'bottoms',
    subCategory: 'formal_pants',
    styleKey: 'style.slim_fit',
    tags: ['formal', 'work', 'elegant'],
    suitableSeasons: ['spring', 'autumn', 'winter'],
    suitableOccasions: ['formal', 'work'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 0,
    formality: 5
  },
  
  // === 半身裙 ===
  {
    id: 'skirt-aline-black',
    nameKey: 'items.aline_skirt',
    category: 'bottoms',
    subCategory: 'skirt',
    styleKey: 'style.basic',
    tags: ['work', 'versatile', 'elegant'],
    suitableSeasons: ['spring', 'summer', 'autumn'],
    suitableOccasions: ['work', 'daily', 'date'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 0,
    formality: 3
  },
  {
    id: 'skirt-aline-blue',
    nameKey: 'items.aline_skirt',
    category: 'bottoms',
    subCategory: 'skirt',
    styleKey: 'style.basic',
    tags: ['casual', 'versatile'],
    suitableSeasons: ['spring', 'summer'],
    suitableOccasions: ['casual', 'daily', 'date'],
    colorName: 'blue',
    colorValue: '#3B82F6',
    layer: 0,
    formality: 3
  },
  
  // === 连衣裙 ===
  {
    id: 'dress-midi-floral',
    nameKey: 'items.floral_midi_dress',
    category: 'dresses',
    subCategory: 'midi_dress',
    styleKey: 'style.floral',
    tags: ['date', 'casual', 'elegant'],
    suitableSeasons: ['spring', 'summer'],
    suitableOccasions: ['date', 'casual', 'daily'],
    colorName: 'floral',
    colorValue: '#EC4899',
    layer: 0,
    formality: 3
  },
  {
    id: 'dress-short-black',
    nameKey: 'items.short_black_dress',
    category: 'dresses',
    subCategory: 'short_dress',
    styleKey: 'style.basic',
    tags: ['date', 'formal', 'elegant'],
    suitableSeasons: ['spring', 'summer'],
    suitableOccasions: ['date', 'formal'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 0,
    formality: 4
  },
  
  // === 外套 ===
  {
    id: 'blazer-tailored-black',
    nameKey: 'items.black_blazer',
    category: 'outerwear',
    subCategory: 'blazer',
    styleKey: 'style.slim_fit',
    tags: ['formal', 'work', 'elegant'],
    suitableSeasons: ['spring', 'autumn', 'winter'],
    suitableOccasions: ['formal', 'work'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 2,
    formality: 5
  },
  {
    id: 'jacket-denim-blue',
    nameKey: 'items.denim_jacket',
    category: 'outerwear',
    subCategory: 'jacket',
    styleKey: 'style.basic',
    tags: ['casual', 'versatile'],
    suitableSeasons: ['spring', 'autumn'],
    suitableOccasions: ['casual', 'daily'],
    colorName: 'blue',
    colorValue: '#3B82F6',
    layer: 2,
    formality: 2
  },
  {
    id: 'trench-coat-beige',
    nameKey: 'items.trench_coat',
    category: 'outerwear',
    subCategory: 'trench_coat',
    styleKey: 'style.basic',
    tags: ['smart', 'elegant', 'versatile'],
    suitableSeasons: ['spring', 'autumn'],
    suitableOccasions: ['work', 'daily', 'date'],
    colorName: 'beige',
    colorValue: '#F5F5DC',
    layer: 2,
    formality: 4
  },
  
  // === 鞋履 ===
  {
    id: 'shoes-sneakers-white',
    nameKey: 'items.white_sneakers',
    category: 'footwear',
    subCategory: 'sneakers',
    styleKey: 'style.basic',
    tags: ['casual', 'comfortable', 'versatile'],
    suitableSeasons: ['spring', 'summer', 'autumn'],
    suitableOccasions: ['casual', 'daily', 'sport'],
    colorName: 'white',
    colorValue: '#FFFFFF',
    layer: 0,
    formality: 1
  },
  {
    id: 'shoes-sneakers-black',
    nameKey: 'items.black_sneakers',
    category: 'footwear',
    subCategory: 'sneakers',
    styleKey: 'style.basic',
    tags: ['casual', 'comfortable', 'versatile'],
    suitableSeasons: ['spring', 'summer', 'autumn', 'winter'],
    suitableOccasions: ['casual', 'daily', 'sport'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 0,
    formality: 1
  },
  {
    id: 'shoes-oxford-black',
    nameKey: 'items.oxford_shoes',
    category: 'footwear',
    subCategory: 'leather_shoes',
    styleKey: 'style.basic',
    tags: ['formal', 'work', 'elegant'],
    suitableSeasons: ['spring', 'autumn', 'winter'],
    suitableOccasions: ['formal', 'work'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 0,
    formality: 5
  },
  {
    id: 'shoes-heels-black',
    nameKey: 'items.black_heels',
    category: 'footwear',
    subCategory: 'heels',
    styleKey: 'style.basic',
    tags: ['date', 'formal', 'elegant'],
    suitableSeasons: ['spring', 'summer', 'autumn', 'winter'],
    suitableOccasions: ['date', 'formal'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 0,
    formality: 4
  },
  {
    id: 'shoes-boots-black',
    nameKey: 'items.black_boots',
    category: 'footwear',
    subCategory: 'boots',
    styleKey: 'style.basic',
    tags: ['casual', 'work', 'versatile'],
    suitableSeasons: ['autumn', 'winter'],
    suitableOccasions: ['daily', 'work', 'casual'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 0,
    formality: 3
  },
  
  // === 配饰 ===
  {
    id: 'hat-baseball-black',
    nameKey: 'items.baseball_cap',
    category: 'accessories',
    subCategory: 'hat',
    styleKey: 'style.basic',
    tags: ['casual', 'sport'],
    suitableSeasons: ['spring', 'summer'],
    suitableOccasions: ['casual', 'sport', 'daily'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 0,
    formality: 1
  },
  {
    id: 'scarf-basic-black',
    nameKey: 'items.basic_scarf',
    category: 'accessories',
    subCategory: 'scarf',
    styleKey: 'style.basic',
    tags: ['winter', 'autumn', 'warm'],
    suitableSeasons: ['autumn', 'winter'],
    suitableOccasions: ['daily', 'work', 'casual'],
    colorName: 'black',
    colorValue: '#000000',
    layer: 2,
    formality: 3
  }
];