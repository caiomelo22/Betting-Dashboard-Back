const League = require('../models/League').League;
const Team = require('../models/Team').Team;

const list = async (req, res) => {
  try {
    let leagues = [];
    
    leagues = await League.findAll({ include: { model: Team, as: 'teams' }});

    return { statusCode: 200, data: leagues };
  } catch (error) {
    console.log(error)
    return { statusCode: 500, data: 'An error has occured', error: error }
  }
};

module.exports = {
  list,
}