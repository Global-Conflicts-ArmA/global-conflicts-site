const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { requireLogin } = require('../middleware/middlewares');

router.get('/terrains', [requireLogin], async (req, res) => {
	const configs = await mongoose.connection.db
		.collection('configs')
		.findOne({}, { projection: { allowed_terrains: 1 } });
	return res.send(configs['allowed_terrains']);
});


module.exports = router;
