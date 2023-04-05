const { Builder } = require('selenium-webdriver')

const username = process.env.BROWSERSTACK_USERNAME
const accessKey = process.env.BROWSERSTACK_ACCESS_KEY
const localIdentifier = process.env.BROWSERSTACK_LOCAL_IDENTIFIER

const server = `http://${username}:${accessKey}@hub.browserstack.com/wd/hub`

const [os, osVersion] = (process.env.OS ?? 'Windows:10').split(':')
const [browserName, browserVersion] = process.env.BROWSER.split(':')

const capabilities = {
  'bstack:options': { local: 'true', os, osVersion },
  browserName,
  browserVersion
}

if (localIdentifier)
  capabilities['bstack:options'].localIdentifier = localIdentifier

module.exports = new Builder()
  .usingServer(server)
  .withCapabilities(capabilities)
  .build()
