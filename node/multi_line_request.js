function emit_lines(stream)
{
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
function emit_multi_lines(stream)
{
  emit_lines(stream)
  var arr_lines = []
  stream.on('line', function(line){
    line = line.trim()
    if( line == '' ){
      stream.emit('multi_line', arr_lines)
      arr_lines = []
    }else{
      arr_lines.push(line)
    }
  })
}
module.exports.emit_multi_lines = emit_multi_lines
module.exports.emit_lines = emit_lines