const channel = require('./channel.js')
let prefix = ''
let logging = false

exports.subscribe = function (name, handler) {
  let prefixedName = prefix.length !== 0 ? `${prefix}/${name}` : name
  return channel.registerHandler(prefixedName, handler)
}

exports.publish = function (name, data) {
  if (logging) console.log(`${name} published ${JSON.stringify(data, 2)}`)

  let prefixedName = prefix.length !== 0 ? `${prefix}/${name}` : name
  channels = channel.getChannels(channel.parseChannelNames(prefixedName))
  return Promise.all(channels.map(chan => {
    chan.broadcast.postMessage({channel: chan.name, data})
    return channel.callHandlers(prefixedName, chan.handlers, data, logging)
  }))
}

exports.prefix = function (pre) {
  prefix = pre
}

exports.logging = function (log) {
  logging = log
}
