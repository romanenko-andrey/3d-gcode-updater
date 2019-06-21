const fs = require('fs');
const path = require('path');

var args = process.argv.splice(2 /*+process.execArgv.length - comment in DebugMode*/);

if (args.length === 0){
  console.log('Missing gcode file as first argiment...');
  console.log('Please type layers you want to replace, for example 13to12 47to46 ...');
  process.exit();
}

var gcodeFileName = args[0];
var replacedLayers = [];
for (let i=1; i<args.length; i++){
  replacedLayers.push(args[i].split('to'));
}
console.log(replacedLayers)

var findZ = function(str){
  let searchZ = str.match(/\w*Z = (.*)/);
  return searchZ ? searchZ[1] : searchZ; 
}

var replaceZmoves = function(layer){
  //replace G1 Z line with correct Z move command
  console.log(layer[0]);
  let z = findZ(layer[0][1]);
  if(!z) return layer;
  return layer.map(el => /G1 Z.*/.test(el[1]) ? [el[0], `G1 Z${z} F1000`] : el); 
}

var array_to_str = function(arr){
  return replaceZmoves(arr).map(el => el[1]).reduce((a, line) => a+line+'\r\n', '');
}

fs.readFile(gcodeFileName, 'utf8', (err, data)=>{
  if (err) throw err;
  var gcode = data.split('\r\n');
  var layers = [];
  var newLayer = [];

  gcode.forEach( (line, index)=>{
    let oneLine = [index + 1, line];
    if (line.slice(2, 7) === 'layer'){
      if (newLayer.length > 0){
        layers.push(newLayer);
      }
      newLayer = [oneLine];
    }else{
      newLayer.push(oneLine);
    }
  })

  layers.push(newLayer);
  
  console.log('len =', gcode.length);

  replacedLayers.forEach( ([from, to]) => {
    
    if (from <= layers.length && to <= layers.length){
      let zFrom = findZ(layers[from][0][1]);
      let zTo = findZ(layers[to][0][1]);
      console.log(`move layer #${from} z= ${zFrom} to layer #${to} z= ${zTo}`);
      let headerTo = layers[to][0].slice();

      layers[to] = JSON.parse(JSON.stringify(layers[from]));
      layers[to][0] = headerTo;
      console.log(layers[to][0]);
    }
  })
  //process.exit();



  var gcode_str = '';
  layers.forEach(layer => gcode_str += array_to_str(layer) )
  
  fs.writeFile('_'+args[0], gcode_str , {}, err =>{
    if (err) throw err;
    console.log('GCODE succcefully updated!');
  })

})//readFile