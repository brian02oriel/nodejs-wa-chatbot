import mongoose from 'mongoose'
const { Schema, model } = mongoose
import dotenv from 'dotenv'
dotenv.config()

const { DB_USR, DB_PWD } = process.env
mongoose.connect(`mongodb+srv://${DB_USR}:${DB_PWD}@conversations.ams0zju.mongodb.net/`)

const TextSchema = new Schema({
    body: String
})

const ReactionSchema = new Schema({
    message_id: String,
    emoji: String
})

const ImageSchema = new Schema({
    caption: String,
    mime_type: String,
    sha256: String,
    id: String
})

const StickerSchema = new Schema({
    mime_type: String,
    sha256: String,
    id: String
})

const ErrorsSchema = new Schema({
    code: String,
    details: String,
    title: String
})

const LocationSchema = new Schema({
    latitude: String,
    longitude: String,
    name: String,
    address: String
})

const ButtonSchema = new Schema({
    text: String,
    payload: String
})

const InteractiveSchema = new Schema({
    type: String,
    nfm_reply: {
        response_json: String
    },
    list_reply: {
      id: String,
      title: String,
      description: String
    },
    button_reply: {
        id: String,
        title: String,
      },
    type: String
})

const ReferralSchema = new Schema({
    source_url: String,
    source_id: String,
    source_type:  String,
    headline: String,
    body: String,
    media_type: String,
    image_url: String
})

const ConversationSchema = new Schema({
        created_at: Date,
        updated_at: Date,
        business_account_id: String,
        business_phone_id: String,
        business_phone: String,
        user_id: String,
        user_name: String,
        messages: {
                from: String,
                id: String,
                timestamp: String,
                text: TextSchema,
                reaction: ReactionSchema,
                image: ImageSchema,
                sticker: StickerSchema,
                errors: [ErrorsSchema],
                location: LocationSchema,
                button: ButtonSchema,
                interactive: InteractiveSchema,
                referral: ReferralSchema
        }    
})

const Conversation = model('conversation', ConversationSchema)
export default Conversation
