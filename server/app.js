// Instantiate Express and the application - DO NOT MODIFY
const express = require("express");
const app = express();
const { Op } = require("sequelize");
// Import environment variables in order to connect to database - DO NOT MODIFY
require("dotenv").config();
require("express-async-errors");

// Import the models used in these routes - DO NOT MODIFY
const { Band, Musician, Instrument } = require("./db/models");

// Express using json - DO NOT MODIFY
app.use(express.json());

// STEP 1: Creating from an associated model (One-to-Many)
app.post("/bands/:bandId/musicians", async (req, res, next) => {
	// Your code here
	const band = await Band.findByPk(req.params.bandId);
	const musician = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
	};
	band.createMusician(musician);
	const id = await band.getMusicians({
		where: {
			firstName: musician.firstName,
			lastName: musician.lastName,
		},
	});
	res.json({
		status: "Created new musician for " + band.name,
		key: id[0],
	});
});

// STEP 2: Connecting two existing records (Many-to-Many)
app.post("/musicians/:musicianId/instruments", async (req, res, next) => {
	// Your code here
	const instrumentIds = req.body.instrumentIds;
	const instruments = await Instrument.findAll({
		where: {
			id: {
				[Op.in]: instrumentIds,
			},
		},
	});
	// console.log("********", instruments);
	const musician = await Musician.findByPk(req.params.musicianId);
	// console.log("------", musician);
	await musician.addInstruments(instruments);
	const ins = await musician.getInstruments();
	// console.log("//////////", ins);
	res.json({ ...musician, instruments: ins });
});

// Get the details of one band and associated musicians - DO NOT MODIFY
app.get("/bands/:bandId", async (req, res, next) => {
	const payload = await Band.findByPk(req.params.bandId, {
		include: { model: Musician },
		order: [[Musician, "firstName"]],
	});
	res.json(payload);
});

// Get the details all bands and associated musicians - DO NOT MODIFY
app.get("/bands", async (req, res, next) => {
	const payload = await Band.findAll({
		include: { model: Musician },
		order: [["name"], [Musician, "firstName"]],
	});
	res.json(payload);
});

// Get the details of one musician and associated instruments - DO NOT MODIFY
app.get("/musicians/:musicianId", async (req, res, next) => {
	const payload = await Musician.findByPk(req.params.musicianId, {
		include: { model: Instrument },
		order: [[Instrument, "type"]],
	});
	res.json(payload);
});

// Get the details all musicians and associated instruments - DO NOT MODIFY
app.get("/musicians", async (req, res, next) => {
	const payload = await Musician.findAll({
		include: { model: Instrument },
		order: [["firstName"], ["lastName"], [Instrument, "type"]],
	});
	res.json(payload);
});

// Root route - DO NOT MODIFY
app.get("/", (req, res) => {
	res.json({
		message: "API server is running",
	});
});

// Set port and listen for incoming requests - DO NOT MODIFY
const port = 5000;
app.listen(port, () => console.log("Server is listening on port", port));
