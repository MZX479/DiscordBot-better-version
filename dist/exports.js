Object.defineProperty(exports, "__esModule", {
    value: true
});
var swcHelpers = require("@swc/helpers");
var Discord = swcHelpers.interopRequireWildcard(require("discord.js"));
class Response {
    async get_embed(embed_options) {
        if (!embed_options) throw new Error('Embed was not given');
        let interaction = this.interaction;
        let result_embed = new Discord.MessageEmbed({
            author: {
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL({
                    dynamic: true
                })
            },
            timestamp: this.time,
            ...embed_options
        });
        return result_embed;
    }
    async reply_true(description, options = {}) {
        if (!description) throw new Error('description was not provided (true_response)');
        let reply_true = this.get_embed({
            color: 'GREEN',
            description: description,
            ...options
        });
        return this.send_embed(await reply_true);
    }
    async reply_false(description, options = {}, epheremal) {
        if (!description) throw new Error('description was not provided (false_response)');
        let reply_false = this.get_embed({
            color: 'RED',
            description: description,
            ...options
        });
        return this.send_embed(await reply_false, epheremal);
    }
    async send_embed(completted_embed, epheremal) {
        if (!completted_embed) throw new Error('Embed was not given!');
        this.interaction.followUp({
            embeds: [
                completted_embed
            ],
            ephemeral: epheremal
        });
    }
    constructor(interaction){
        this.interaction = interaction;
        this.time = new Date();
    }
}
exports.Response = Response;
