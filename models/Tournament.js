const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TournamentSchema = new Schema({
    name: String,
    description: String,
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    leagueType: {
        type: String,
        enum: ['Online','Offline']
    },
    genre: {
        type: String,
        enum: ['Dota 2','PUBG','Liên Minh Huyền Thoại','CSGO','Liên Quân Mobile']
    },
    teams: [{
        type: Schema.Types.ObjectId,
        ref: 'Team'
    }],
    avatarUrl: [{
        type: String,
        default: 'None'
    }]
},{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

module.exports = mongoose.model('Tournament',TournamentSchema);