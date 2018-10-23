global.BroadcastChannel = function (name) {
  return {
    onmessage: function () {},
    postMessage: function () {}
  }
}

import test from 'ava'
import hamradio from './index.js'
import channel from './channel.js'

test('newChannel', t => {
  const chan = channel.newChannel('fred')
  t.is(chan.name, 'fred')
  t.deepEqual(chan.handlers, [])
  t.true(chan.broadcast.hasOwnProperty('onmessage'))
  t.true(chan.broadcast.hasOwnProperty('postMessage'))
})

test('parseChannelNames', t => {
  const channels = channel.parseChannelNames('1/2/3/4/5/6/7')
  t.deepEqual(channels, [
    '1',
    '1/2',
    '1/2/3',
    '1/2/3/4',
    '1/2/3/4/5',
    '1/2/3/4/5/6',
    '1/2/3/4/5/6/7'
  ])
})

test('registerHandler', t => {
  const chan = channel.newChannel('bob')
  const subscription = channel.registerHandler('bob', t.pass)
  t.deepEqual(chan.handlers, [t.pass])
  subscription.unsubscribe()
  t.deepEqual(chan.handlers, [])
})

test('getChannels', t => {
  let channels = channel.getChannels(channel.parseChannelNames('a/b/c'))
  const expectedNames = [
    'a',
    'a/b',
    'a/b/c'
  ]
  channels.forEach((chan, i) => {
    t.is(chan.name, expectedNames[i])
    t.deepEqual(chan.handlers, [])
    t.true(chan.broadcast.hasOwnProperty('onmessage'))
    t.true(chan.broadcast.hasOwnProperty('postMessage'))
  })

  channel.registerHandler('a/b', t.pass)
  channels = channel.getChannels(channel.parseChannelNames('a/b/c'))
  t.deepEqual(channels[1].handlers, [t.pass])
})

test('callHandlers', t => {
  t.plan(4)
  const channels = channel.getChannels(channel.parseChannelNames('m/d'))
  let handler = () => t.pass()
  channels.forEach(chan => channel.registerHandler(chan.name, handler))
  channels.forEach(chan => channel.registerHandler(chan.name, handler))
  return Promise.all(channels.map(chan => channel.callHandlers(chan.name, chan.handlers, {})))
})
