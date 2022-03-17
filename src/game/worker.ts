
const url = new URL(
  '../build/worker.jsB',
  import.meta.url
)

console.log('url', url)

export const worker = new Worker(url);

