import dotenv from 'dotenv'
dotenv.config()
import express from "express"
import axios from "axios"
import { Responses } from './classes/Responses.js'
import { DTOs } from './classes/DTOs.js'
import { CloudStorage } from './classes/CloudStorage.js'
import { convertToCSV } from './resources/utils.js'
import { Operations } from './resources/Mongoose/Operations.js'

const app = express()
app.use(express.json())

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, BUSINESS_PHONE_ID, MEDIA_ID } = process.env
const PORT = process.env.PORT || 8080

app.post("/webhook", async (req, res) => {  
  // TODO: Adding management for status updates
  /* if(req.body.entry?.[0]?.changes[0]?.statuses?.status !== 'sent'){
    res.sendStatus(200)
    return
  } */
  console.log("----------------------Incoming webhook message ---------------", JSON.stringify(req.body))

  const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0]
  const responses = new Responses(BUSINESS_PHONE_ID, GRAPH_API_TOKEN)
  console.log("-------------------- MESSAGE TYPE -------------------", message?.type)
  try {
    if(message?.type){
      const dto = new DTOs()
      const operations = new Operations()
      const formatedData = await dto.formatConversation(req.body)
      await operations.insertConversation(formatedData)
    }
    switch(message?.type){
      case "text":
        await responses.texts(message)
      break
      case "button":
        await responses.buttons(message)
      break
      case "interactive":
          await responses.replies(message)
      break
    }
  } catch (error) {
    console.error(error)
  } finally {
  
      if(message?.type){
        // mark incoming message as read
        try {
          await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/${BUSINESS_PHONE_ID}/messages`,
            headers: {
              Authorization: `Bearer ${GRAPH_API_TOKEN}`,
            },
            data: {
              messaging_product: "whatsapp",
              status: "read",
              message_id: message?.id,
            },
          })
        } catch (error) {
          console.error("WEBHOOK ERROR: ", JSON.stringify(error))
        }
      }
  }

  res.sendStatus(200)
})

app.post("/recurrent", async (req, res) => {
  const to = req.body.to
  console.log(`---------------ENVIANDO RECURRENT A: ${to} ----------------`)
  try {
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v18.0/${BUSINESS_PHONE_ID}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
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
  } catch (error) {
    console.log(JSON.stringify(error, null, 2))
  }

  res.sendStatus(200)
})

app.post("/difusion", async (req, res) => {
  const dto = new DTOs()
  const contacts = await dto.readContacts()
  const responses = new Responses(BUSINESS_PHONE_ID, GRAPH_API_TOKEN)
  if(contacts?.length === 0){
    res.sendStatus(200)
  }

  // Note: For other scope in difusion message just add the SeCabreoDeNosotros variable in this condition
  const filteredContacts = contacts?.filter((x)=> !x?.ContactadoAutomaticamente && !x?.SeCabreoDeNosotros)
  for(const contact of filteredContacts){
    let { Celular } = contact
    console.log(`USER: ${contact.Activista} - ${contact.Celular}`)
    const sended = await responses.difusion(`507${Celular}`, MEDIA_ID)
    if(sended){
      contact.ContactadoAutomaticamente = 1  
    }
  }
  
  
  for(let contact of contacts){
    const exists = filteredContacts?.find((x)=> x?.Celular)
    if(exists){
      contact = {...exists}
    }
  }

  const csv = convertToCSV(contacts)
  const storage = new CloudStorage()
  storage.writeFile('difusion.csv', csv)
  
  res.sendStatus(200)
})

// accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"]
  const token = req.query["hub.verify_token"]
  const challenge = req.query["hub.challenge"]

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    // respond with 200 OK and challenge token from the request
    res.status(200).send(challenge)
    console.log("Webhook verified successfully!")
  } else {
    // respond with '403 Forbidden' if verify tokens do not match
    res.sendStatus(403)
  }
})

app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`)
})

const server = app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`)
  server.setTimeout(1200000) // 20 minutes
})
