channel = require('./channel.js')

exports.subscribe = function (name, handler) {
  return channel.registerHandler(name, handler)
}

exports.publish = function (name, data) {
  channels = channel.getChannels(channel.parseChannelNames(name))
  return Promise.all(channels.map(chan => {
    chan.broadcast.postMessage({channel: chan.name, data})
    return callHandlers(name, chan.handlers, data)
  }))
}
