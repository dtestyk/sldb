module.exports.each = function(arr, n_pow, func)
{
  var m=arr.length
  var k=Math.pow(m, n_pow)

  for( var c=0; c<k; ++c ){
    var arr_combin = []
    for( var i=0,d=c; i<n_pow; ++i ){
      var r=d%m
      d-=r
      d/=m
      arr_combin.push(arr[r])
    }
    func(arr_combin)
  }
}