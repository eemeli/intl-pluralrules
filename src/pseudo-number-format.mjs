export default class PseudoNumberFormat {
  #minID
  #minFD
  #maxFD
  #minSD
  #maxSD

  constructor(
    lc, // locale is ignored; always use 'en-US' in format()
    {
      minimumIntegerDigits: minID,
      minimumFractionDigits: minFD,
      maximumFractionDigits: maxFD,
      minimumSignificantDigits: minSD,
      maximumSignificantDigits: maxSD
    } = {}
  ) {
    this.#minID = typeof minID === 'number' ? minID : 1
    this.#minFD = typeof minFD === 'number' ? minFD : 0
    this.#maxFD = typeof maxFD === 'number' ? maxFD : Math.max(this.#minFD, 3)
    if (typeof minSD === 'number' || typeof maxSD === 'number') {
      this.#minSD = typeof minSD === 'number' ? minSD : 1
      this.#maxSD = typeof maxSD === 'number' ? maxSD : 21
    }
  }

  resolvedOptions() {
    const opt = {
      minimumIntegerDigits: this.#minID,
      minimumFractionDigits: this.#minFD,
      maximumFractionDigits: this.#maxFD
    }
    if (typeof this.#minSD === 'number') {
      opt.minimumSignificantDigits = this.#minSD
      opt.maximumSignificantDigits = this.#maxSD
    }
    Object.defineProperty(opt, 'locale', { get: getDefaultLocale })
    return opt
  }

  format(n) {
    if (this.#minSD) {
      const raw = String(n)
      let prec = 0
      for (let i = 0; i < raw.length; ++i) {
        const c = raw[i]
        if (c >= '0' && c <= '9') ++prec
      }
      if (prec < this.#minSD) return n.toPrecision(this.#minSD)
      if (prec > this.#maxSD) return n.toPrecision(this.#maxSD)
      return raw
    }
    if (this.#minFD > 0) return n.toFixed(this.#minFD)
    if (this.#maxFD === 0) return n.toFixed(0)
    return String(n)
  }
}

function getDefaultLocale() {
  if (
    typeof Intl !== 'undefined' &&
    typeof Intl.DateTimeFormat === 'function'
  ) {
    return new Intl.DateTimeFormat().resolvedOptions().locale
  } else if (typeof navigator !== 'undefined') {
    return navigator.userLanguage || navigator.language || 'en-US'
  } else {
    return 'en-US'
  }
}
