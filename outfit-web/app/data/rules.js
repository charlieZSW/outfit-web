// 示例搭配规则数据
export const rulesData = [
  {
    id: 'look-001',
    name: '蓝白基础休闲夏日Look',
    targetOccasion: '休闲',
    targetSeason: '夏',
    requiredItems: [
      { itemId: 'tshirt-crewneck-regular-white' },
      { itemId: 'jeans-straight-blue' },
      { itemId: 'shoes-sneakers-white' }
    ],
    resultImage: '/images/looks/look-001.svg',
    description: '经典的蓝白搭配，清爽舒适，适合夏日休闲场合。'
  },
  {
    id: 'look-002',
    name: '黑白简约通勤Look',
    targetOccasion: '通勤',
    targetSeason: '春',
    requiredItems: [
      { itemId: 'shirt-basic-white' },
      { itemId: 'pants-straight-black' },
      { itemId: 'shoes-oxford-black' }
    ],
    resultImage: '/images/looks/look-002.svg',
    description: '经典黑白配色，简约大方，适合日常通勤场合。'
  },
  {
    id: 'look-003',
    name: '休闲牛仔秋季Look',
    targetOccasion: '休闲',
    targetSeason: '秋',
    requiredItems: [
      { itemId: 'sweater-basic-beige' },
      { itemId: 'jeans-straight-blue' },
      { itemId: 'shoes-sneakers-white' }
    ],
    resultImage: '/images/looks/look-003.svg',
    description: '舒适温暖的针织衫搭配牛仔裤，适合秋季休闲场合。'
  },
  {
    id: 'look-004',
    name: '约会优雅春季Look',
    targetOccasion: '约会',
    targetSeason: '春',
    requiredItems: [
      { itemId: 'dress-midi-floral' },
      { itemId: 'shoes-heels-black' }
    ],
    resultImage: '/images/looks/look-004.svg',
    description: '优雅的花色连衣裙搭配高跟鞋，适合春季约会场合。'
  },
  {
    id: 'look-005',
    name: '正式场合冬季Look',
    targetOccasion: '正式',
    targetSeason: '冬',
    requiredItems: [
      { itemId: 'blazer-tailored-black' },
      { itemId: 'pants-suit-black' },
      { itemId: 'shirt-basic-white' },
      { itemId: 'shoes-oxford-black' }
    ],
    resultImage: '/images/looks/look-005.svg',
    description: '经典西装套装，正式大方，适合冬季商务场合。'
  },
  {
    id: 'look-006',
    name: '日常黑白简约Look',
    targetOccasion: '日常',
    targetSeason: '春',
    requiredItems: [
      { itemId: 'tshirt-crewneck-regular-black' },
      { itemId: 'jeans-slim-blue' },
      { itemId: 'shoes-sneakers-white' }
    ],
    resultImage: '/images/looks/look-001.svg', // 复用类似的图片
    description: '黑色T恤搭配蓝色牛仔裤，百搭舒适，适合日常多种场合。'
  },
  {
    id: 'look-007',
    name: '运动休闲春季Look',
    targetOccasion: '运动',
    targetSeason: '春',
    requiredItems: [
      { itemId: 'tshirt-crewneck-regular-white' },
      { itemId: 'jogger-gray' },
      { itemId: 'shoes-sneakers-black' },
      { itemId: 'hat-baseball-black' }
    ],
    resultImage: '/images/looks/look-003.svg', // 复用类似的图片
    description: '舒适的白色T恤搭配灰色运动裤和黑色运动鞋，活力十足。'
  },
  {
    id: 'look-008',
    name: '工作场合夏季Look',
    targetOccasion: '工作',
    targetSeason: '夏',
    requiredItems: [
      { itemId: 'shirt-slim-fit-white' },
      { itemId: 'pants-straight-black' },
      { itemId: 'shoes-oxford-black' }
    ],
    resultImage: '/images/looks/look-002.svg', // 复用类似的图片
    description: '修身白衬衫搭配黑色休闲裤，专业得体，适合夏季工作场合。'
  },
  {
    id: 'look-009',
    name: '夏日休闲条纹Look',
    targetOccasion: '休闲',
    targetSeason: '夏',
    requiredItems: [
      { itemId: 'tshirt-crewneck-striped-blue' },
      { itemId: 'jeans-slim-black' },
      { itemId: 'shoes-sneakers-white' }
    ],
    resultImage: '/images/looks/look-001.svg', // 复用类似的图片
    description: '蓝白条纹T恤搭配黑色修身牛仔裤，清新活力，适合夏日休闲场合。'
  },
  {
    id: 'look-010',
    name: '秋季通勤衬衫Look',
    targetOccasion: '通勤',
    targetSeason: '秋',
    requiredItems: [
      { itemId: 'shirt-basic-blue' },
      { itemId: 'pants-chino-beige' },
      { itemId: 'shoes-oxford-black' }
    ],
    resultImage: '/images/looks/look-002.svg', // 复用类似的图片
    description: '蓝色衬衫搭配米色休闲裤，沉稳大方，适合秋季通勤场合。'
  },
  {
    id: 'look-011',
    name: '冬季休闲暖和Look',
    targetOccasion: '休闲',
    targetSeason: '冬',
    requiredItems: [
      { itemId: 'sweater-basic-gray' },
      { itemId: 'jeans-slim-blue' },
      { itemId: 'shoes-boots-black' },
      { itemId: 'scarf-basic-black' }
    ],
    resultImage: '/images/looks/look-003.svg', // 复用类似的图片
    description: '灰色毛衣搭配蓝色牛仔裤和黑色短靴，温暖舒适，适合冬季休闲场合。'
  },
  {
    id: 'look-012',
    name: '秋季约会优雅Look',
    targetOccasion: '约会',
    targetSeason: '秋',
    requiredItems: [
      { itemId: 'dress-short-black' },
      { itemId: 'trench-coat-beige' },
      { itemId: 'shoes-heels-black' }
    ],
    resultImage: '/images/looks/look-004.svg', // 复用类似的图片
    description: '黑色短裙搭配米色风衣，优雅迷人，适合秋季约会场合。'
  },
  {
    id: 'look-013',
    name: '春季正式会议Look',
    targetOccasion: '正式',
    targetSeason: '春',
    requiredItems: [
      { itemId: 'blazer-tailored-black' },
      { itemId: 'shirt-basic-white' },
      { itemId: 'pants-suit-black' },
      { itemId: 'shoes-oxford-black' }
    ],
    resultImage: '/images/looks/look-005.svg', // 复用类似的图片
    description: '黑色西装搭配白色衬衫，正式大方，适合春季商务场合。'
  },
  {
    id: 'look-014',
    name: '冬季工作专业Look',
    targetOccasion: '工作',
    targetSeason: '冬',
    requiredItems: [
      { itemId: 'sweater-vneck-black' },
      { itemId: 'shirt-basic-white' },
      { itemId: 'pants-straight-black' },
      { itemId: 'shoes-oxford-black' }
    ],
    resultImage: '/images/looks/look-005.svg', // 复用类似的图片
    description: '黑色V领毛衣内搭白衬衫，专业沉稳，适合冬季工作场合。'
  },
  {
    id: 'look-015',
    name: '夏季约会轻盈Look',
    targetOccasion: '约会',
    targetSeason: '夏',
    requiredItems: [
      { itemId: 'tshirt-vneck-slim-white' },
      { itemId: 'skirt-aline-blue' },
      { itemId: 'shoes-heels-black' }
    ],
    resultImage: '/images/looks/look-004.svg', // 复用类似的图片
    description: '白色V领T恤搭配蓝色A字裙，清新优雅，适合夏季约会场合。'
  },
  {
    id: 'look-016',
    name: '秋季牛仔外套休闲Look',
    targetOccasion: '休闲',
    targetSeason: '秋',
    requiredItems: [
      { itemId: 'tshirt-crewneck-regular-white' },
      { itemId: 'jacket-denim-blue' },
      { itemId: 'jeans-slim-black' },
      { itemId: 'shoes-sneakers-white' }
    ],
    resultImage: '/images/looks/look-001.svg', // 复用类似的图片
    description: '白色T恤内搭蓝色牛仔外套，搭配黑色牛仔裤，经典百搭，适合秋季休闲场合。'
  },
  {
    id: 'look-017',
    name: '冬季日常通勤Look',
    targetOccasion: '日常',
    targetSeason: '冬',
    requiredItems: [
      { itemId: 'shirt-basic-blue' },
      { itemId: 'trench-coat-beige' },
      { itemId: 'pants-straight-black' },
      { itemId: 'shoes-boots-black' }
    ],
    resultImage: '/images/looks/look-002.svg', // 复用类似的图片
    description: '蓝色衬衫内搭米色风衣，搭配黑色休闲裤，温暖时尚，适合冬季日常通勤。'
  },
  {
    id: 'look-018',
    name: '春季日常休闲Look',
    targetOccasion: '日常',
    targetSeason: '春',
    requiredItems: [
      { itemId: 'hoodie-basic-gray' },
      { itemId: 'jeans-wide-blue' },
      { itemId: 'shoes-sneakers-black' }
    ],
    resultImage: '/images/looks/look-003.svg', // 复用类似的图片
    description: '灰色卫衣搭配蓝色阔腿牛仔裤，舒适随性，适合春季日常休闲场合。'
  },
  {
    id: 'look-019',
    name: '夏季工作女性Look',
    targetOccasion: '工作',
    targetSeason: '夏',
    requiredItems: [
      { itemId: 'shirt-basic-white' },
      { itemId: 'skirt-aline-black' },
      { itemId: 'shoes-heels-black' }
    ],
    resultImage: '/images/looks/look-004.svg', // 复用类似的图片
    description: '白色衬衫搭配黑色A字裙，干练优雅，适合夏季工作场合。'
  },
  {
    id: 'look-020',
    name: '冬季约会温暖Look',
    targetOccasion: '约会',
    targetSeason: '冬',
    requiredItems: [
      { itemId: 'sweater-vneck-black' },
      { itemId: 'jeans-slim-blue' },
      { itemId: 'trench-coat-beige' },
      { itemId: 'shoes-boots-black' }
    ],
    resultImage: '/images/looks/look-005.svg', // 复用类似的图片
    description: '黑色毛衣搭配蓝色牛仔裤和米色风衣，温暖时尚，适合冬季约会场合。'
  }
];

