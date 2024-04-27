import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import axios from "axios";
import moment from 'moment';
import { Responses } from './classes/Responses/Responses.js';

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, BUSINESS_PHONE_ID } = process.env;
const PORT = process.env.PORT || 8080;

app.post("/webhook", async (req, res) => {
  // log incoming messages
  console.log("----------------------Incoming webhook message ---------------", JSON.stringify(req.body, null, 2));

  // check if the webhook request contains a message
  // details on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
  const responses = new Responses(BUSINESS_PHONE_ID, GRAPH_API_TOKEN)
  // check if the incoming message contains text
  console.log("-------------------- MESSAGE TYPE -------------------", message?.type)
  try {
    switch(message?.type){
      case "text":
        await responses.texts(message)
      break
      case "button":
        await responses.buttons(message)
      break
    }
  } catch (error) {
    console.error(error)
  } finally {
      console.log("----------------------- Object -------------------", JSON.stringify({
        from: message?.from,
        id: message?.id
      }))
  
      if(message?.type){
        // mark incoming message as read
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
        });
      }
  }

  res.sendStatus(200);
});

app.post("/recurrent", async (req, res) => {
  // log incoming messages
  console.log("---------------------- INCOMING RECURRENT MESSAGE ---------------", JSON.stringify(req.body, null, 2));
  const to = req.body.to
  const daysCount = moment('2024-05-05 00:00Z').diff(moment(), 'days')
  
  await axios({
    method: "POST",
    url: `https://graph.facebook.com/v18.0/${BUSINESS_PHONE_ID}/messages`,
    headers: {
      Authorization: `Bearer ${GRAPH_API_TOKEN}`,
    },
    data: {
      messaging_product: "whatsapp",
      to,
      text: {
        body: `Buenos días, te saluda Irma Hernández. *Faltan ${daysCount} días* para la fiesta de la democracia. Recuerda verificar tu mesa de votación y asegurar el transporte a tu lugar de votación. *¡VAMOS POR UN MEJOR SAN MIGUELITO!*`
      },
    },
  });

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
        "name": "services",
        "language": {
            "code": "es"
        }
      },
    },
  });


  res.sendStatus(200);
});

// accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
  console.log("Testing webhook----------->", req.query)
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // check the mode and token sent are correct
  console.log(WEBHOOK_VERIFY_TOKEN)
  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    // respond with 200 OK and challenge token from the request
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    // respond with '403 Forbidden' if verify tokens do not match
    res.sendStatus(403);
  }
});

app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
