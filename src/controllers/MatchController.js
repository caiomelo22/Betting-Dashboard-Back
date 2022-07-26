const _matchService = require('../services/MatchService');

const list = async (req, res) => {
    const response = await _matchService.list(req, res);
    return res.status(response.statusCode).json(response.data);
};

const update = async (req, res) => {
    const response = await _matchService.update(req, res);
    return res.status(response.statusCode).json(response.data);
};

module.exports = {
    list,
    update
}