import axios from "axios";
import { CloudStorage } from "./CloudStorage.js";

export class Responses {
    businessPhoneNumberId
    GRAPH_API_TOKEN
    constructor(businessPhoneNumberId, GRAPH_API_TOKEN){
        this.businessPhoneNumberId = businessPhoneNumberId
        this.GRAPH_API_TOKEN = GRAPH_API_TOKEN
    }
    
    // send a reply message as per the docs here https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
    async texts(message){
        const body = message?.text?.body
        const welcomeRegex = /^buenas$/i
        console.log("Cuerpo del mensaje", body)
        if(welcomeRegex.test(body)){
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/v18.0/${this.businessPhoneNumberId}/messages`,
                headers: {
                  Authorization: `Bearer ${this.GRAPH_API_TOKEN}`,
                },
                data: {
                  messaging_product: "whatsapp",
                  to: message.from,
                  type: "template",
                  template: {
                    "name": "llamado_a_accion_5_de_mayo",
                    "language": {
                        "code": "es"
                    }
                  },
                  context: {
                    message_id: message.id,
                  },
                },
              });
        }
    }

    async buttons(message){
        const body = message?.button?.payload
        const verifyTableRegex = /^verificar mesa$/i
        console.log("Button Message: ", JSON.stringify(message))
        //console.log("Cuerpo del mensaje", body)
        if(verifyTableRegex.test(body)) {
          await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/${this.businessPhoneNumberId}/messages`,
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
                      type: "header"
                  },
                  {
                      type: "body"
                  },
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
          });
        }

    }

    async replies(message){
      const body = JSON.parse(`${message.interactive.nfm_reply.response_json}`)?.screen_0_TextInput_0 ?? ''
      const storage = new CloudStorage()
      const data = await storage.readFile(body ?? '')

      if(data.status){
        await axios({
          method: "POST",
          url: `https://graph.facebook.com/v18.0/${this.businessPhoneNumberId}/messages`,
          headers: {
            Authorization: `Bearer ${this.GRAPH_API_TOKEN}`,
          },
          data: {
            messaging_product: "whatsapp",
            to: message.from,
            text: {
              body: `*${data.name}*, le corresponde votar en: *${data.voteCenter}*, en la mesa: *${data.voteTable}*.`
            },
            context: {
              message_id: message.id,
            },
          },
        });
      } else {
        await axios({
          method: "POST",
          url: `https://graph.facebook.com/v18.0/${this.businessPhoneNumberId}/messages`,
          headers: {
            Authorization: `Bearer ${this.GRAPH_API_TOKEN}`,
          },
          data: {
            messaging_product: "whatsapp",
            to: message.from,
            text: {
              body: "No hemos podido encontrar su centro de votación."
            },
            context: {
              message_id: message.id,
            },
          },
        });
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
          }); */
          return
    }
}