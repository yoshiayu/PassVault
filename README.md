<img width="1426" height="558" alt="スクリーンショット 2026-01-27 16 26 09" src="https://github.com/user-attachments/assets/335974a4-7890-427d-87db-3b406e344118" />

<img width="1421" height="811" alt="スクリーンショット 2026-01-27 16 27 45" src="https://github.com/user-attachments/assets/43c563e5-adaa-4f07-a80b-e2c011c55991" />

<img width="1418" height="814" alt="スクリーンショット 2026-01-27 16 44 33" src="https://github.com/user-attachments/assets/fe427505-5d13-4b53-8781-459ab8682820" />

# PassVault QR

パスワードの生成・期限管理・QR引き渡しを標準化する社内向け運用アプリです。  
強度ルールに基づいた自動生成と短命QRトークンで、安全な共有を実現します。

## 概要

- 生成ルールに従って強固なパスワードを自動生成
- 期限切れを前提にしたライフサイクル管理
- システム単位での資格情報管理
- QRトークンによる安全な引き渡し（1回限り）
- 監査ログで操作履歴を記録

## 技術スタック

- Framework: Next.js 14 (App Router)
- Language: TypeScript (Node.js 20+)
- UI: Tailwind CSS + glassmorphism theme
- Auth: NextAuth.js (Google OAuth)
- DB: PostgreSQL
- ORM: Prisma
- State/Data: React Query + Server Actions
- QR: qrcode

## 起動方法

### 1) 依存関係をインストール

```bash
npm install
```

### 2) .env を作成

`.env.example` を参考に `.env` を作成し、以下を設定します。

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/passvault?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="任意のランダム文字列"
GOOGLE_CLIENT_ID="Google OAuth Client ID"
GOOGLE_CLIENT_SECRET="Google OAuth Client Secret"
ALLOWED_EMAIL_DOMAINS="gmail.com,company.co.jp"
DATA_ENCRYPTION_KEY="32bytes base64 key"
```

> 注意: `DATA_ENCRYPTION_KEY` は 32 bytes の base64 文字列が必須です。

### 3) DBマイグレーション

```bash
npm run prisma:migrate
```

### 4) 開発サーバ起動

```bash
npm run dev -- -p 3000
```

ブラウザで開く:  
`http://localhost:3000`

## 主要画面

- `/` : トップページ
- `/signin` : Googleログイン
- `/dashboard` : ダッシュボード
- `/items` : 資格情報の生成・一覧
- `/items/[id]` : 詳細・QR・パスワード表示
- `/settings` : システム登録
- `/qr?token=...` : QRトークン解決・パスワード表示

## 運用上の注意

- QRは短命トークン方式（1回限り）です。
- 期限切れの資格情報はQR表示できません。
- パスワードは暗号化保存され、平文では保持しません。
