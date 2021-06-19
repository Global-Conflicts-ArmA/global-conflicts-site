const express = require('express');
const Mission = require('../models/mission.model');
const User = require('../models/discordUser.model');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const { requireLogin } = require("../middleware/middlewares");
const { requireMissionReviewer } = require("../middleware/middlewares");
const { postMissionAuditSubmited } = require('../discord-poster');
const { getDiscordUserFromCookies } = require('../misc/validate-cookies');

REVIEW_STATE_PENDING = 'review_pending'
REVIEW_STATE_REPROVED = 'review_reproved'
REVIEW_STATE_ACCEPTED = 'review_accepted'
REVIEW_STATE_ACCEPTS_WITH_CAVEATS = 'review_accepted_with_caveats'

router.get('/questionnaire', [requireLogin, requireMissionReviewer], async (req, res) => {
	const configs = await mongoose.connection.db
		.collection('configs')
		.findOne({}, { projection: { mission_review_questions: 1 } });
	return res.send(configs['mission_review_questions']);
});

router.post('/submit_audit_review',[requireLogin, requireMissionReviewer], async (req, res) => {


	const state = req.body.reviewState;
	const reviewChecklist = req.body.reviewChecklist;
	const reviewerNotes = req.body.reviewerNotes;
	if (state !== REVIEW_STATE_REPROVED && state !== REVIEW_STATE_ACCEPTED) {
		return res.status(400).send({ error: 'invalid state' });
	}

	Mission.findOneAndUpdate(
		{
			uniqueName: req.body.uniqueName,
			'updates._id': req.body.updateId
		},
		{
			$set: {
				'updates.$.reviewState': state,
				reviewChecklist: reviewChecklist,
				reviewerNotes: reviewerNotes
			}
		},
		{
			upsert: true,
			safe: true,
			new: true,
			strict: false
		}
	)
		.lean()
		.then((mission) => {
			postMissionAuditSubmited(
				req,
				mission,
				req.body.updateId,
				state,
				reviewChecklist,
				reviewerNotes
			);
			res.send({ ok: true });
		})
		.catch((err) => {
			console.log('err: ', err);
			return res.status(500).send(err);
		});
});

module.exports = router;
