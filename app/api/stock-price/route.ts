import { NextRequest, NextResponse } from 'next/server';
import JQuantsApi from '@/app/lib/jquants/api';

// 株価を取得するAPI
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stockCode = searchParams.get('code');
    
    if (!stockCode) {
      return NextResponse.json(
        { error: '証券コードが指定されていません' },
        { status: 400 }
      );
    }
    
    // 現在の日付を取得
    const today = new Date();
    const formattedDate = formatDate(today);
    
    // 7日前の日付を取得（休日や株価が取得できない日に対応するため）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const formattedSevenDaysAgo = formatDate(sevenDaysAgo);
    
    try {
      // J-Quants APIを使用して株価を取得
      const jquantsApi = JQuantsApi.getInstance();
      const quotes = await jquantsApi.getDailyQuotes(
        stockCode,
        formattedSevenDaysAgo,
        formattedDate
      );
      
      if (!quotes || quotes.length === 0) {
        return NextResponse.json(
          { error: '指定された証券コードの株価が見つかりません' },
          { status: 404 }
        );
      }
      
      // 最新の株価を取得（配列の最後の要素）
      const latestQuote = quotes[quotes.length - 1];
      const price = latestQuote.Close;
      
      return NextResponse.json({ 
        code: stockCode, 
        price,
        date: latestQuote.Date,
        open: latestQuote.Open,
        high: latestQuote.High,
        low: latestQuote.Low,
        volume: latestQuote.Volume
      });
    } catch (apiError) {
      console.error('J-Quants APIでの株価取得に失敗しました:', apiError);
      
      // APIエラーの場合は404を返す
      return NextResponse.json(
        { error: '指定された証券コードの株価が見つかりません' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('株価の取得に失敗しました:', error);
    return NextResponse.json(
      { error: '株価の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 日付をYYYY-MM-DD形式にフォーマットする関数
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
