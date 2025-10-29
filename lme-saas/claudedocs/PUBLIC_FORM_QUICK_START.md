# Public Form Quick Start Guide

## Usage in 3 Steps

### 1. Create a Form
Dashboard → Forms → Create New Form
```typescript
{
  title: "お客様アンケート",
  description: "ご意見をお聞かせください",
  questions: [
    {
      id: "name",
      type: "short_text",
      label: "お名前",
      required: true
    },
    {
      id: "email",
      type: "email",
      label: "メールアドレス",
      required: true
    },
    {
      id: "rating",
      type: "radio",
      label: "満足度",
      options: ["大変満足", "満足", "普通", "不満", "大変不満"],
      required: true
    }
  ],
  settings: {
    show_progress: true,
    submit_button_text: "送信",
    thank_you_message: "ありがとうございました"
  }
}
```

### 2. Publish the Form
Change status from 'draft' to 'published'

### 3. Share the URL
```
https://your-domain.com/f/[formId]
```

## Field Types Reference

| Type | Use Case | Example |
|------|----------|---------|
| short_text | Name, title | "お名前を入力" |
| long_text | Comments, feedback | "ご意見をお聞かせください" |
| email | Email address | "example@email.com" |
| tel | Phone number | "090-1234-5678" |
| number | Age, quantity | min: 0, max: 100 |
| url | Website | "https://example.com" |
| date | Birthday, date | "2024-01-01" |
| select | Single choice dropdown | options: ["A", "B", "C"] |
| radio | Single choice visible | options: ["はい", "いいえ"] |
| checkbox | Multiple choice | options: ["X", "Y", "Z"] |
| file | File upload | PDF, images (max 5MB) |

## LINE Integration

### Rich Menu Button
```json
{
  "size": { "width": 2500, "height": 1686 },
  "areas": [
    {
      "bounds": { "x": 0, "y": 0, "width": 1250, "height": 843 },
      "action": {
        "type": "uri",
        "label": "アンケート",
        "uri": "https://your-domain.com/f/[formId]?userId={userId}"
      }
    }
  ]
}
```

### Flex Message
```json
{
  "type": "bubble",
  "body": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "text",
        "text": "アンケートにご協力ください",
        "weight": "bold",
        "size": "xl"
      },
      {
        "type": "text",
        "text": "3分で完了します",
        "size": "sm",
        "color": "#999999"
      }
    ]
  },
  "footer": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "button",
        "action": {
          "type": "uri",
          "label": "回答する",
          "uri": "https://your-domain.com/f/[formId]?userId={userId}"
        }
      }
    ]
  }
}
```

## Validation Examples

### Email Validation
```typescript
{
  type: "email",
  label: "メールアドレス",
  required: true
}
// Validates: example@email.com ✓
// Rejects: invalid-email ✗
```

### Number Range
```typescript
{
  type: "number",
  label: "年齢",
  validation: {
    min: 18,
    max: 100,
    message: "18歳から100歳の間で入力してください"
  }
}
```

### Required Field
```typescript
{
  type: "short_text",
  label: "お名前",
  required: true  // Shows "お名前 *"
}
```

## Custom Settings

### Progress Bar
```typescript
settings: {
  show_progress: true  // Shows "3 / 10" and progress bar
}
```

### Custom Button Text
```typescript
settings: {
  submit_button_text: "送信する"  // Default: "送信"
}
```

### Thank You Message
```typescript
settings: {
  thank_you_message: "ご回答ありがとうございました！\n後日結果をお送りします。"
}
```

### Auto Redirect
```typescript
settings: {
  thank_you_message: "ありがとうございました",
  redirect_url: "https://your-website.com/thanks"  // Redirects after 3 seconds
}
```

## Response Data Structure

### Stored in Database
```json
{
  "id": "response-uuid",
  "form_id": "form-uuid",
  "friend_id": "friend-uuid",  // nullable
  "answers": {
    "name": "山田太郎",
    "email": "yamada@example.com",
    "rating": "満足",
    "comments": "とても良かったです",
    "interests": ["商品A", "商品B"]  // checkbox array
  },
  "submitted_at": "2024-01-01T12:00:00Z"
}
```

