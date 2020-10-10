const { v4: uuidv4 } = require('uuid');

class GlobalInterval {
  constructor (options) {
    this.ticksCounter = 0
    this.id = uuidv4()
    this.intervalRef = null
    this.intervalValueMs = 250
    this.consumersList = {}
    this.onIntervalDeleted = options.onIntervalDeleted || function(){}
    console.log = function(){} // disable logs

  }

  startInterval (msInterval) {
    this.intervalRef = setInterval(() => {
      Object.values(this.consumersList).forEach(consumer => {
        if ((this.ticksCounter - consumer.startTime) % consumer.counterModuloToFireCb === 0) {
          consumer.callback()
        }
      })
      this.ticksCounter++
    }, msInterval)
  }

  stopInterval () {
    clearInterval(this.intervalRef)
    console.log('Interval removed:',this.id )
    this.ticksCounter = 0
    this.consumersList = {}
    this.onIntervalDeleted(this.id)
  }

  resetInterval (interval) {
    clearInterval(this.intervalRef)
    this.startInterval(interval)
  }

  addConsumer (consumerName, interval, cb) {
    if (Object.keys(this.consumersList).length === 0) {
      this.startInterval(this.intervalValueMs)
    }
    this.consumersList[consumerName] = {
      startTime: this.ticksCounter,
      interval: interval,
      callback: cb,
      counterModuloToFireCb: null
    }
    this.updateSmallestIntervalValue()
    this.updateAllCounterModulo()
  }

  removeConsumer (consumerName) {
    delete this.consumersList[consumerName]
    console.log(`consumer ${consumerName} removed from: ${this.id}` )

    if (Object.keys(this.consumersList).length === 0) {
      this.stopInterval()
      return
    }
    this.updateSmallestIntervalValue()
    this.updateAllCounterModulo()
  }

  updateSmallestIntervalValue () {
    if (this.consumersList.length <= 0) {
      return
    }
    let smallestValue = Number.MAX_SAFE_INTEGER
    Object.values(this.consumersList).forEach(item => {
      if (item.interval < smallestValue) {
        smallestValue = item.interval
      }
    })
    if (smallestValue !== this.intervalValueMs) {
      this.intervalValueMs = smallestValue
      this.resetInterval(this.intervalValueMs)
    }
  }

  updateAllCounterModulo () {
    Object.values(this.consumersList).forEach(item => {
      item.counterModuloToFireCb = Math.floor(item.interval / this.intervalValueMs)
    })
  }
}

module.exports = {
  GlobalInterval
}