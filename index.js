const channel = require('./channel.js')
let prefix = ''

exports.subscribe = function (name, handler) {
  let prefixedName = prefix.length !== 0 ? `${prefix}/${name}` : name
  return channel.registerHandler(prefixedName, handler)
}

exports.publish = function (name, data) {
  let prefixedName = prefix.length !== 0 ? `${prefix}/${name}` : name
  channels = channel.getChannels(channel.parseChannelNames(prefixedName))
  return Promise.all(channels.map(chan => {
    chan.broadcast.postMessage({channel: chan.name, data})
    return callHandlers(prefixedName, chan.handlers, data)
  }))
}

exports.prefix = function (pre) {
  prefix = pre
}
