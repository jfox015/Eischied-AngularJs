var mongoose = require('mongoose');

var episodeSchema = new mongoose.Schema({
    
    number: {type: Number, unique: true },
    title: String,
    director: String,
    writer: String,
    airDate: Date
    
});

module.exports = mongoose.model('Episode', episodeSchema);