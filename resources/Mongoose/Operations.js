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
}