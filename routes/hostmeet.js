const router = require("express").Router();
const express = require('express');
const app = express();

const server = require('http').Server(app);


const {
    v4: uuidV4
  } = require('uuid');
  const {
    validate: uuidValidate
  } = require('uuid');
  const {
    ExpressPeerServer
  } = require('peer');
  const peerServer = ExpressPeerServer(server, {
    debug: true
  });
  


router.get('/', function(req, res) {
    req.session.error = '';
    res.redirect(`/hostmeet/${uuidV4()}`);
  });

router.get('/:meet', function(req, res) {
    if (uuidValidate(req.params.meet)) { //validates if used a proper uuidV4
      req.session.error = '';
      res.render('hostmeet', {
        meetId: req.params.meet,
        isAuth: req.session.isAuth,
        title: 'Host | '
      });
    } else {
      req.session.error = '';
      res.redirect(`/${uuidV4()}`)
    }
  })



  router.post('/:meet', function(req, res) {
    let meetId = req.params.meet;
    if (uuidValidate(meetId)) { //validates if used a proper uuidV4
      let userName = req.body.name;
      let video = req.body.video;
      let audio = req.body.audio;
      if (video == 'on') {
        video = true;
      } else {
        video = false;
      }
      if (audio == 'on') {
        audio = true;
      } else {
        audio = false;
      }
      if (!userName) {
        userName = 'Host'
      }
      res.render('meet', {
        meetId: meetId,
        title: '',
        chats: [],
        userName: userName,
        video: video,
        audio: audio,
        isAuth: req.session.isAuth,
        title: "Meet | "
      })
    } else {
      res.redirect('/')
    }
  })


  module.exports = router;
  