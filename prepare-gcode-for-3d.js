const fs = require('fs');
const path = require('path');

// print process.argv
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});

var args = process.argv.slice(2);

console.log(args);