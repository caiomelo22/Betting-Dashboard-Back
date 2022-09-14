const _parlayService = require('../services/ParlayService');

const list = async (req, res) => {
    const response = await _parlayService.list(req, res);
    return res.status(response.statusCode).json(response.data);
};

const create = async (req, res) => {
    const response = await _parlayService.create(req, res);
    return res.status(response.statusCode).json(response.data);
};

module.exports = {
    list,
    create,
}