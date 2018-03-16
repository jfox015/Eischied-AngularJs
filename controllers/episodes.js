/*----------------------------------------
/  DEPENDANCIES
/---------------------------------------*/
var Episode = require('../models/Episodes');
var util = require('util');
var mongoose = require('mongoose');
var moment = require('moment');
var _ = require('lodash');
/*------------------------------------------------------------------------------
/  
/  ROUTE HANDLERS
/  
------------------------------------------------------------------------------*/
/**
 * Home page
 * @route GET /episodes
 * @param Object req
 * @param Object res
 */
exports.viewEpisodes = function(req, res) {
  res.render('episodes', {
    title: 'Episodes'
  });
};

/**
 * GET EPISODE BY ID
 * @route GET /api/episode/:id
 * @param Object req
 * @param Object res
 */
exports.getEpisode = function(req, res) {
  Episode
    .findById(req.params.id, function(err, episode) {
        if (!err) {
            return res.send({ status: 200, message: "Request Successful", episodes: episode});
        } else {
            res.send({status: 500, errors: err});
        }
    });
};
/**
 * UPDATE EPISODE
 * @route PUT /api/episode/:id
 * @param Object req
 * @param Object res
 * @return  Calls getEpisodes()
 */
exports.putEpisode = function(req, res) {
    if (!req.params.id) {
        res.send({status: 500, errors: { err: "No episode ID was found."}});
    } else {
        var _Id = mongoose.Types.ObjectId(req.params.id);
        var episode = {
            number: req.body.number,
            title: req.body.title,
            director: req.body.director,
            writer: req.body.writer,
            airDate: req.body.airDate
        };
        Episode.findOneAndUpdate({_id: _Id}, episode, {completed: false}, function(err) {
            if (err) {
                res.send({status: 500, errors: err});
            } else {
                return exports.getEpisodes(req, res, "Episode was updated successfully.");
            }
        }); 
    }
};
/**
 * GET EPISODES
 * @route GET /api/episodes
 * @param Object req
 * @param Object res
 * @param Object mess
 * @return  JSONObject response
 */
exports.getEpisodes = function(req, res, mess) {
  Episode.find(function(err, episodes) {
      if (!err) {
        var episodeList = [];
        _.each(episodes, function(episode) {
            var airDate = moment(episode.airDate).format('MM/DD/YYYY');
            episodeList.push({
                _id: episode._id,
                number: episode.number,
                title: episode.title,
                director: episode.director,
                writer: episode.writer,
                airDate: airDate
            });
        });
        if (typeof mess === "undefined") mess = "Request Successful";
        return res.send({ status: 200, message: mess, episodes: episodeList});
      } else {
        res.send({status: 500, errors: err});
      }
  });
};
/**
 * SAVE NEW EPISODE
 * @route POST /api/episodes
 * @param Object req
 * @param Object res
 * @return  JSONObject response on Error, otherwise calls getEpisodes()
 */
exports.postEpisodes = function(req, res) {
  req.assert('number', 'Number cannot be blank').notEmpty();
  req.assert('title', 'Title is not valid').notEmpty();
  req.assert('director', 'Message cannot be blank').notEmpty();
  req.assert('writer', 'Message cannot be blank').notEmpty();
  req.assert('director', 'Message cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    res.send({status: 500, errors: errors});
  }
  
  var episode = new Episode({
      number: req.body.number,
      title: req.body.title,
      director: req.body.director,
      writer: req.body.writer,
      airDate: req.body.airDate
  });
  console.log(util.inspect(episode));
  episode.save(function (err) {
    if (err) {
        res.send({status: 500, errors: err});
    } else {
        return exports.getEpisodes(req, res);
    }
  });
  // Send update episode  list
  
};
/**
 * DELETE EPISODE
 * @route GET /api/episode/delete/:id
 * @param Object req
 * @param Object res
 * @return  JSONObject response on Error, otherwise calls getEpisodes()
 */
exports.getDelete = function(req, res) {
    if (!req.params.id) {
        res.send({status: 500, errors: { err: "No episode ID was found."}});
    } else {
        var _Id = mongoose.Types.ObjectId(req.params.id);
        Episode.findByIdAndRemove({_id: _Id}, {completed: false}, function(err) {
            if (err) {
                res.send({status: 500, errors: err});
            } else {
                return exports.getEpisodes(req, res, "Episode was deleted successfully.");
            }
        }); 
    }
};