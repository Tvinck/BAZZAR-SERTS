/**
 * Apple device model ID → human-readable display name.
 */
const MODELS: Record<string, string> = {
  // iPhone 16 series
  'iPhone17,1': 'iPhone 16 Pro',
  'iPhone17,2': 'iPhone 16 Pro Max',
  'iPhone17,3': 'iPhone 16',
  'iPhone17,4': 'iPhone 16 Plus',
  'iPhone17,5': 'iPhone 16e',
  // iPhone 15 series
  'iPhone16,1': 'iPhone 15 Pro',
  'iPhone16,2': 'iPhone 15 Pro Max',
  'iPhone15,4': 'iPhone 15',
  'iPhone15,5': 'iPhone 15 Plus',
  // iPhone 14 series
  'iPhone15,2': 'iPhone 14 Pro',
  'iPhone15,3': 'iPhone 14 Pro Max',
  'iPhone14,7': 'iPhone 14',
  'iPhone14,8': 'iPhone 14 Plus',
  // iPhone 13 series
  'iPhone14,2': 'iPhone 13 Pro',
  'iPhone14,3': 'iPhone 13 Pro Max',
  'iPhone14,5': 'iPhone 13',
  'iPhone14,4': 'iPhone 13 mini',
  // iPhone 12 series
  'iPhone13,3': 'iPhone 12 Pro',
  'iPhone13,4': 'iPhone 12 Pro Max',
  'iPhone13,2': 'iPhone 12',
  'iPhone13,1': 'iPhone 12 mini',
  // iPhone 11 series
  'iPhone12,3': 'iPhone 11 Pro',
  'iPhone12,5': 'iPhone 11 Pro Max',
  'iPhone12,1': 'iPhone 11',
  // iPhone SE
  'iPhone14,6': 'iPhone SE (3rd gen)',
  'iPhone12,8': 'iPhone SE (2nd gen)',
  // iPhone X series
  'iPhone11,2': 'iPhone XS',
  'iPhone11,4': 'iPhone XS Max',
  'iPhone11,6': 'iPhone XS Max',
  'iPhone11,8': 'iPhone XR',
  'iPhone10,3': 'iPhone X',
  'iPhone10,6': 'iPhone X',
  // iPad Pro
  'iPad16,3': 'iPad Pro 13" (M4)',
  'iPad16,4': 'iPad Pro 13" (M4)',
  'iPad16,5': 'iPad Pro 11" (M4)',
  'iPad16,6': 'iPad Pro 11" (M4)',
  'iPad14,5': 'iPad Pro 12.9" (M2)',
  'iPad14,6': 'iPad Pro 12.9" (M2)',
  'iPad14,3': 'iPad Pro 11" (M2)',
  'iPad14,4': 'iPad Pro 11" (M2)',
  // iPad Air
  'iPad14,8': 'iPad Air (M2)',
  'iPad14,9': 'iPad Air (M2)',
  'iPad14,10': 'iPad Air 13" (M2)',
  'iPad14,11': 'iPad Air 13" (M2)',
  'iPad13,16': 'iPad Air (M1)',
  'iPad13,17': 'iPad Air (M1)',
  // iPad mini
  'iPad14,1': 'iPad mini (6th gen)',
  'iPad14,2': 'iPad mini (6th gen)',
  // iPad
  'iPad13,18': 'iPad (10th gen)',
  'iPad13,19': 'iPad (10th gen)',
  'iPad12,1': 'iPad (9th gen)',
  'iPad12,2': 'iPad (9th gen)',
}

/**
 * Convert Apple device model identifier to human-readable name.
 * e.g., "iPhone16,1" → "iPhone 15 Pro"
 */
export function getDeviceDisplayName(model: string | null | undefined): string {
  if (!model) return 'Apple устройство'
  return MODELS[model] || model
}

/**
 * Get a short model type (iPhone / iPad) from the model identifier.
 */
export function getDeviceType(model: string | null | undefined): 'iphone' | 'ipad' | 'unknown' {
  if (!model) return 'unknown'
  if (model.startsWith('iPhone')) return 'iphone'
  if (model.startsWith('iPad')) return 'ipad'
  return 'unknown'
}
