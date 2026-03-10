const CATEGORIES = [
  'ballet',
  'jazz',
  'contemporary',
  'lyrical',
  'tap',
  'hip-hop',
  'figure-skating',
  'gymnastics',
  'ballroom',
  'musical-theatre',
  'other',
];

const CONDITIONS = [
  'new-with-tags',
  'like-new',
  'gently-used',
  'well-loved',
];

const PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
];

const LISTING_STATUSES = ['draft', 'active', 'sold', 'expired', 'removed'];

const PLATFORM_FEE_PERCENT = 8;

module.exports = { CATEGORIES, CONDITIONS, PROVINCES, LISTING_STATUSES, PLATFORM_FEE_PERCENT };
