import puppeteer from 'puppeteer'
import { stringify } from 'csv-stringify'
import { writeFileSync } from 'fs'

type Word = {
  word: string | null
  pos: string | null
  level: string | null
  mp3: string | null
}

async function run() {
  console.log('Start scraping oxford')
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()
  await page.goto(
    'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000'
  )
  const baseURl = 'https://www.oxfordlearnersdictionaries.com'
  await page.setViewport({ width: 1060, height: 1024 })
  const elements = await page.$$('#wordlistsContentPanel > ul > li')
  let words: Word[] = []
  for (const element of elements) {
    const word: string | null = await element
      .$eval('a', (e) => e.textContent)
      .catch((_error) => null)
    const pos = await element.$eval('span.pos', (e) => e.textContent)
    const level = await element
      .$eval('div > span.belong-to', (e) => e.textContent)
      .catch((error) => null)
    const mp3 = await element
      .$eval('div > div', (e) => e.getAttribute('data-src-mp3'))
      .catch((error) => null)
    const mp3Url = mp3 ? `${baseURl}${mp3}` : 'null'
    words.push({
      word,
      pos,
      level,
      mp3: mp3Url,
    })
  }
  stringify(words, (err, output) => {
    if (!err) {
      writeFileSync('words.csv', output)
    }
  })
  console.log({ total: words.length })
  await page.close()
  await browser.close()
  process.exit()
}
run()
