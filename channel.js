const registeredChannels = {}

exports.newChannel = function (name) {
  const newChannel = {
    broadcast: new BroadcastChannel(name),
    name,
    handlers: []
  }

  newChannel.broadcast.onmessage = function ({data}) {
    exports.callHandlers(data.channel, newChannel.handlers, data.data)
      .catch(error => console.log(error))
  }

  registeredChannels[name] = newChannel

  return newChannel
}

exports.parseChannelNames = function (name) {
  return name.split('/')
    .reduce((acc, cur, idx, src) => {
      acc.push(src.slice(0, idx+1).join('/'))
      return acc
    }, [])
}

exports.registerHandler = function (name, handler) {
  const chan = registeredChannels[name] || exports.newChannel(name)
  registeredChannels[name].handlers.push(handler)

  return {
    unsubscribe: () => {
      const i = registeredChannels[name].handlers.indexOf(handler)
      if (i != -1) registeredChannels[name].handlers.splice(i, 1)
    }
  }
}

exports.getChannels = function (names) {
  return names
    .map(name => registeredChannels[name] || exports.newChannel(name))
}

exports.callHandlers = function (name, handlers, data) {
  return Promise.all(handlers.map(handler => new Promise(function (resolve, reject) {
    const wrapper = () => {
      handler(name, data)
      resolve()
    }
    setTimeout(wrapper, 0)
  })))
}
