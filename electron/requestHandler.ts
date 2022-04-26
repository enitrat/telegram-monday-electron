import {Duplex} from "stream";

export function handleRequest(api: Record<string, any>, data: Record<string, any>) {
  let error = null;
  let result = null;

  if (!api[data.method]) {
    console.log('not found')
    return {
      error: "Method not found",
    };
  }

  try {
    result = api[data.method](...(data.params || []));
  } catch (e) {
    error = e;
  }
  return result;

}