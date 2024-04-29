import { Storage } from '@google-cloud/storage';
import csv from 'csv-parser';

const storage = new Storage();

export class CloudStorage {
    bucketName
    fileName
    constructor(){
        this.bucketName = "repositorio_irmaneta"
        this.fileName = "Padron_electoral.csv"
    }

    async readFile(userPersonalId) {
      const bucket = storage.bucket(this.bucketName);
      const file = bucket.file(this.fileName);
      let data = {
          status: 0
      };
  
      try {
          const stream = file.createReadStream().pipe(csv());
          await new Promise((resolve, reject) => {
              stream.on('data', (row) => {
                  if (row.Cedula.replace(/-/g,'') === userPersonalId) {
                      const { Cedula, Nombres, Apellidos, CentroVotacion, Mesa } = row;
                      data = {
                          status: 1,
                          id: Cedula,
                          name: `${Nombres} ${Apellidos}`,
                          voteCenter: CentroVotacion,
                          voteTable: Mesa
                      };
                      resolve();
                  }
              });
  
              stream.on('end', () => {
                  resolve();
              });
  
              stream.on('error', (err) => {
                  console.error('Error downloading file:', err);
                  reject(err);
              });
          });
  
          return data;
      } catch (err) {
          console.error('Error downloading file:', err);
          return {
              status: 0
          };
      }
  }
}
