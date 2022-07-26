const { FinancialAction } = require('../models/FinancialAction');

const Config = require('../models/Config').Config;

const update_deposited_value = async (req, res) => {
  try {
    const { deposited } = req.body

    const findConfig = await Config.findOne({ where: { key: 'deposited' } })

    if(findConfig.value > deposited) {
        await FinancialAction.create({
            value: findConfig.value - deposited,
            actionType: 'Withdraw'
        })
    } else if (deposited > findConfig.value) {
        await FinancialAction.create({
            value: deposited - findConfig.value,
            actionType: 'Deposit'
        })
    }

    await findConfig.update({ value: deposited });

    return { statusCode: 200, data: 'Deposited value updated successfully.' }
  } catch (error) {
    console.log(error)
    return { statusCode: 500, data: 'An error has occured', error: error }
  }
}

const get_deposited_value = async () => {
  try {
    const findConfig = await Config.findOne({ where: { key: 'deposited' } })

    return { statusCode: 200, data: parseFloat(findConfig.value) }
  } catch (error) {
    console.log(error)
    return { statusCode: 500, data: 'An error has occured', error: error }
  }
}

module.exports = {
  update_deposited_value,
  get_deposited_value
}