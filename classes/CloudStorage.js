const { Storage } = require('@google-cloud/storage');

const storage = new Storage();

export class CloudStorage {
    bucketName
    fileName
    constructor(){
        this.bucketName = "repositorio_irmaneta"
        this.fileName = "Padron_electoral.csv"
    }

    async readFile() {
        const bucket = storage.bucket(this.bucketName);
        const file = bucket.file(this.fileName);
      
        try {
          const data = await file.download();
          console.log(`Contents of ${filename}: ${data[0]}`);
        } catch (err) {
          console.error('Error downloading file:', err);
        }
    }
}