## Troubleshooting

### Form Not Loading
```
Check: Form status = 'published'
Check: Form ID is correct
Check: RLS policies enabled
```

### File Upload Fails
```
Check: Storage bucket 'public-files' exists
Check: Bucket is public
Check: File size < 5MB
Check: RLS policies on storage.objects
```

### Validation Errors
```
Check: Required fields filled
Check: Email format correct
Check: Number within min/max range
Check: File size within limit
```

## Example Forms

### Customer Satisfaction Survey
```typescript
{
  title: "顧客満足度アンケート",
  questions: [
    {
      id: "overall",
      type: "radio",
      label: "総合的な満足度",
      options: ["5 大変満足", "4 満足", "3 普通", "2 不満", "1 大変不満"],
      required: true
    },
    {
      id: "recommend",
      type: "radio",
      label: "他の人に勧めたいですか",
      options: ["はい", "いいえ", "わからない"],
      required: true
    },
    {
      id: "feedback",
      type: "long_text",
      label: "ご意見・ご要望",
      placeholder: "自由にご記入ください"
    }
  ]
}
```

### Event Registration
```typescript
{
  title: "イベント参加申込",
  questions: [
    {
      id: "name",
      type: "short_text",
      label: "お名前",
      required: true
    },
    {
      id: "email",
      type: "email",
      label: "メールアドレス",
      required: true
    },
    {
      id: "tel",
      type: "tel",
      label: "電話番号",
      required: true
    },
    {
      id: "count",
      type: "number",
      label: "参加人数",
      validation: { min: 1, max: 5 },
      required: true
    },
    {
      id: "dietary",
      type: "checkbox",
      label: "食事制限",
      options: ["ベジタリアン", "ビーガン", "アレルギーあり", "なし"]
    }
  ]
}
```

### Contact Form
```typescript
{
  title: "お問い合わせ",
  questions: [
    {
      id: "name",
      type: "short_text",
      label: "お名前",
      required: true
    },
    {
      id: "email",
      type: "email",
      label: "メールアドレス",
      required: true
    },
    {
      id: "category",
      type: "select",
      label: "お問い合わせ種別",
      options: ["商品について", "サービスについて", "その他"],
      required: true
    },
    {
      id: "message",
      type: "long_text",
      label: "お問い合わせ内容",
      required: true
    },
    {
      id: "attachment",
      type: "file",
      label: "添付ファイル（任意）"
    }
  ]
}
```

## Best Practices

### Mobile Optimization
- Keep forms short (max 10 questions)
- Use appropriate field types
- Provide clear labels
- Add helpful descriptions

### Accessibility
- Mark required fields with *
- Provide error messages
- Use proper labels
- Enable keyboard navigation

### User Experience
- Show progress bar
- Provide clear feedback
- Use appropriate placeholders
- Test on mobile devices

### Data Quality
- Use validation rules
- Make key fields required
- Provide examples
- Use appropriate field types

## API Reference

### getPublicForm(formId)
```typescript
const form = await getPublicForm(formId)
// Returns: Form | null
```

### submitPublicForm(formId, submission, lineUserId?)
```typescript
const result = await submitPublicForm(
  formId,
  { name: "山田太郎", email: "yamada@example.com" },
  "U1234567890"
)
// Returns: { success: boolean, error?: string, errors?: FormValidationError[] }
```

### uploadFormFile(formData)
```typescript
const formData = new FormData()
formData.append('file', file)
const result = await uploadFormFile(formData)
// Returns: { success: boolean, url?: string, fileName?: string, error?: string }
```

## Support

For issues or questions:
1. Check this guide
2. Review error messages
3. Check browser console
4. Verify Supabase connection
5. Contact support

## Updates

This implementation supports:
- Next.js 16 (with path fix) or Next.js 15
- React 19 or React 18
- Supabase latest version
- Modern browsers (Chrome, Firefox, Safari, Edge)

---

**Quick Start Guide**
**Version:** 1.0.0
**Last Updated:** 2025-10-29
