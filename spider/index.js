var mongoose    = require('mongoose'),
    logger      = require('tracer').console(),
    eventproxy  = require('eventproxy');

var dbconfig    = require('../configs/database');
var time        = require('../utils/time'),
    converter   = require('../utils/converter'),
    printer     = require('../utils/printer');
    
var daySpider   = require('./day');
var teamSpider  = require('./team');
//var matchSpider = require('./core/spider/match');

var Match       = require('../models/match');
var Team        = require('../models/team');
var Game        = require('../models/game');

var FIRST_DATE = '2009-11-17';
//var FIRST_DATE = '2015-06-21';

if (process.env.NODE_ENV === 'docker') {
  mongoose.connect('mongodb://' + process.env.MONGODB_USERNAME + ':' + process.env.MONGODB_PASSWORD + '@' + process.env.MONGODB_HOST + '/' + process.env.MONGODB_DATABASE);
} else {
  mongoose.connect(dbconfig.url);
}

mongoose.connection.on('error', function () {
  logger.error('数据库连接出错');
}); 

module.exports = function (force){
  var count = 0;

  var timestamp = Date.now();
  var now = new Date(Date.now());
  var start = converter.dateToString(new Date(Date.now()));
  //start = '2015-05-31';
  //clear();
  // 如果时间在早上10点之前，live.500.com有可能抓不到当天数据，故向前推一天
  // if(now.getHours()<10){
  //   start = converter.dateToString(time.yesterday(start));
  // }
  var current = '';

  var runDay = function (){
    current = start;
    console.log('开始按日期抓取赛事数据...'.blue);
    daySpider(current,nextDay,force);
  }

  var nextDay = function(d,all,e){
    if(d === FIRST_DATE || all === true){
      console.log('自'.blue,start,'至'.blue,d,'的赛事数据已更新，开始更新球队数据...'.blue);
      runTeam();
    }else{
      current = converter.dateToString(time.yesterday(d));
      if(e){
        current = d;
      }
      daySpider(current,nextDay,force);
    }
  }

  var teams;
  var tpos = 0;
  var tcount = 0;
  var runTeam = function (){
    Team.getTeamsNeedUpdate(function (err,ts){
      if(err){
        console.error('获取球队列表出错，错误信息为：'.red);
        console.error(String(err).grey);
        return null;
      }
      if(ts.length>0){
        teams = ts;
        tpos = 0;
        tcount += ts.length;
        printer.header(('有'+teams.length+'支球队的数据需要更新...').grey);
        teamSpider(teams[tpos],nextTeam);
      }else{
        timestamp = Math.floor((Date.now() - timestamp)/1000);
        var time = '';
        if(timestamp>0){
          time = timestamp%60+'秒';
        }
        if(timestamp>60){
          time = Math.floor(timestamp/60)%60+'分'+time;
        }
        if(timestamp>3600){
          time = Math.floor(timestamp/3600)+'时'+time;
        }
        printer.header(('全部'+tcount+'支球队已更新完毕，耗时'+time).blue);
      }
    });
  }

  var nextTeam = function (e){
    if(tpos===teams.length-1){
      printer.header(((tpos+1)+'支球队已更新完毕，重新检测需更新的球队...').grey);
      runTeam();
    }else{
      if(!e){
        tpos++;
      }
      teamSpider(teams[tpos],nextTeam);
    }
  }
  runDay();
}

var clear = function(){
  Match.removeAll(function(err){
    console.log('ALL MATCHES REMOVED!!!');
  });
  Team.removeAll(function(err){
    console.log('ALL TEAMS REMOVED!!!');
  });
  Game.removeAll(function(err){
    console.log('ALL GAMES REMOVED!!!');
  });
  Match.removeByDate('2015-06-19',function(err){
    console.log('ALL MATCHES REMOVED!!!');
  });
}
