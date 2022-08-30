import path from 'path'
import fs from 'fs'
import {CONFIG} from '../config'
import {getOrderBooks} from './getOrderBooks'

async function main() {
  const {instrumentNames, resultsFolder} = CONFIG

  // Create results folder if not exits
  if (!fs.existsSync(resultsFolder)) {
    fs.mkdirSync(resultsFolder)
  }

  const orderBooks = await getOrderBooks(instrumentNames)

  const dateNow = new Date()

  const resultsFileName = `${dateNow.toISOString()}.json`
  const resultsFilePath = path.resolve(resultsFolder, resultsFileName)
  await fs.writeFileSync(resultsFilePath, JSON.stringify(orderBooks, null, 2))
}

main()
  .then(() => {
    console.log('Done')
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
