const { Builder } = require('selenium-webdriver')

const username = process.env.BROWSERSTACK_USERNAME
const accessKey = process.env.BROWSERSTACK_ACCESS_KEY
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

module.exports = new Builder()
  .usingServer(server)
  .withCapabilities(capabilities)
  .build()
