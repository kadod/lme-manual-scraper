# Supabase Auth Trigger Setup Report

**Date**: 2025-10-29
**Project ID**: powrxrjblbxrfrqskvye
**Status**: ✅ Successfully Completed

---

## 実装内容

### 1. handle_new_user() 関数

新規ユーザー登録時に自動的に`users`テーブルにレコードを作成する関数を実装しました。

**機能**:
- auth.usersテーブルに新規ユーザーが作成されると自動実行
- raw_user_meta_dataからorganization_id、display_name、roleを取得
- public.usersテーブルに対応するレコードを作成
- デフォルトロール: 'member'（メタデータで指定がない場合）

**実装コード**:
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, organization_id, email, display_name, role)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'organization_id')::UUID,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. on_auth_user_created トリガー

auth.usersテーブルへのINSERT操作時にhandle_new_user()を実行するトリガーを設定しました。

**設定内容**:
- トリガー名: `on_auth_user_created`
- イベント: AFTER INSERT on auth.users
- 実行関数: handle_new_user()
- 状態: 有効（enabled: O）

**実装コード**:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 3. custom_access_token_hook() 関数

JWT Custom Claimsにorganization_idとuser_roleを追加する関数を実装しました。

**機能**:
- JWTトークン生成時に自動実行（Supabase Auth Hooks経由）
- public.usersテーブルからroleとorganization_idを取得
- JWTのclaimsにorganization_idとuser_roleを追加
- RLSポリシーでの組織単位アクセス制御に使用

**実装コード**:
```sql
CREATE OR REPLACE FUNCTION custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
  claims JSONB;
  user_role TEXT;
  org_id UUID;
BEGIN
  SELECT role, organization_id INTO user_role, org_id
  FROM public.users
  WHERE id = (event->>'user_id')::UUID;

  claims := event->'claims';
  claims := jsonb_set(claims, '{organization_id}', to_jsonb(org_id));
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. テスト組織作成

開発・テスト用の組織を作成しました。

**作成された組織情報**:
- Organization ID: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`
- Name: `テスト組織`
- Slug: `test-org`
- Plan: `free`
- Status: `active`
- Created At: `2025-10-29 13:49:59.823912+00`

---

## 検証結果

### トリガー確認
```
Trigger Name: on_auth_user_created
Status: Enabled (O)
Target: auth.users
Event: AFTER INSERT
Function: handle_new_user()
```
✅ トリガーが正常に作成され、有効化されています。

### 関数確認
```
Functions Created:
1. handle_new_user() - TRIGGER function
2. custom_access_token_hook(event JSONB) - JSONB function
```
✅ 両方の関数が正常に作成されています。

### テスト組織確認
```
Organization: テスト組織 (test-org)
ID: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
Status: Active
```
✅ テスト組織が正常に作成されています。

---

## 次のステップ: テストユーザー作成

トリガーの動作確認のため、以下の手順でテストユーザーを作成してください。

### 方法1: Supabase Dashboard（推奨）

1. Supabase Dashboard にアクセス
2. Authentication > Users > Add User をクリック
3. 以下の情報を入力:

**Email**: `test@example.com`
**Password**: 任意のパスワード（8文字以上推奨）
**User Metadata** (JSON形式):
```json
{
  "organization_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "display_name": "テストユーザー",
  "role": "owner"
}
```

4. Create User をクリック

### 方法2: Supabase Client SDK（プログラム）

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'your-secure-password',
  options: {
    data: {
      organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      display_name: 'テストユーザー',
      role: 'owner'
    }
  }
})
```

### 期待される動作

ユーザー作成後、トリガーが自動実行され、以下が行われます:

1. `auth.users`テーブルに新規ユーザーレコードが作成される
2. トリガー`on_auth_user_created`が発火
3. 関数`handle_new_user()`が実行される
4. `public.users`テーブルに対応するレコードが自動作成される

### 確認用SQL

ユーザー作成後、以下のSQLで確認できます:

```sql
-- auth.usersのユーザー確認
SELECT id, email, raw_user_meta_data
FROM auth.users
WHERE email = 'test@example.com';

-- public.usersのユーザー確認
SELECT id, organization_id, email, display_name, role, created_at
FROM public.users
WHERE email = 'test@example.com';
```

両方のテーブルに同じID（UUID）でレコードが存在すれば、トリガーが正常に動作しています。

---

## JWT Custom Claims設定（追加タスク）

`custom_access_token_hook()`関数は作成されましたが、Supabase Auth Hooksとして登録する必要があります。

### 設定手順

1. Supabase Dashboard にアクセス
2. Authentication > Hooks > Access Token Hook を開く
3. Hook Function として `custom_access_token_hook` を選択
4. Enable Hook をクリック

これにより、ユーザーログイン時に自動的にJWTにorganization_idとuser_roleが追加されます。

### 確認方法

ログイン後、JWTトークンをデコードすると以下のclaimsが含まれます:

```json
{
  "sub": "user-uuid",
  "email": "test@example.com",
  "organization_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "user_role": "owner",
  ...
}
```

---

## トラブルシューティング

### トリガーが実行されない場合

1. トリガーが有効か確認:
```sql
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

2. 関数が存在するか確認:
```sql
SELECT proname
FROM pg_proc
WHERE proname = 'handle_new_user';
```

3. エラーログを確認:
```sql
SELECT * FROM pg_stat_activity
WHERE state = 'active';
```

### organization_idがNULLになる場合

ユーザー作成時に`raw_user_meta_data`に`organization_id`が含まれているか確認してください:

```sql
SELECT raw_user_meta_data->>'organization_id'
FROM auth.users
WHERE email = 'test@example.com';
```

NULLの場合、ユーザー作成時にメタデータを正しく設定する必要があります。

---

## まとめ

✅ **完了した作業**:
1. handle_new_user()関数の作成
2. on_auth_user_created トリガーの設定
3. custom_access_token_hook()関数の作成
4. テスト組織の作成

⏳ **次に必要な作業**:
1. テストユーザーの作成（手動またはプログラム）
2. JWT Custom Claims Hookの有効化（Supabase Dashboard）
3. トリガー動作の確認

🎯 **期待される結果**:
- 新規ユーザー登録時に自動的にusersテーブルにレコードが作成される
- JWTトークンにorganization_idとuser_roleが自動的に含まれる
- マルチテナントRLSポリシーが正常に機能する

---

**Migration Name**: `setup_auth_trigger_and_test_data`
**Applied At**: 2025-10-29 13:49:59 UTC
**Status**: Success
