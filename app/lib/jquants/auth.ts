/**
 * J-Quants API認証管理クラス
 */
class JQuantsAuth {
  private static instance: JQuantsAuth;
  private apiKey: string | null = null;
  private apiKeyExpiration: Date | null = null;

  private constructor() {}

  public static getInstance(): JQuantsAuth {
    if (!JQuantsAuth.instance) {
      JQuantsAuth.instance = new JQuantsAuth();
    }
    return JQuantsAuth.instance;
  }

  /**
   * APIキーを取得する
   * - キャッシュされたAPIキーが有効な場合はそれを返す
   * - 無効な場合は新しいAPIキーを取得する
   */
  public async getApiKey(): Promise<string> {
    if (this.isApiKeyValid()) {
      return this.apiKey!;
    }

    return await this.refreshApiKey();
  }

  /**
   * APIキーが有効かどうかを確認する
   * - APIキーが存在する
   * - 有効期限が切れていない（1時間前にリフレッシュする）
   */
  private isApiKeyValid(): boolean {
    if (!this.apiKey || !this.apiKeyExpiration) {
      return false;
    }

    // 有効期限の1時間前から更新する
    const oneHourAhead = new Date();
    oneHourAhead.setHours(oneHourAhead.getHours() + 1);

    return this.apiKeyExpiration > oneHourAhead;
  }

  /**
   * 新しいAPIキーを取得する
   */
  private async getRefreshToken(): Promise<string> {
    const username = process.env.JQUANTS_USERNAME;
    const password = process.env.JQUANTS_PASSWORD;
    
    if (!username || !password) {
      throw new Error('JQUANTS_USERNAME or JQUANTS_PASSWORD is not set in environment variables');
    }

    console.log('Getting refresh token...');

    const response = await fetch('https://api.jquants.com/v1/token/auth_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mailaddress: username,
        password: password
      }),
    });

    const responseText = await response.text();
    console.log('Auth API Response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });

    if (!response.ok) {
      throw new Error(`Failed to get refresh token: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${responseText} \n error: ${e}`);
    }

    if (!data.refreshToken) {
      console.error('Response data:', data);
      throw new Error('Refresh token not found in response');
    }

    return data.refreshToken;
  }

  private async refreshApiKey(): Promise<string> {
    console.log('Refreshing API key...');

    const refreshToken = await this.getRefreshToken();
    const response = await fetch(`https://api.jquants.com/v1/token/auth_refresh?refreshtoken=${refreshToken}`, {
      method: 'POST'
    });

    const responseText = await response.text();
    console.log('Token API Response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh API key: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${responseText} \n error: ${e}`);
    }

    if (!data.idToken) {
      console.error('Response data:', data);
      throw new Error('API key not found in response');
    }
    const apiKey = data.idToken as string;
    this.apiKey = apiKey;

    // APIキーの有効期限を24時間後に設定
    this.apiKeyExpiration = new Date();
    this.apiKeyExpiration.setHours(this.apiKeyExpiration.getHours() + 24);

    return apiKey;
  }
}

export default JQuantsAuth;
