require('./simple_cli').run()
var net = require('net')
var fs = require('fs')
var emit = require('./multi_line_request')
var arr_pow = require('./array_power')

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
var lines_database_server = net.createServer(function (stream) {
  emit.emit_multi_lines(stream)
  stream.on('multi_line', function(arr_lines_request){
    var n=arr_lines_request.length
    var results = {}
    var records_summary = {}
    arr_pow.each(db, n, function(arr_combin){
      console.log(JSON.stringify(arr_combin))
      console.log(JSON.stringify(arr_lines_request))
      
      var is_match = true
      var vars = {}
      var records = {}
      for( var i=0; i<n && is_match; ++i ){
        var arr_words = arr_lines_request[i].split(' ')
        var m = arr_words.length
        var arr_words_record = arr_combin[i].split(' ')
        var r = arr_words_record.length
        
        var is_line_match = r == m
        var arr_words_result = []
        for( var k=0; is_line_match && k<r; ++k ){
          var word_record = arr_words_record[k]
          var word = arr_words[k]
          var s = word[0]
          word = word.slice(1)
          if( s == '$' ){
            var reg = /^([^?:]+)([?:])(\S*)$/
            var a = reg.exec(word)
            if( a ){
              var name = a[1]
              s = a[2]
              word = a[3]
              
              var is_read_match = (word_record == word || word == '')
              var is_write_match = s == ':'
              if( !vars[name] && is_read_match)
                vars[name] = word_record
              if( !vars[name] && is_write_match)
                vars[name] = word
              is_line_match = !!vars[name] && (is_read_match || is_write_match)
              console.log("name: "+name+", s: "+s+", word: "+word+", word_record: "+word_record+", vars[name]: "+vars[name])
            }
          }
          switch( s ){
            case '?':
              is_line_match &= word == '' || word == word_record
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
        if( is_line_match ){
          var str_record = arr_words_record.join(' ')
          if( str_record != '')
            records[str_record] = true
        }
        is_match = is_line_match
      }
      if( is_match ){
        console.log('match')
        var str_result = JSON.stringify(vars)
        results[str_result] = true
        for(var str_record in records)
          records_summary[str_record] = true
      }
      
      console.log()
    })
  
    for(var str_record in records_summary)
      db.push(str_record)
    for(var str_result in results) 
      stream.write(str_result+"\r\n")

  })
})
//streamServer.maxConnections = 1
lines_database_server.listen(23)
console.log('Server running at port 23');