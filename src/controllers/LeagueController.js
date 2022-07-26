const _leagueService = require('../services/LeagueService');

const list = async (req, res) => {
    const response = await _leagueService.list(req, res);
    return res.status(response.statusCode).json(response.data);
};

module.exports = {
    list,
}