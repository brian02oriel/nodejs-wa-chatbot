import { CloudStorage } from "./CloudStorage.js";

export class DTOs {
    constructor(){}
    async readVoteCenter(userPersonalId){
        let data = {
            status: 0
        };
        const storage = new CloudStorage()
        
        try {
            const stream = storage.readFile("Padron_electoral.csv")
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
            return data
        } catch (err) {
            console.error('Error downloading file:', err);
          return data
        }
    }

    async readContacts(){
        let data = []
        const storage = new CloudStorage()
        
        try {
            const stream = storage.readFile("contactos_irmaneta_test.csv")
            await new Promise((resolve, reject) => {
                stream.on('data', (row) => {
                    const { Activista, Desvinculado, Celular, Correo, Corregimiento, CentroVotacion, ContactadoAutomaticamente, SeCabreoDeNosotros } = row;
                        data.push({
                            Activista, 
                            Desvinculado, 
                            Celular, 
                            Correo, 
                            Corregimiento, 
                            CentroVotacion, 
                            ContactadoAutomaticamente, 
                            SeCabreoDeNosotros
                        });
                        resolve();
                });
    
                stream.on('end', () => {
                    resolve();
                });
    
                stream.on('error', (err) => {
                    console.error('Error downloading file:', err);
                    reject(err);
                });
            });
            return data
        } catch (err) {
            console.error('Error downloading file:', err);
          return data
        }
    }
}