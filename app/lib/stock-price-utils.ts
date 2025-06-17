import JQuantsApi from '@/app/lib/jquants/api';

/**
 * 日付をYYYY-MM-DD形式にフォーマットする関数
 * @param date フォーマットする日付
 * @returns YYYY-MM-DD形式の文字列
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 現在の日付と指定日数前の日付を取得する
 * @param daysBefore 何日前まで取得するか（デフォルト: 7日）
 * @returns from（開始日）とto（終了日）のオブジェクト
 */
export function getDateRange(daysBefore: number = 7): { from: string; to: string } {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - daysBefore);
  
  return {
    from: formatDate(pastDate),
    to: formatDate(today)
  };
}

/**
 * 現在の時間帯に応じて適切な株価を取得する関数
 * 前場終値: 11:30時点で確定
 * 後場終値（その日の終値）: 15:00時点で確定
 * @param stockCode 証券コード
 * @param daysBefore 何日前まで遡って株価を取得するか（デフォルト: 7日）
 * @returns 株価（取得できない場合はnull）
 */
export async function fetchStockPrice(stockCode: string, daysBefore: number = 7): Promise<number | null> {
  try {
    const jquantsApi = JQuantsApi.getInstance();
    const { from, to } = getDateRange(daysBefore);
    
    console.log(`証券コード ${stockCode} の株価を取得中... (期間: ${from} - ${to})`);
    
    // J-Quants APIから株価データを取得
    const quotes = await jquantsApi.getDailyQuotes(stockCode, from, to);
    
    if (!quotes || quotes.length === 0) {
      console.error(`証券コード ${stockCode} の株価データが見つかりません`);
      return null;
    }
    
    // 最新の株価を取得（配列の最後の要素）
    const latestQuote = quotes[quotes.length - 1];
    
    // 現在の時間を取得
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 100 + currentMinute; // HHMMの形式で時間を表現
    
    let price: number;
    let priceType: string;
    
    // 時間帯に応じて適切な株価を選択
    if (currentTime >= 1500) {
      // 15:00以降は後場終値（その日の終値）
      price = latestQuote.AfternoonClose || latestQuote.Close;
      priceType = "後場終値（終値）";
    } else if (currentTime >= 1130) {
      // 11:30-14:59は前場終値
      price = latestQuote.MorningClose || latestQuote.Close;
      priceType = "前場終値";
    } else {
      // 11:30より前は前日の終値
      price = latestQuote.Close;
      priceType = "前日終値";
    }
    
    console.log(`証券コード ${stockCode} の株価を取得: ${price}円 (${priceType}, ${latestQuote.Date || '日付不明'})`);
    return price;
    
  } catch (error) {
    console.error(`証券コード ${stockCode} の株価取得中にエラーが発生しました:`, error);
    return null;
  }
}

