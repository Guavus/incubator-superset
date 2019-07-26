

export function createJIRAPostPayload(payloadformat, data) {
  console.log(payloadformat);
  console.log(data);
  return  payloadformat
}

export function createPostPayload(payloadformat, data) {
  const payload = createJIRAPostPayload(payloadformat,data)
  return  payload
}
