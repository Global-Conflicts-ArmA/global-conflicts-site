const express = require('express');;
const mongoose = require('mongoose');
const Mission = require('../models/mission.model');

const router = express.Router();

router.get("/", function(req, res) {
  console.log('GET request for all missions');
  Mission.find({})
    .exec(function(err, users){
      if (err){
        console.log("Error retrieving missions");
      } else {
        res.json(users);
      }
    })
});

router.get("/:id", function(req, res) {
  console.log('GET request for single mission');
  console.log('id check:', req.params.id);
  Mission.findOne({id: req.params.id})
    .exec(function(err, user){
      if (err){
        console.log("Error retrieving mission");
      } else {
        res.json(user);
      }
    })
});

router.post("/", function(req, res) {
  console.log('POST request for mission');
  console.log("Mission", Mission);
  var newMission = new Mission();
  console.log("newMission", newMission);
  newMission.name = req.body.name;
  newMission.author = req.body.author;
  newMission.authorID = req.body.authorID;
  newMission.type = req.body.type;
  newMission.terrain = req.body.terrain;
  newMission.description = req.body.description;
  newMission.playercount = req.body.playercount;
  newMission.framework = req.body.framework;
  newMission.createDate = req.body.createDate? req.body.createDate: Date.now();
  newMission.updateDate = req.body.updateDate? req.body.updateDate: Date.now();
  newMission.version = req.body.version? req.body.version: 0.1;
  newMission.tested = req.body.tested? req.body.tested: false;
  newMission.reportedBugs = req.body.reportedBugs? req.body.reportedBugs: [];
  newMission.onMainServer = req.body.onMainServer? req.body.onMainServer: false;
  newMission.onTestServer = req.body.onTestServer? req.body.onTestServer: false;
  console.log(newMission);
  newMission.save(function(err, insertedMission){
    if (err){
      console.log("Error saving user");
    } else {
      res.json(insertedMission);
    }
  })
});

module.exports = router;
