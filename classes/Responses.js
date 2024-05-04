import axios from "axios"
import { DTOs } from "./DTOs.js"
import { CloudStorage } from './CloudStorage.js'
import { convertToCSV, zoneToImage } from '../resources/utils.js'

export class Responses {
    BUSINESS_PHONE_ID
    GRAPH_API_TOKEN
    constructor(BUSINESS_PHONE_ID, GRAPH_API_TOKEN){
        this.BUSINESS_PHONE_ID = BUSINESS_PHONE_ID
        this.GRAPH_API_TOKEN = GRAPH_API_TOKEN
    }
    
    // send a reply message as per the docs here https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
    async texts(message){
        const body = message?.text?.body
        const noOption = /^no$/i
        if(noOption.test(body)){
          try {
            await axios({
              method: "POST",
              url: `https://graph.facebook.com/v18.0/${this.BUSINESS_PHONE_ID}/messages`,
              headers: {
                Authorization: `Bearer ${this.GRAPH_API_TOKEN}`,
              },
              data: {
                messaging_product: "whatsapp",
                to: message.from,
                text: {
                  body: `Agradecemos su confianza, lo mantendremos al tanto.`
                },
                context: {
                  message_id: message.id,
                },
              },
            })
          } catch (error) {
            console.error("NO OPTION TEXT ERROR: ", JSON.stringify(error))
            return
          }
        } else {
          try {
            await axios({
              method: "POST",
              url: `https://graph.facebook.com/v18.0/${this.BUSINESS_PHONE_ID}/messages`,
              headers: {
                Authorization: `Bearer ${this.GRAPH_API_TOKEN}`,
              },
              data: {
                messaging_product: "whatsapp",
                to: message.from,
                type: "template",
                template: {
                  "name": "services",
                  "language": {
                      "code": "es"
                  }
                },
                context: {
                  message_id: message.id,
                },
              },
            })
          } catch (error) {
            console.error("DEFAULT TEXT ERROR: ", JSON.stringify(error))
            return
          }
        }
    }

    async buttons(message){
        const body = message?.button?.payload
        const verifyTableRegex = /^verificar mesa$/i
        const deleteContact = /^eliminar de contactos$/i
        const yesOption = /^sí$/i
        const noOption = /^no$/i
        if(verifyTableRegex.test(body)) {
          try {
            await axios({
              method: "POST",
              url: `https://graph.facebook.com/v18.0/${this.BUSINESS_PHONE_ID}/messages`,
              headers: {
                Authorization: `Bearer ${this.GRAPH_API_TOKEN}`,
              },
              data: {
                messaging_product: "whatsapp",
                to: message.from,
                type: "template",
                template: {
                  name: "personal_id",
                  language: {
                      code: "es"
                  },
                  components: [
                    {
                        type: "button",
                        sub_type: "flow",
                        index: 0,
                        parameters: [
                            {
                                type: "text",
                                text: "Introduzca su cédula"
                            }
                        ]
                    }
                  ]
                },
                context: {
                  message_id: message.id,
                },
              },
            })
          } catch (error) {
            console.error("VERIFY TABLE BUTTON ERROR: ", JSON.stringify(error))
            return
          }
        }
        if(deleteContact.test(body)){
          try {
            await axios({
              method: "POST",
              url: `https://graph.facebook.com/v18.0/${this.BUSINESS_PHONE_ID}/messages`,
              headers: {
                Authorization: `Bearer ${this.GRAPH_API_TOKEN}`,
              },
              data: {
                messaging_product: "whatsapp",
                to: message.from,
                type: "template",
                template: {
                  "name": "delete_contact",
                  "language": {
                      "code": "es"
                  }
                },
                context: {
                  message_id: message.id,
                },
              },
            })
          } catch (error) {
            console.error("DELETE CONTACT BUTTON ERROR: ", JSON.stringify(error))
            return
          }
        }
        if(yesOption.test(body)){
          const dto = new DTOs()
          const contacts = await dto.readContacts()
          if(contacts?.length === 0){
            res.sendStatus(200)
          }
        
          const contactIndex = contacts?.findIndex((x)=> `507${x?.Celular}` === message?.from)
          contacts[contactIndex].SeCabreoDeNosotros = 1

          const csv = convertToCSV(contacts)
          const storage = new CloudStorage()
          storage.writeFile('difusion.csv', csv)

          try {
            await axios({
              method: "POST",
              url: `https://graph.facebook.com/v18.0/${this.BUSINESS_PHONE_ID}/messages`,
              headers: {
                Authorization: `Bearer ${this.GRAPH_API_TOKEN}`,
              },
              data: {
                messaging_product: "whatsapp",
                to: message.from,
                text: {
                  body: `Ha sido borrado de la lista de difusión, Le agradecemos su tiempo.`
                },
                context: {
                  message_id: message.id,
                },
              },
            })
          } catch (error) {
            console.error("YES OPTION BUTTON ERROR: ", error)
            return
          }
        }
        if(noOption.test(body)){
          try {
            await axios({
              method: "POST",
              url: `https://graph.facebook.com/v18.0/${this.BUSINESS_PHONE_ID}/messages`,
              headers: {
                Authorization: `Bearer ${this.GRAPH_API_TOKEN}`,
              },
              data: {
                messaging_product: "whatsapp",
                to: message.from,
                text: {
                  body: `Agradecemos su confianza, lo mantendremos al tanto.`
                },
                context: {
                  message_id: message.id,
                },
              },
            })
          } catch (error) {
            console.error("NO OPTION BUTTON ERROR: ", error)
            return
          }
        }
    }

