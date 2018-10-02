const fs = require('fs')
const path = require('path')

function createLink (src, dst) {
  try {
    if (fs.existsSync(dst)) {
      fs.unlinkSync(dst)
    }
    fs.symlinkSync(src, dst, 'junction')
    return true
  } catch (e) {
    return e
  }
}

function findRootNodeModules () {
  // Find the top most node_modules directory from main module paths
  for (let path of require.main.paths.reverse()) {
    if (fs.existsSync(path)) {
      return path
    }
  }
  // If nothing found, assume it is inside PWD
  return path.join(process.pwd(), 'node_modules')
}

const rootNodeModules = findRootNodeModules()

// If root node_modules doesn't exists, create it
if (!fs.existsSync(rootNodeModules)) {
  fs.mkdirSync(rootNodeModules)
}

// Assume project rootDir is parent of rootNodeModules
const rootDir = path.dirname(rootNodeModules)

// Create aliases from rootDir to rootNodeModules
const aliases = ['~', '@']

for (const alias of aliases) {
  const dst = path.join(rootNodeModules, alias)
  const result = createLink(rootDir, dst)

  if (result !== true) {
    // It is unsafe to assume anything or remove directories. Just make a warn
    console.warn('Unable to create alias ' + dst + ': ' + result)
  }
}
