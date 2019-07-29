import { isString } from 'lodash'

export function getSuccessToastMessage(action, queryResponse) {
  let format = action.success_message;
  let message = `${action.label} was successful`
  if(format) {
    message = JSON.parse(JSON.stringify(format)); // deepclone hack
    message = replaceString(message, queryResponse);
    message = replaceString(message, action);
  }
  return message
}
export function createPostPayload(payloadformat, data) {
  let payload 
  if(payloadformat) {
    payload = JSON.parse(JSON.stringify(payloadformat)); // deepclone hack
    replacePlaceholder(payload, data)
  }
  return payload;
}

const replacePlaceholder = (obj, data) => {
  Object.keys(obj).forEach(key => {
    let value = obj[key]
    if (isString(value)) {
      obj[key] = replaceString(value,data)
    }
    if (typeof obj[key] === 'object') {
      replacePlaceholder(obj[key], data)
    }
  })
}

const replaceString = (format, data) => {
  format = format.replace(/%(\w+)%/g, function (all, param) {
    return (data[param] || all);
  });
  return format;
}