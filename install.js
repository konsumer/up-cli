const { writeFile, chmod } = require('fs')
const { exec } = require('child_process')
const { promisify } = require('util')
const isWin = process.platform === 'win32'

if (isWin) {
  console.error('Up installation not supported on windows.')
  process.exit(1)
}

const write = promisify(writeFile)
const perm = promisify(chmod)
const run = promisify(exec)

const get = (url) => new Promise((resolve, reject) => {
  const lib = url.startsWith('https') ? require('https') : require('http')
  const request = lib.get(url, (response) => {
    if (response.statusCode < 200 || response.statusCode > 299) {
      reject(new Error('Failed to load page, status code: ' + response.statusCode))
    }
    const body = []
    response.on('data', (chunk) => body.push(chunk))
    response.on('end', () => resolve(body.join('')))
  })
  request.on('error', (err) => reject(err))
})

const main = async () => {
  const c = await get('https://up.apex.sh/install')
  await write('/tmp/up-install.sh', c)
  await perm('/tmp/up-install.sh', 0o775)
  const { stdout } = await run('sh /tmp/up-install.sh')
  console.log(stdout)
  console.log('Up installed.')
}

main()