    async replies(message){
      const body = JSON.parse(`${message.interactive.nfm_reply.response_json}`)?.screen_0_TextInput_0 ?? ''
      const dto = new DTOs()
      const data = await dto.readVoteCenter(body ?? '')
      const { name, voteCenter, voteTable, zone } = data
      if(data.status){
        try {
          await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/${this.BUSINESS_PHONE_ID}/messages`,
            headers: {
              Authorization: `Bearer ${this.GRAPH_API_TOKEN}`,
            },
            data: {
              messaging_product: "whatsapp",
              to: message.from,
              type: "image",
              image: {
                caption: `*${name}*, le corresponde votar en: *${voteCenter}*, en la mesa: *${voteTable}*.`,
                id: zoneToImage(zone)
              },
              context: {
                message_id: message.id,
              },
            },
          })
        } catch (error) {
          console.error("TEXT REPLY ERROR: ", JSON.stringify(error))
          return
        }
        try {
          await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/${this.BUSINESS_PHONE_ID}/messages`,
            headers: {
              Authorization: `Bearer ${this.GRAPH_API_TOKEN}`,
            },
            data: {
              messaging_product: "whatsapp",
              to: message.from,
              type: "template",
              template: {
                "name": "services",
                "language": {
                    "code": "es"
                }
              },
            },
          })
        } catch (error) {
          console.error("SERVICE REPLY ERROR: ", JSON.stringify(error))
          return
        }
      } else {
        try {
          await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/${this.BUSINESS_PHONE_ID}/messages`,
            headers: {
              Authorization: `Bearer ${this.GRAPH_API_TOKEN}`,
            },
            data: {
              messaging_product: "whatsapp",
              to: message.from,
              text: {
                body: "No hemos podido encontrar su centro de votación. Por favor, consulte en la página oficial del Tribunal Electoral: https://verificate.te.gob.pa/"
              },
              context: {
                message_id: message.id,
              },
            },
          })
        } catch (error) {
          console.error("VOTE CENTER NOT FOUND ERROR: ", JSON.stringify(error))
          return
        }

        try {
          await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/${this.BUSINESS_PHONE_ID}/messages`,
            headers: {
              Authorization: `Bearer ${this.GRAPH_API_TOKEN}`,
            },
            data: {
              messaging_product: "whatsapp",
              to: message.from,
              type: "template",
              template: {
                "name": "services",
                "language": {
                    "code": "es"
                }
              },
            },
          })
        } catch (error) {
          console.error("VOTE CENTER NOT FOUND SERVICE ERROR: ", JSON.stringify(error))
          return
        }
      }

    }

    async difusion(to, MEDIA_ID){
      console.log(`---------------ENVIANDO MENSAJE A: ${to} ----------------`)
      try {
        await axios({
          method: "POST",
          url: `https://graph.facebook.com/v18.0/${this.BUSINESS_PHONE_ID}/messages`,
          headers: {
            Authorization: `Bearer ${this.GRAPH_API_TOKEN}`,
          },
          data: {
            messaging_product: "whatsapp",
            to,
            type: "template",
            template: {
              name: "difusion_template",
              language: {
                  code: "es"
              },
              components: [
                {
                    type: "header",
                    parameters: [
                      {
                          type: "image",
                          image: {
                              id: MEDIA_ID
                          }
                      }
                    ]
                }
              ]
            },
          },
        })
        console.log(`--------------- MENSAJE ENVIADO A: ${to} ----------------`)
        return true
      } catch (error) {
        console.log(`--------------- NO SE HA PODIDO ENVIAR EL MENSAJE A: ${to} ----------------`)
        console.error("DIFUSION ERROR:", JSON.stringify(error))
        return false
      }

    }

    async default(message){
        console.log("Default message")
        /* await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/${this.businessPhoneNumberId}/messages`,
            headers: {
              Authorization: `Bearer ${this.GRAPH_API_TOKEN}`,
            },
            data: {
              messaging_product: "whatsapp",
              to: message.from,
              text: "Le comunicamos con un operador, espere un minuto.",
              context: {
                message_id: message.id,
              },
            },
          }) */
          return
    }
}