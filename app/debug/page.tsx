import { testDatabaseConnection } from '../lib/prisma';

export default async function DebugPage() {
  // 環境変数の確認
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL ? 'Set (length: ' + process.env.DATABASE_URL.length + ')' : 'Not set',
    JQUANTS_USERNAME: process.env.JQUANTS_USERNAME ? 'Set' : 'Not set',
    JQUANTS_PASSWORD: process.env.JQUANTS_PASSWORD ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
  };

  // データベース接続テスト
  let dbConnectionStatus = 'Unknown';
  try {
    const isConnected = await testDatabaseConnection();
    dbConnectionStatus = isConnected ? 'Success' : 'Failed';
  } catch (error) {
    dbConnectionStatus = 'Error: ' + (error as Error).message;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Debug Information</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Environment Variables</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="mb-2">
              <span className="font-mono font-semibold">{key}:</span> 
              <span className="ml-2">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Database Connection</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <span className="font-mono font-semibold">Status:</span> 
          <span className={`ml-2 ${dbConnectionStatus === 'Success' ? 'text-green-600' : 'text-red-600'}`}>
            {dbConnectionStatus}
          </span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Build Information</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="mb-2">
            <span className="font-mono font-semibold">Build Time:</span> 
            <span className="ml-2">{new Date().toISOString()}</span>
          </div>
          <div className="mb-2">
            <span className="font-mono font-semibold">Platform:</span> 
            <span className="ml-2">{typeof window !== 'undefined' ? 'Client' : 'Server'}</span>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p>このページは本番環境では削除してください。</p>
        <p>環境変数の設定とデータベース接続の確認用です。</p>
      </div>
    </div>
  );
}
