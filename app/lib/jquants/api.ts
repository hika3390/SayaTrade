import JQuantsAuth from './auth';

export interface DailyQuote {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  MorningClose: number;     // 前場終値
  AfternoonClose: number;   // 後場終値
  Volume: number;
  AdjustmentClose?: number;  // 調整後終値
  VWAP?: number;             // 出来高加重平均価格
  TurnoverValue?: number;    // 売買代金
  SharesOutstanding?: number; // 発行済株式数
  MarketCapitalization?: number; // 時価総額
  
  // ファンダメンタル指標
  PER?: number;              // 株価収益率
  PBR?: number;              // 株価純資産倍率
  DividendYield?: number;    // 配当利回り
  EPS?: number;              // 1株あたり利益
  BPS?: number;              // 1株あたり純資産
  ROE?: number;              // 自己資本利益率
  ROA?: number;              // 総資産利益率
  EquityRatio?: number;      // 自己資本比率
  
  // 財務データ
  Revenue?: number;          // 売上高
  OperatingIncome?: number;  // 営業利益
  OrdinaryIncome?: number;   // 経常利益
  NetIncome?: number;        // 純利益
  TotalAssets?: number;      // 総資産
  NetAssets?: number;        // 純資産
  CashFlow?: number;         // キャッシュフロー
  
  // 企業・市場情報
  Code?: string;             // 証券コード
  Name?: string;             // 銘柄名
  Market?: string;           // 市場区分
  Industry?: string;         // 業種
  Sector?: string;           // セクター
}

/**
 * J-Quants API呼び出しクラス
 */
class JQuantsApi {
  private static instance: JQuantsApi;
  private auth: JQuantsAuth;

  private constructor() {
    this.auth = JQuantsAuth.getInstance();
  }

  public static getInstance(): JQuantsApi {
    if (!JQuantsApi.instance) {
      JQuantsApi.instance = new JQuantsApi();
    }
    return JQuantsApi.instance;
  }

  /**
   * 日足の株価データを取得
   * @param code 証券コード
   * @param from 開始日（YYYY-MM-DD形式）
   * @param to 終了日（YYYY-MM-DD形式）
   */
  public async getDailyQuotes(
    code: string,
    from: string,
    to: string
  ): Promise<DailyQuote[]> {
    const apiKey = await this.auth.getApiKey();

    console.log('Fetching daily quotes with params:', { code, from, to });
    console.log('Using API key:', apiKey);

    const response = await fetch(
      `https://api.jquants.com/v1/prices/daily_quotes?code=${code}&from=${from}&to=${to}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to fetch daily quotes: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);
    
    if (!data.daily_quotes) {
      throw new Error('Daily quotes not found in response');
    }

    return data.daily_quotes;
  }

  /**
   * 指定した証券コードが存在するかチェック
   * @param code 証券コード
   */
  public async validateStockCode(code: string): Promise<boolean> {
    const apiKey = await this.auth.getApiKey();

    const response = await fetch(
      `https://api.jquants.com/v1/listed/info?code=${code}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.info && data.info.length > 0;
  }
}

export default JQuantsApi;
