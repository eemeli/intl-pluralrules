const { Builder } = require('selenium-webdriver')

const username = process.env.BROWSERSTACK_USERNAME
const accessKey = process.env.BROWSERSTACK_ACCESS_KEY
const localIdentifier = process.env.BROWSERSTACK_LOCAL_IDENTIFIER

const server = `http://${username}:${accessKey}@hub.browserstack.com/wd/hub`

const capabilities = {
  'bstack:options': {
    local: 'true',
    os: 'Windows',
    osVersion: '10'
  },
  browserName: 'IE',
  browserVersion: '11.0'
}

if (localIdentifier)
  capabilities['bstack:options'].localIdentifier = localIdentifier

module.exports = new Builder()
  .usingServer(server)
  .withCapabilities(capabilities)
  .build()
