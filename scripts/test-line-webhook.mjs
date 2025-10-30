#!/usr/bin/env node
/**
 * LINE Webhook Test Script
 * Usage: node scripts/test-line-webhook.mjs
 *
 * This script simulates LINE webhook events for testing
 */

import crypto from 'crypto'

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/line/webhook'
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || 'your_channel_secret'
const CHANNEL_ID = process.env.LINE_CHANNEL_ID || '1234567890'

/**
 * Generate LINE signature
 */
function generateSignature(body, secret) {
  return crypto
    .createHmac('SHA256', secret)
    .update(body)
    .digest('base64')
}

/**
 * Send webhook request
 */
async function sendWebhook(events) {
  const body = JSON.stringify({
    destination: CHANNEL_ID,
    events
  })

  const signature = generateSignature(body, CHANNEL_SECRET)

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Line-Signature': signature
      },
      body
    })

    const result = await response.json()

    console.log(`Status: ${response.status}`)
    console.log('Response:', result)

    return response.ok
  } catch (error) {
    console.error('Error:', error.message)
    return false
  }
}

/**
 * Test cases
 */
const tests = {
  // Test 1: Follow event
  follow: () => {
    console.log('\n=== Test 1: Follow Event ===')
    return sendWebhook([{
      type: 'follow',
      timestamp: Date.now(),
      source: {
        type: 'user',
        userId: 'U1234567890abcdef'
      },
      replyToken: 'test_reply_token_' + Date.now()
    }])
  },

  // Test 2: Message event
  message: () => {
    console.log('\n=== Test 2: Message Event ===')
    return sendWebhook([{
      type: 'message',
      timestamp: Date.now(),
      source: {
        type: 'user',
        userId: 'U1234567890abcdef'
      },
      replyToken: 'test_reply_token_' + Date.now(),
      message: {
        id: 'msg_' + Date.now(),
        type: 'text',
        text: 'Hello, this is a test message!'
      }
    }])
  },

  // Test 3: Unfollow event
  unfollow: () => {
    console.log('\n=== Test 3: Unfollow Event ===')
    return sendWebhook([{
      type: 'unfollow',
      timestamp: Date.now(),
      source: {
        type: 'user',
        userId: 'U1234567890abcdef'
      }
    }])
  },

  // Test 4: Multiple events
  multiple: () => {
    console.log('\n=== Test 4: Multiple Events ===')
    return sendWebhook([
      {
        type: 'message',
        timestamp: Date.now(),
        source: {
          type: 'user',
          userId: 'U1234567890abcdef'
        },
        replyToken: 'test_reply_token_' + Date.now(),
        message: {
          id: 'msg1_' + Date.now(),
          type: 'text',
          text: 'First message'
        }
      },
      {
        type: 'message',
        timestamp: Date.now() + 1,
        source: {
          type: 'user',
          userId: 'U1234567890abcdef'
        },
        replyToken: 'test_reply_token_' + (Date.now() + 1),
        message: {
          id: 'msg2_' + Date.now(),
          type: 'text',
          text: 'Second message'
        }
      }
    ])
  },

  // Test 5: Sticker message
  sticker: () => {
    console.log('\n=== Test 5: Sticker Message ===')
    return sendWebhook([{
      type: 'message',
      timestamp: Date.now(),
      source: {
        type: 'user',
        userId: 'U1234567890abcdef'
      },
      replyToken: 'test_reply_token_' + Date.now(),
      message: {
        id: 'msg_' + Date.now(),
        type: 'sticker',
        packageId: '1',
        stickerId: '1'
      }
    }])
  },

  // Test 6: Invalid signature
  invalidSignature: async () => {
    console.log('\n=== Test 6: Invalid Signature ===')
    const body = JSON.stringify({
      destination: CHANNEL_ID,
      events: [{
        type: 'message',
        timestamp: Date.now(),
        source: {
          type: 'user',
          userId: 'U1234567890abcdef'
        },
        message: {
          id: 'msg_' + Date.now(),
          type: 'text',
          text: 'This should fail'
        }
      }]
    })

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Line-Signature': 'invalid_signature'
        },
        body
      })

      const result = await response.json()
      console.log(`Status: ${response.status} (Expected 401)`)
      console.log('Response:', result)

      return response.status === 401
    } catch (error) {
      console.error('Error:', error.message)
      return false
    }
  }
}

/**
 * Run tests
 */
async function runTests() {
  console.log('LINE Webhook Test Script')
  console.log('========================')
  console.log(`Webhook URL: ${WEBHOOK_URL}`)
  console.log(`Channel ID: ${CHANNEL_ID}`)
  console.log('')

  const results = {
    passed: 0,
    failed: 0
  }

  // Run all tests
  for (const [name, test] of Object.entries(tests)) {
    try {
      const success = await test()
      if (success) {
        console.log(`✅ ${name} - PASSED`)
        results.passed++
      } else {
        console.log(`❌ ${name} - FAILED`)
        results.failed++
      }
    } catch (error) {
      console.error(`❌ ${name} - ERROR:`, error.message)
      results.failed++
    }

    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Summary
  console.log('\n=== Test Summary ===')
  console.log(`Total: ${results.passed + results.failed}`)
  console.log(`Passed: ${results.passed}`)
  console.log(`Failed: ${results.failed}`)

  process.exit(results.failed > 0 ? 1 : 0)
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
}

export { tests, sendWebhook, generateSignature }
