export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// 共通のバリデーション関数
export function validateId(id: string): ValidationResult {
  if (isNaN(parseInt(id))) {
    return { isValid: false, error: '無効なIDです' };
  }
  return { isValid: true };
}

export function validatePairData(data: any): ValidationResult {
  if (!data.name) {
    return { isValid: false, error: 'ペア名は必須です' };
  }

  const buyShares = parseInt(data.buyShares);
  const sellShares = parseInt(data.sellShares);
  const buyPrice = parseFloat(data.buyPrice);
  const sellPrice = parseFloat(data.sellPrice);

  if (isNaN(buyShares) || isNaN(sellShares) || isNaN(buyPrice) || isNaN(sellPrice)) {
    return { isValid: false, error: '株数と単価は数値で入力してください' };
  }

  return { isValid: true };
}

export function validateCompanyData(data: any): ValidationResult {
  if (!data.name) {
    return { isValid: false, error: '企業名は必須です' };
  }
  return { isValid: true };
}

// 日付のバリデーションと変換
export function parseDate(dateString: string): Date | null {
  try {
    return new Date(dateString);
  } catch (error) {
    console.warn('Invalid date format:', dateString);
    return null;
  }
}
