

export function createJIRAPostPayload(payloadformat, data) {
  console.log(payloadformat);
  console.log(data);
  var postdata = JSON.stringify(payloadformat);
  
  postdata = postdata.replace(/%(\w+)%/g, function(all, param) {
      return data[param] || all;
  });
  return  JSON.parse(postdata);
}

export function createPostPayload(payloadformat, data) {
  const payload = createJIRAPostPayload(payloadformat,data)
  return  payload
}
