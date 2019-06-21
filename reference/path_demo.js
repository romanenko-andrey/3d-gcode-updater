const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('event', (a) => {
  console.log('an event occurred!');
  console.log(a)
});
myEmitter.emit('event', 1);