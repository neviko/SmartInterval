const {GlobalInterval} = require('./GlobalInterval')

 class GlobalIntervalManager {
  constructor () {
    this.list = {} // {id:Interval}
    this.intervalNames = {} // {name:id}
    console.log = function(){} // disable logs
  }

  add (name, intervalMs, callback) {
    if(!name || !intervalMs || !callback){
      console.error(`smartInterval - arguments missing`)
      return null
    }
    const that = this
    if (!this._isUniqueName(name)) {
      console.error(`interval ${name} already exist`)
      return null
    }
    for (const interval of Object.values(this.list)) {
      if (that._isDeviateWithoutRest(interval.intervalValueMs, intervalMs)) {
        this._addConsumerToExistInterval(interval.id, name, intervalMs, callback)
        console.log(`consumer ${name} added to: ${interval.id}` )
        return name
      }
    }

    // if we have got here - we can't find a deviation without
    // a rest so we should create a new interval
    this._createNewInterval(name, intervalMs, callback)
    return name
  }

  _addConsumerToExistInterval (id, name, intervalMs, callback) {
    this.intervalNames[name] = id
    this.list[id].addConsumer(name, intervalMs, callback)
  }

  remove (name) {
    if (!this.intervalNames[name]) {
      console.error(new Error(`interval delete failed, interval ${name} doesn't exist`))
      return null
    }
    const intervalId = this.intervalNames[name]
    this.list[intervalId].removeConsumer(name)
    delete this.intervalNames[name]

    return name
  }

  _isUniqueName (name) {
    return !this.intervalNames[name]
  }

  _isDeviateWithoutRest (a, b) {
    if (a >= b) {
      return Number.isInteger(a / b)
    } else {
      return Number.isInteger(b / a)
    }
  }

  _createNewInterval (name, intervalMs, callback) {
    const interval = new GlobalInterval({
      onIntervalDeleted: id=> {
        delete this.list[id]
      }
    })
    console.log('added a new Interval ',interval.id)
    interval.addConsumer(name, intervalMs, callback)
    console.log(`consumer ${name} added to: ${interval.id}` )
    this.list[interval.id] = interval
    this.intervalNames[name] = interval.id
  }

  stopAllIntervals () {
    Object.values(this.list).forEach(interval => {
      interval.stopInterval()
    })
    this._reset()
  }

  _reset () {
    this.list = {}
    this.intervalNames = {}
  }

  status(){
    console.log(`Currently working ${Object.keys(this.list).length} timers\n${Object.keys(this.list)}\n\nThe consumer list is:\n${Object.keys(this.intervalNames)}`)
  }
}

module.exports = {
  SmartInterval:GlobalIntervalManager
}
