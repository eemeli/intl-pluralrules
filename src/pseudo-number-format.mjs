export default class PseudoNumberFormat {
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
    this._minID = typeof minID === 'number' ? minID : 1
    this._minFD = typeof minFD === 'number' ? minFD : 0
    this._maxFD = typeof maxFD === 'number' ? maxFD : Math.max(this._minFD, 3)
    if (typeof minSD === 'number' || typeof maxSD === 'number') {
      this._minSD = typeof minSD === 'number' ? minSD : 1
      this._maxSD = typeof maxSD === 'number' ? maxSD : 21
    }
  }

  resolvedOptions() {
    const opt = {
      minimumIntegerDigits: this._minID,
      minimumFractionDigits: this._minFD,
      maximumFractionDigits: this._maxFD
    }
    if (typeof this._minSD === 'number') {
      opt.minimumSignificantDigits = this._minSD
      opt.maximumSignificantDigits = this._maxSD
    }
    Object.defineProperty(opt, 'locale', { get: getDefaultLocale })
    return opt
  }

  format(n) {
    if (this._minSD) {
      const raw = String(n)
      let prec = 0
      for (let i = 0; i < raw.length; ++i) {
        const c = raw[i]
        if (c >= '0' && c <= '9') ++prec
      }
      if (prec < this._minSD) return n.toPrecision(this._minSD)
      if (prec > this._maxSD) return n.toPrecision(this._maxSD)
      return raw
    }
    if (this._minFD > 0) return n.toFixed(this._minFD)
    if (this._maxFD === 0) return n.toFixed(0)
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
