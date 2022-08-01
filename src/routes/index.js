const { Router } = require("express");

const leagueController = require('../controllers/LeagueController');
const betController = require('../controllers/BetController');
const matchController = require('../controllers/MatchController');
const configController = require('../controllers/ConfigController');

const router = Router();

router.get("/healthy", (req, res) => res.send("Everything is okay"));

router.get("/league/list", leagueController.list);

router.get("/bet/list", betController.list);
router.post("/bet/create", betController.create);
router.put("/bet/update", betController.update);
router.delete("/bet/remove", betController.remove);
router.get("/bet/dashboard", betController.dashboard);

router.get("/match/list", matchController.list);
router.put("/match/update", matchController.update);

router.put("/config/update-deposited-value", configController.update_deposited_value);

module.exports = router;