// 搭配规则，用于评估服装组合的合理性
export const matchingRules = [
  {
    id: 'default-balance-formality',
    nameKey: 'rules.balance_formality',
    description: 'rules.balance_formality_desc',
    category: 'general',
    priority: 100,
    condition: (items) => {
      if (items.length < 2) return { pass: true, score: 0 };
      
      // 计算平均正式程度
      const totalFormality = items.reduce((sum, item) => sum + item.formality, 0);
      const averageFormality = totalFormality / items.length;
      
      // 计算标准差
      const formalityVariance = items.reduce((sum, item) => {
        const diff = item.formality - averageFormality;
        return sum + diff * diff;
      }, 0) / items.length;
      
      // 标准差大于1.5视为不协调
      if (formalityVariance > 2.25) {
        return {
          pass: false,
          score: -10,
          messageKey: 'matching.formality_mismatch'
        };
      }
      
      return { pass: true, score: 5 };
    }
  },
  {
    id: 'default-color-harmony',
    nameKey: 'rules.color_harmony',
    description: 'rules.color_harmony_desc',
    category: 'general',
    priority: 90,
    condition: (items) => {
      if (items.length < 2) return { pass: true, score: 0 };
      
      // 检查基本色彩数量（黑、白、灰、米色不计入）
      const basicColors = ['black', 'white', 'gray', 'beige'];
      const colorCount = new Set(
        items
          .filter(item => !basicColors.includes(item.colorName))
          .map(item => item.colorName)
      ).size;
      
      // 彩色数量超过2种视为过于杂乱
      if (colorCount > 2) {
        return {
          pass: false,
          score: -5,
          messageKey: 'matching.too_many_colors'
        };
      }
      
      return { pass: true, score: 5 };
    }
  },
  {
    id: 'seasonal-match',
    nameKey: 'rules.seasonal_match',
    description: 'rules.seasonal_match_desc',
    category: 'season',
    priority: 80,
    condition: (items, context) => {
      if (!context.season || items.length === 0) return { pass: true, score: 0 };
      
      // 检查每件衣物是否适合当前季节
      const unsuitable = items.filter(
        item => !item.suitableSeasons.includes(context.season)
      );
      
      if (unsuitable.length > 0) {
        return {
          pass: false,
          score: -10 * unsuitable.length,
          messageKey: 'matching.season_mismatch',
          affectedItems: unsuitable.map(item => item.id)
        };
      }
      
      return { pass: true, score: 10 };
    }
  },
  {
    id: 'occasion-match',
    nameKey: 'rules.occasion_match',
    description: 'rules.occasion_match_desc',
    category: 'occasion',
    priority: 85,
    condition: (items, context) => {
      if (!context.occasion || items.length === 0) return { pass: true, score: 0 };
      
      // 检查每件衣物是否适合当前场合
      const unsuitable = items.filter(
        item => !item.suitableOccasions.includes(context.occasion)
      );
      
      if (unsuitable.length > 0) {
        return {
          pass: false,
          score: -10 * unsuitable.length,
          messageKey: 'matching.occasion_mismatch',
          affectedItems: unsuitable.map(item => item.id)
        };
      }
      
      return { pass: true, score: 10 };
    }
  },
  {
    id: 'formal-shoes-with-formal-outfit',
    nameKey: 'rules.formal_shoes_match',
    description: 'rules.formal_shoes_match_desc',
    category: 'specific',
    priority: 70,
    condition: (items) => {
      // 检查是否有正装鞋和正式服饰
      const hasHighFormalityItems = items.some(item => 
        item.formality >= 4 && item.category !== 'footwear'
      );
      
      const hasHighFormalityShoes = items.some(item => 
        item.category === 'footwear' && item.formality >= 4
      );
      
      const hasCasualShoes = items.some(item => 
        item.category === 'footwear' && item.formality <= 2
      );
      
      // 如果有正式服饰但没有正式鞋履
      if (hasHighFormalityItems && !hasHighFormalityShoes && hasCasualShoes) {
        return {
          pass: false,
          score: -10,
          messageKey: 'matching.formal_needs_formal_shoes'
        };
      }
      
      return { pass: true, score: 0 };
    }
  },
  {
    id: 'match-top-bottom-formality',
    nameKey: 'rules.top_bottom_formality',
    description: 'rules.top_bottom_formality_desc',
    category: 'specific',
    priority: 75,
    condition: (items) => {
      const tops = items.filter(item => item.category === 'tops');
      const bottoms = items.filter(item => item.category === 'bottoms');
      
      if (tops.length === 0 || bottoms.length === 0) return { pass: true, score: 0 };
      
      // 计算上下装正式度差异
      const topFormality = Math.max(...tops.map(item => item.formality));
      const bottomFormality = Math.max(...bottoms.map(item => item.formality));
      
      if (Math.abs(topFormality - bottomFormality) > 2) {
        return {
          pass: false,
          score: -10,
          messageKey: 'matching.top_bottom_formality_mismatch'
        };
      }
      
      return { pass: true, score: 5 };
    }
  },
  {
    id: 'avoid-pattern-clash',
    nameKey: 'rules.avoid_pattern_clash',
    description: 'rules.avoid_pattern_clash_desc',
    category: 'style',
    priority: 65,
    condition: (items) => {
      // 检查有图案的衣物数量
      const patternItems = items.filter(item => 
        item.styleKey === 'style.floral' || 
        item.styleKey === 'style.striped' || 
        item.tags.includes('pattern')
      );
      
      if (patternItems.length > 1) {
        return {
          pass: false,
          score: -5,
          messageKey: 'matching.too_many_patterns',
          affectedItems: patternItems.map(item => item.id)
        };
      }
      
      return { pass: true, score: 5 };
    }
  },
  {
    id: 'match-style-consistency',
    nameKey: 'rules.style_consistency',
    description: 'rules.style_consistency_desc',
    category: 'style',
    priority: 60,
    condition: (items) => {
      if (items.length < 3) return { pass: true, score: 0 };
      
      // 检查风格标签的一致性
      const allTags = items.flatMap(item => item.tags);
      const tagCounts = {};
      
      allTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      
      // 找出出现最多的风格标签
      let maxTag = null;
      let maxCount = 0;
      
      for (const tag in tagCounts) {
        if (tagCounts[tag] > maxCount) {
          maxCount = tagCounts[tag];
          maxTag = tag;
        }
      }
      
      // 计算一致性得分
      const consistency = maxCount / items.length;
      
      if (consistency < 0.5) {
        return {
          pass: false,
          score: -5,
          messageKey: 'matching.inconsistent_style'
        };
      }
      
      return { pass: true, score: 5 };
    }
  },
  {
    id: 'winter-layering',
    nameKey: 'rules.winter_layering',
    description: 'rules.winter_layering_desc',
    category: 'season',
    priority: 75,
    condition: (items, context) => {
      if (context.season !== 'winter') return { pass: true, score: 0 };
      
      // 在冬季，检查是否有足够的保暖层次
      const hasOuterwear = items.some(item => 
        item.category === 'outerwear' && item.layer >= 2
      );
      
      if (!hasOuterwear) {
        return {
          pass: false,
          score: -10,
          messageKey: 'matching.missing_winter_outerwear'
        };
      }
      
      return { pass: true, score: 10 };
    }
  },
  {
    id: 'summer-light-fabrics',
    nameKey: 'rules.summer_light_fabrics',
    description: 'rules.summer_light_fabrics_desc',
    category: 'season',
    priority: 75,
    condition: (items, context) => {
      if (context.season !== 'summer') return { pass: true, score: 0 };
      
      // 在夏季，检查是否有厚重的外套
      const hasHeavyOuterwear = items.some(item => 
        item.category === 'outerwear' && 
        (item.subCategory === 'coat' || item.subCategory === 'down_jacket')
      );
      
      if (hasHeavyOuterwear) {
        return {
          pass: false,
          score: -15,
          messageKey: 'matching.heavy_outerwear_in_summer',
          affectedItems: items.filter(item => 
            item.category === 'outerwear' && 
            (item.subCategory === 'coat' || item.subCategory === 'down_jacket')
          ).map(item => item.id)
        };
      }
      
      return { pass: true, score: 5 };
    }
  },
  {
    id: 'dress-complete-look',
    nameKey: 'rules.dress_complete_look',
    description: 'rules.dress_complete_look_desc',
    category: 'specific',
    priority: 70,
    condition: (items) => {
      // 当有连衣裙时，不需要上衣和下装
      const hasDress = items.some(item => item.category === 'dresses');
      const hasTops = items.some(item => item.category === 'tops');
      const hasBottoms = items.some(item => item.category === 'bottoms');
      
      if (hasDress && (hasTops || hasBottoms)) {
        return {
          pass: false,
          score: -10,
          messageKey: 'matching.redundant_with_dress',
          affectedItems: items.filter(item => 
            hasTops && item.category === 'tops' || 
            hasBottoms && item.category === 'bottoms'
          ).map(item => item.id)
        };
      }
      
      return { pass: true, score: 0 };
    }
  },
  {
    id: 'complete-outfit-check',
    nameKey: 'rules.complete_outfit',
    description: 'rules.complete_outfit_desc',
    category: 'general',
    priority: 95,
    condition: (items) => {
      // 检查是否有上装和下装，或者连衣裙
      const hasTops = items.some(item => item.category === 'tops');
      const hasBottoms = items.some(item => item.category === 'bottoms');
      const hasDress = items.some(item => item.category === 'dresses');
      const hasFootwear = items.some(item => item.category === 'footwear');
      
      const hasBasicOutfit = (hasTops && hasBottoms) || hasDress;
      
      if (!hasBasicOutfit) {
        return {
          pass: false,
          score: -20,
          messageKey: 'matching.incomplete_outfit_basic'
        };
      }
      
      if (!hasFootwear) {
        return {
          pass: false,
          score: -10,
          messageKey: 'matching.incomplete_outfit_shoes'
        };
      }
      
      return { pass: true, score: 10 };
    }
  },
  {
    id: 'layering-logic',
    nameKey: 'rules.layering_logic',
    description: 'rules.layering_logic_desc',
    category: 'specific',
    priority: 80,
    condition: (items) => {
      // 检查层级逻辑是否合理
      const topsByLayer = {};
      
      items.forEach(item => {
        if (item.category === 'tops' || item.category === 'outerwear') {
          if (!topsByLayer[item.layer]) {
            topsByLayer[item.layer] = [];
          }
          topsByLayer[item.layer].push(item);
        }
      });
      
      // 确保不同层级没有太多重叠
      for (const layer in topsByLayer) {
        if (topsByLayer[layer].length > 1) {
          return {
            pass: false,
            score: -5,
            messageKey: 'matching.too_many_same_layer',
            affectedItems: topsByLayer[layer].map(item => item.id)
          };
        }
      }
      
      return { pass: true, score: 5 };
    }
  },
  {
    id: 'formal-occasion-formality',
    nameKey: 'rules.formal_occasion_formality',
    description: 'rules.formal_occasion_formality_desc',
    category: 'occasion',
    priority: 85,
    condition: (items, context) => {
      if (context.occasion !== 'formal') return { pass: true, score: 0 };
      
      // 正式场合需要足够正式的服装
      const averageFormality = items.reduce((sum, item) => sum + item.formality, 0) / items.length;
      
      if (averageFormality < 3.5) {
        return {
          pass: false,
          score: -15,
          messageKey: 'matching.not_formal_enough'
        };
      }
      
      return { pass: true, score: 10 };
    }
  },
  {
    id: 'casual-comfort',
    nameKey: 'rules.casual_comfort',
    description: 'rules.casual_comfort_desc',
    category: 'occasion',
    priority: 85,
    condition: (items, context) => {
      if (context.occasion !== 'casual') return { pass: true, score: 0 };
      
      // 休闲场合不宜太正式
      const tooFormalItems = items.filter(item => item.formality > 4);
      
      if (tooFormalItems.length > 0) {
        return {
          pass: false,
          score: -10,
          messageKey: 'matching.too_formal_for_casual',
          affectedItems: tooFormalItems.map(item => item.id)
        };
      }
      
      return { pass: true, score: 5 };
    }
  },
  {
    id: 'sport-functional',
    nameKey: 'rules.sport_functional',
    description: 'rules.sport_functional_desc',
    category: 'occasion',
    priority: 85,
    condition: (items, context) => {
      if (context.occasion !== 'sport') return { pass: true, score: 0 };
      
      // 运动场合需要功能性
      const suitableSportItems = items.filter(item => 
        item.tags.includes('sport') || item.tags.includes('comfortable')
      );
      
      if (suitableSportItems.length < Math.ceil(items.length / 2)) {
        return {
          pass: false,
          score: -10,
          messageKey: 'matching.not_suitable_for_sport'
        };
      }
      
      return { pass: true, score: 10 };
    }
  },
  {
    id: 'date-impression',
    nameKey: 'rules.date_impression',
    description: 'rules.date_impression_desc',
    category: 'occasion',
    priority: 85,
    condition: (items, context) => {
      if (context.occasion !== 'date') return { pass: true, score: 0 };
      
      // 约会场合需要得体且吸引人
      const hasDressyItem = items.some(item => 
        item.formality >= 3 || item.tags.includes('elegant')
      );
      
      if (!hasDressyItem) {
        return {
          pass: false,
          score: -5,
          messageKey: 'matching.too_casual_for_date'
        };
      }
      
      return { pass: true, score: 5 };
    }
  },
  {
    id: 'work-professional',
    nameKey: 'rules.work_professional',
    description: 'rules.work_professional_desc',
    category: 'occasion',
    priority: 85,
    condition: (items, context) => {
      if (context.occasion !== 'work') return { pass: true, score: 0 };
      
      // 工作场合需要专业
      const unprofessionalItems = items.filter(item => 
        item.formality < 2 || 
        item.tags.includes('sport') || 
        item.subCategory === 'hoodie'
      );
      
      if (unprofessionalItems.length > 0) {
        return {
          pass: false,
          score: -10,
          messageKey: 'matching.unprofessional_for_work',
          affectedItems: unprofessionalItems.map(item => item.id)
        };
      }
      
      return { pass: true, score: 10 };
    }
  },
  {
    id: 'accessory-quantity',
    nameKey: 'rules.accessory_quantity',
    description: 'rules.accessory_quantity_desc',
    category: 'specific',
    priority: 60,
    condition: (items) => {
      // 配饰数量不宜过多
      const accessories = items.filter(item => item.category === 'accessories');
      
      if (accessories.length > 3) {
        return {
          pass: false,
          score: -5,
          messageKey: 'matching.too_many_accessories',
          affectedItems: accessories.map(item => item.id)
        };
      }
      
      return { pass: true, score: 0 };
    }
  },
  {
    id: 'monochrome-elegance',
    nameKey: 'rules.monochrome_elegance',
    description: 'rules.monochrome_elegance_desc',
    category: 'style',
    priority: 55,
    condition: (items) => {
      // 单色系搭配加分
      const colors = new Set(items.map(item => item.colorName));
      const neutrals = ['black', 'white', 'gray', 'beige'];
      
      // 如果只有一种彩色加中性色
      if (colors.size <= 2 && 
          [...colors].some(color => !neutrals.includes(color)) && 
          [...colors].some(color => neutrals.includes(color))) {
        return {
          pass: true,
          score: 10,
          messageKey: 'matching.elegant_monochrome'
        };
      }
      
      // 如果全是中性色
      if ([...colors].every(color => neutrals.includes(color))) {
        return {
          pass: true,
          score: 5,
          messageKey: 'matching.clean_neutral_palette'
        };
      }
      
      return { pass: true, score: 0 };
    }
  }
];
