var arr_pow = require('./array_power')

var arr=[1,2,3,4]
var n_request=3

arr_pow.each(arr, n_request, function(arr_combin){
  console.log(JSON.stringify(arr_combin))
})

//var m=arr.length
//var k=Math.pow(m, n_request)

//for( var c=0; c<k; ++c ){
//  for( var i=0,d=c; i<n_request; ++i ){
//    var r=d%m
//    d-=r
//    d/=m
//    console.log("i_request:"+i+", item:"+r+", value:"+arr[r])
//  }
//  console.log()
//}

