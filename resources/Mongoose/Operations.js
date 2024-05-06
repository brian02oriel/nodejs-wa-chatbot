import moment from "moment"
import Conversation from "./db.js"
export class Operations {
    constructor(){}
    async insertConversation(data){
        try {
            let res = await Conversation.create(data)
            console.log("CONVERSATION SUCCESSFULLY INSERTED: ", res)
        } catch (error) {
            console.error("INSERT ERROR: ", error)
        }
    }

    async getConversations(type, from , to){
        const field = `messages.${type}`
        try {
            const conversations = await Conversation.find({
                [field]: {
                    $exists: true
                },
                created_at: {
                    $gte: moment(from).hours(0).minutes(0).seconds(0).milliseconds(1).toDate(), 
                    $lt: moment(to).hours(23).minutes(59).seconds(59).milliseconds(999).toDate()
                }
            }).exec()
            console.log("---------------LENGTH-----------", conversations?.length)
            return conversations
        } catch (error) {
            console.error(JSON.stringify(error))
            return []
        }
    }
}