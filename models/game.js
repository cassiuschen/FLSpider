var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = new Schema({
  //唯一编号
  gid: { type: Number, index: true, unique: true },
  //比赛名
  name: { type: String, index: true },
  //全名
  fullname: { type: String },
  //该比赛专属神经网络
  ann: {
    result: { type: String },
    score: { type: String }
  }
});

//查找
GameSchema.statics.getGameById = function (gid, callback){
  this.findOne({gid: gid}, callback);
}

GameSchema.statics.removeAll = function (callback){
  this.remove({}, callback);
}

mongoose.model('Game', GameSchema);

module.exports = mongoose.model('Game');