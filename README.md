# エンドポイント

このプロジェクトでは、以下の API エンドポイントを提供しています。

## 1. 認証

すべての `/api/v1/*` エンドポイントは Basic 認証を使用しています。認証情報は `.env` ファイルで設定します。

- **ユーザー名**: `HONO_USERNAME`
- **パスワード**: `HONO_PASSWORD`

リクエストヘッダーに以下を含めてください:

```
Authorization: Basic <Base64 エンコードされたユーザー名とパスワード>
```

## 2. エンドポイント一覧

### **GET `/`**

- **説明**: サーバーの動作確認用。
- **認証**: 不要
- **レスポンス**: `"Hello Inflexdb api!"`

### **GET `/api/v1/health`**

- **説明**: InfluxDB サーバーのヘルスチェック。
- **認証**: 必須

#### **リクエスト例**:

```
/api/v1/health
```

#### **レスポンス例**:

```json
{
  "name": "influxdb",
  "message": "ready for queries and writes",
  "status": "pass",
  "checks": [],
  "version": "2.7.11",
  "commit": "xx00x0x000"
}
```

### **GET /api/v1/bucket/create**

- **説明**: 新しいバケットを作成します。
- **認証**: 必須
- **クエリパラメータ**: bucketName (必須): 作成するバケットの名前。

#### **リクエスト例**:

```
/api/v1/bucket/create?bucketName=newBucket
```

#### **レスポンス例**:

成功時:

```
"Bucket created successfully"
```

エラー時:

```
エラーメッセージ
```

### **POST /api/v1/point/write**

- **説明**: データポイントを書き込みます。
- **認証**: 必須

- **リクエストボディ (JSON)**:

  - measurement (文字列, 必須): 測定名。
  - tags (オブジェクト, 必須): タグのキーと値。
  - fields (オブジェクト, 必須): フィールドのキーと値。
  - bucketName (文字列, 必須): 書き込むバケット名。
  - timestamp (数値, オプション): タイムスタンプ (ミリ秒)。

#### **リクエスト例**:

```bash
curl -u HONO_USERNAME:HONO_PASSWORD -X POST http://localhost:3004/api/v1/point/write \
-H "Content-Type: application/json" \
-d '{
  "measurement": "temperature",
  "tags": { "location": "office" },
  "fields": { "value": 23.5 },
  "bucketName": "my_bucket",
  "timestamp": 1690000000000
}'
```

#### **レスポンス**:

成功時:

```
"Point written successfully"
```

エラー時:

```
{err}
```
