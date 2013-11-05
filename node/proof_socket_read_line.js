var net = require('net')

function emitLines (stream) {
  var backlog = ''
  stream.on('data', function (data) {
    backlog += data
    var n = backlog.indexOf('\n')
    // got a \n? emit one or more 'line' events
    while (~n) {
      stream.emit('line', backlog.substring(0, n))
      backlog = backlog.substring(n + 1)
      n = backlog.indexOf('\n')
    }
  })
  stream.on('end', function () {
    if (backlog) {
      stream.emit('line', backlog)
    }
  })
}

var streamServer = net.createServer(function (stream) {
  emitLines(stream)
  stream.on('line', function(line){
    stream.write(line+"\n")
  })
})
streamServer.maxConnections = 1
streamServer.listen(7001)