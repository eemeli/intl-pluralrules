import { env } from 'node:process'
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

const bsDefaults = {
  project: env.BROWSERSTACK_PROJECT_NAME,
  build: process.env.BROWSERSTACK_BUILD_NAME,
  'browserstack.idleTimeout': 600,
  'browserstack.local': 'true',
  'browserstack.localIdentifier': env.BROWSERSTACK_LOCAL_IDENTIFIER,
  'browserstack.username': env.BROWSERSTACK_USERNAME,
  'browserstack.accessKey': env.BROWSERSTACK_ACCESS_KEY || env.BROWSERSTACK_KEY
}

const bsProvider = opts =>
  playwright({
    connectOptions: {
      wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
        JSON.stringify({ ...bsDefaults, ...opts })
      )}`
    }
  })

export default defineConfig({
  test: {
    // api: { host: '0.0.0.0' },
    browser: {
      enabled: true,
      provider: playwright(),
      connectTimeout: 300_000,
      instances: [
        {
          name: 'Chrome Old',
          browser: 'chromium',
          provider: bsProvider({ browser: 'chrome', browser_version: '110' })
        },
        {
          name: 'Chrome New',
          browser: 'chromium',
          provider: bsProvider({ browser: 'chrome', browser_version: 'latest' })
        },
        {
          name: 'Firefox Old',
          browser: 'chromium',
          provider: bsProvider({
            browser: 'playwright-firefox',
            browser_version: '111'
          })
        },
        {
          name: 'Firefox New',
          browser: 'chromium',
          provider: bsProvider({
            browser: 'playwright-firefox',
            browser_version: 'latest'
          })
        }
      ]
    },
    exclude: ['test262/']
  }
})
