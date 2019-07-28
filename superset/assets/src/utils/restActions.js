export function createPostPayload(payloadformat, data) {
  let payload = JSON.parse(JSON.stringify(payloadformat)); // deepclone hack
  replacePlaceholder(payload,data)
  return payload;
}

const replacePlaceholder = (obj ,data) => {
  Object.keys(obj).forEach(key => {
  let value = obj[key]
  if(isString(value)) {
    value = value.replace(/%(\w+)%/g, function(all, param) {
      return (data[param] || all);
    }); 
    obj[key] = value
  }
  if (typeof obj[key] === 'object') {
    replacePlaceholder(obj[key], data)
      }
  })
}

function isString (value) {
  return typeof value === 'string' || value instanceof String;
  }
