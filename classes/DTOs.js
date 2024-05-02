import moment from "moment"
import { CloudStorage } from "./CloudStorage.js"

export class DTOs {
    constructor(){}
    async readVoteCenter(userPersonalId){
        let data = {
            status: 0
        }
        const storage = new CloudStorage()
        
        try {
            const stream = storage.readFile("Padron_electoral.csv")
            await new Promise((resolve, reject) => {
                stream.on('data', (row) => {
                    if (row.Cedula.replace(/-/g,'') === userPersonalId) {
                        const { Cedula, Nombres, Apellidos, CentroVotacion, Mesa } = row
                        data = {
                            status: 1,
                            id: Cedula,
                            name: `${Nombres} ${Apellidos}`,
                            voteCenter: CentroVotacion,
                            voteTable: Mesa
                        }
                        resolve()
                    }
                })
    
                stream.on('end', () => {
                    resolve()
                })
    
                stream.on('error', (error) => {
                    console.error('Error downloading file:', error)
                    reject(error)
                })
            })
            return data
        } catch (error) {
            console.error('Error downloading file:', error)
          return data
        }
    }

    async readContacts(){
        let data = []
        const storage = new CloudStorage()
        
        try {
            const stream = storage.readFile("difusion_1.csv")
            await new Promise((resolve, reject) => {
                stream.on('data', (row) => {
                    const { Activista, Desvinculado, Celular, Correo, Corregimiento, CentroVotacion, ContactadoAutomaticamente, SeCabreoDeNosotros } = row
                        data.push({
                            Activista, 
                            Desvinculado, 
                            Celular, 
                            Correo, 
                            Corregimiento, 
                            CentroVotacion, 
                            ContactadoAutomaticamente, 
                            SeCabreoDeNosotros
                        })
                        resolve()
                })
    
                stream.on('end', () => {
                    resolve()
                })
    
                stream.on('error', (error) => {
                    console.error('Error downloading file:', error)
                    reject(error)
                })
            })
            return data
        } catch (error) {
            console.error('Error downloading file:', error)
          return data
        }
    }

    async formatConversation(data){
        const entry = data?.entry?.[0]
        const changeValues = entry?.changes?.[0]?.value
        const messages = changeValues?.messages[0]
        console.log("-----ENTRY----", JSON.stringify(entry))
        const schemaObject = {
            created_at: moment(),
            updated_at: moment(),
            business_account_id: entry?.id,
            business_phone_id: changeValues?.metadata?.phone_number_id,
            business_phone: changeValues?.metadata?.display_phone_number,
            user_id: changeValues?.contacts[0]?.wa_id,
            user_name: changeValues?.contacts[0]?.profile?.name,
            messages: {
                id: messages?.id,
                from: messages?.from,
                timestamp: messages?.timestamp,
                text: messages?.type === "text" ? this.formatText(messages?.text) : undefined,
                reaction: messages?.type === "reaction" ? this.formatReaction(messages?.reaction) : undefined,
                image: messages?.type === "image" ? this.formatImage(messages?.image) : undefined,
                sticker: messages?.type === "sticker" ? this.formatSticker(messages?.sticker) : undefined,
                errors: messages?.type === "errors" ? this.formatErrors(messages?.errors) : undefined,
                location: messages?.type === "location" ? this.formatLocation(messages?.location) : undefined,
                button: messages?.type === "button" ? this.formatButton(messages?.button) : undefined,
                interactive: messages?.type === "interactive" ? this.formatInteractive(messages?.interactive) : undefined,
                referral: messages?.type === "referral" ? this.formatReferral(messages?.referral) : undefined,
            }
        }
        console.log("-----SCHEMA OBJECT----", JSON.stringify(schemaObject))
        return schemaObject
    }
    
    formatText(object){
        return {
            body: object?.body
        }
    }

    formatReaction(object){
        return {
            message_id: object?.message_id,
            emoji: object?.emoji
        }
    }
    formatImage(object){
        return {
            caption: object?.caption,
            mime_type: object?.mime_type,
            sha256: object?.sha256,
            id: object?.id
        }
    }
    formatSticker(object){
        return {
            mime_type: object?.mime_type,
            sha256: object?.sha256,
            id: object?.id
        }
    }
    formatErrors(array){
        const errors = []
        for(let el of array){
            errors.push({
                code: el?.code,
                details: el?.details,
                title: el?.title
            })
        }
        return errors?.length > 0 ? errors : undefined
    }
    formatLocation(object){
        return {
            latitude: object?.latitude,
            longitude: object?.longitude,
            name: object?.name,
            address: object?.address
        }
    }
    formatButton(object){
        return {
            text: object?.text,
            payload: object?.payload
        }
    }
    formatInteractive(object){
        return {
            list_reply: object?.list_reply?.id ? {
                id: object?.list_reply?.id,
                title: object?.list_reply?.title,
                description: object?.list_reply?.description
            }: undefined,
            button_reply: object?.button_reply?.id ? {
                id: object?.button_reply?.id,
                title:  object?.button_reply?.title
            }: undefined
        }
    }
    formatReferral(object){
        return {
            source_url: object?.source_url,
            source_id: object?.source_id,
            source_type: object?.source_type,
            headline: object?.headline,
            body: object?.body,
            media_type: object?.media_type,
            image_url: object?.image_url
        }
    }
}