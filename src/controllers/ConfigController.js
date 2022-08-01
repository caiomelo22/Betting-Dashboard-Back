const _configService = require('../services/ConfigService');

const update_deposited_value = async (req, res) => {
    const response = await _configService.update_deposited_value(req, res);
    return res.status(response.statusCode).json(response.data);
};

module.exports = {
  update_deposited_value
}