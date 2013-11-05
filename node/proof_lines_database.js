require('./simple_cli').run()
var net = require('net')
var fs = require('fs')

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

function save(db)
{
	var stream = fs.createWriteStream('db.txt')
	stream.once('open', function(fd) {
		console.log('saving...')
		for( var i in db ){
			var ln = db[i]
			console.log(ln)
			stream.write(ln+'\n')
		}
		stream.end()
	})
}

var data = fs.readFileSync('db.txt')
var str = data.toString()
var db = str.split('\n')
db.pop()
var lines_database_server = net.createServer(function (stream) {
  emitLines(stream)
  stream.on('line', function(line){
    line = line.trim()
    var arr_words = line.split(' ')
    var m = arr_words.length
    var results = {}
    
    if( m==1 && arr_words[0]=='!save' )
			save(db)
		if( m==1 && arr_words[0]=='!close' ){
			stream.end('!close\r\n')
			stream.destroy()
			return
		}
    
    db.forEach(function(record, i, db){
      var arr_words_record = record.split(' ')
      var r = arr_words_record.length
      var is_match = r == m
      var arr_words_result = []
      for( var k=0,r=arr_words.length; is_match && k<r; ++k ){
        var word = arr_words[k]
        var s = word[0]
        word = word.slice(1)
        var word_record = arr_words_record[k]
        switch( s ){
          case '?':
            is_match = word == '' || word == word_record
            arr_words_result.push(':'+word_record)
            break
          case ':':
            arr_words_record[k] = word
            arr_words_result.push(':'+word)
            break
          case '.':
            arr_words_result.push('.')
            break
        }
      }
      if( is_match ){
        var str_record = arr_words_record.join(' ')
				db[i] = str_record
        var str_result = arr_words_result.join(' ')
        results[str_result] = true
      }
    })
    for(var str_result in results) 
      stream.write(str_result+'\r\n')
    stream.write('\r\n')
  })
})
//streamServer.maxConnections = 1
lines_database_server.listen(23)
console.log('Server running at port 23');