require('./simple_cli').run()
var net = require('net')
var emit = require('./multi_line_request')


var lines_database_server = net.createServer(function (stream) {
  emit.emit_multi_lines(stream)
  stream.on('multi_line', function(arr_lines){
    for(var i in arr_lines) 
      stream.write(arr_lines[i]+"\r\n")
  })
})
//streamServer.maxConnections = 1
lines_database_server.listen(23)
console.log('Server running at port 23');