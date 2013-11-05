module.exports.run = function(){
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (data) {
    data = data.toString().trim();
    switch (data)
    {
    case 'exit':
      process.exit();
      break;
    case 'clear':
      process.stdout.write('\u001B[2J\u001B[0;0f');
      break;
    case 'help':
       process.stdout.write('exit, clear, help\n');
      break;
    default:
      process.stdout.write('unrecognize: '+data+'\n');
    }
  });
}