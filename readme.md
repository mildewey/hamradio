# hamradio

hamradio was designed based off the great ideas in many other pubsub modules.
I would not have made it but I had one little requirement that I couldn't find
elsewhere: I needed to publish events to other browser tabs. In hamradio, this
is accomplished through [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
which along with [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
and [=>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
are the only "dependencies" of the module.

hamradio provides the following flavors of pubsub:
* asynchronous - hamradio does not execute subscribed functions synchronously.
  This has the advantage of not breaking code that publishes unexpectedly, but the
  disadvantage of losing track of call stacks to where the publishing event happened
* subchannels - hamradio allows for breaking communications into subchannels and
  relaying any published events up the chain to parent channels. That means that
  listening on parent channels allows you to receive any events published on its
  subchannels.
* multi-tab - the signature feature of hamradio is that it can communicate across
  browser contexts. Assuming both sets of code in each context use hamradio, events
  are sent and received between the hamradio instances seamlessly.

hamradio is intended to be used as an npm module.

## Installing

```
npm install hamradio
```

## Usage

A simple example follows:
```
import hamradio from 'hamradio'

const subscription = hamradio.subscribe(
  'ham/radio',
  (name, data) => console.log(name, data)
)

hamradio.publish('ham/radio', 'foo')
// expect to see "ham/radio foo" in the console

hamradio.publish('ham/radio/test', {bar: baz})
// expect to see "ham/radio/test {bar: baz}" in the console

hamradio.publish('ham', 'is a sweet meat')
// expect to see nothing in the console because no one's listening to the parent

subscription.unsubscribe()

hamradio.publish('ham/radio', 'again')
// expect to see nothing in the console because we unsubscribed

console.log('A word on timing')
```

A word on timing, hamradio runs the subscribed handlers asynchronously. In the example above, none of the console.log events would happen until **after**
"A word on timing" had been logged. Ordering of which subscribed handlers execute
first is arbitrary.

To help with synchronicity, the publish function returns a promise that will be
accepted after all handler functions have completed. This promise only cares about
the local context. It has no reference to when other hamradio or other handlers
execute in other contexts. The promise will pass through any exceptions raised by
the handler functions.

### Channels and Handlers
Channels are interfaced with primarily by using a string name. When publishing
and subscribing, the string name should be fully qualified with all parent channels
represented. For example "ham/radio" represents the "radio" subchannel inside the
"ham" channel. There is a small overhead for using deeply nested channels as
parent channels are created as necessary on subscription or publishing.

When subscribing to a channel, a handler function must be provided. Handler functions
receive two parameters when called, the name of the channel, and data published to
the channel. The channel name is included to distinguish whether the data was
published on the subscribed channel or one of its subchannels.

Publishing to a channel will trigger calls to the handlers of a particular channel
as well as all of its parents.

### Other Contexts

Because hamradio uses BroadcastChannel, other contexts do not *need* to use
hamradio to intercept events published by hamradio. They can simply create a
BroadcastChannel instance using the name of the channel and communicate with hamradio
using the postMessage and onmessage protocols as usual.

hamradio is most useful when a pubsub model is needed AND there is a requirement
to communicate with other browser contexts.
