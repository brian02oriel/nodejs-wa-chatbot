import { Storage } from '@google-cloud/storage'
import csv from 'csv-parser'
import fs from 'fs'

const storage = new Storage()

export class CloudStorage {
    bucketName
    constructor(){
        this.bucketName = "repositorio_irmaneta"
    }

    readFile(fileName) {
      const bucket = storage.bucket(this.bucketName)
      const file = bucket.file(fileName)
      
      try {
          const stream = file.createReadStream().pipe(csv())
          return stream
      } catch (error) {
          console.error('Error downloading file:', error)
          return undefined
      }
    }

    writeFile(fileName, csvData){
        const bucket = storage.bucket(this.bucketName)
        const file = bucket.file(fileName)
        try {
            const fileStream = file.createWriteStream()
            fileStream.write(csvData)
            fileStream.end()
            console.log('CSV file written to Google Cloud Storage successfully')
        } catch (error) {
            console.error('Error writing CSV file to Google Cloud Storage:', error)
        }
    }
}
