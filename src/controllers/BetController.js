const _betService = require('../services/BetService');

const list = async (req, res) => {
    const response = await _betService.list(req, res);
    return res.status(response.statusCode).json(response.data);
};

const create = async (req, res) => {
    const response = await _betService.create(req, res);
    return res.status(response.statusCode).json(response.data);
};

const update = async (req, res) => {
    const response = await _betService.update(req, res);
    return res.status(response.statusCode).json(response.data);
};

const remove = async (req, res) => {
    const response = await _betService.remove(req, res);
    return res.status(response.statusCode).json(response.data);
};

const dashboard = async (req, res) => {
    const response = await _betService.dashboard(req, res);
    return res.status(response.statusCode).json(response.data);
};

module.exports = {
    list,
    create,
    update,
    remove,
    dashboard
}