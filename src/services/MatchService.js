const { BetMoneyline } = require('../models/BetMoneyline');
const { BetTotal } = require('../models/BetTotal');
const { Parlay } = require('../models/Parlay');

const Bet = require('../models/Bet').Bet;
const Match = require('../models/Match').Match;
const Team = require('../models/Team').Team;
const League = require('../models/League').League;

const list = async (req, res) => {
    try {
        const page = parseInt(req.query.page);

        const pageSize = 15

        const { count, rows } = await Match.findAndCountAll({
            where: { scoreHomeTeam: null, scoreAwayTeam: null },
            include: [{ model: Team, as: 'homeTeam' }, { model: Team, as: 'awayTeam' }, { model: League, as: 'league' }], offset: page - 1, limit: pageSize, order: [
                ['matchDate', 'DESC'],
                ['updatedAt', 'DESC'],
            ],
        });

        const totalPages = Math.ceil(count / pageSize);

        const returnObject = {
            totalPages,
            matches: rows
        }

        return { statusCode: 200, data: returnObject };
    } catch (error) {
        console.log(error)
        return { statusCode: 500, data: 'An error has occured', error: error }
    }
};

const update = async (req, res) => {
    const { id, scoreHomeTeam, scoreAwayTeam } = req.body;

    try {
        const findMatch = await Match.findOne({ where: { id: id }, include: { model: Bet, as: 'bets', include: [{ model: BetMoneyline, as: 'moneyline' }, { model: BetTotal, as: 'total' }] } })

        if (findMatch == null) {
            return { statusCode: 404, data: 'Match not found.' }
        }

        await findMatch.update({ scoreHomeTeam, scoreAwayTeam });

        for (let i = 0; i < findMatch.bets.length; i++) {
            if (findMatch.bets[i].type == 'Moneyline' && ((scoreHomeTeam > scoreAwayTeam && findMatch.bets[i].moneyline.prediction == 'Home') ||
                (scoreHomeTeam < scoreAwayTeam && findMatch.bets[i].moneyline.prediction == 'Away') ||
                (scoreHomeTeam == scoreAwayTeam && findMatch.bets[i].moneyline.prediction == 'Draw'))) {
                findMatch.bets[i].update({ won: true })
            }
            else if (findMatch.bets[i].type == 'Total' && ((scoreHomeTeam + scoreAwayTeam > totalBets[i].total.line && totalBets[i].total.prediction == 'Over') ||
                (scoreHomeTeam + scoreAwayTeam < totalBets[i].total.line && totalBets[i].total.prediction == 'Under'))) {
                findMatch.bets[i].update({ won: true })
            }

            if (findMatch.bets[i].parlayId) {
                let parlay = await Parlay.findOne({ where: { id: findMatch.bets[i].parlayId }, include: { model: Bet, as: 'bets', include: { model: Match, as: 'match' } } })
                
                if(!findMatch.bets[i].won && !parlay.finished) {
                    await parlay.update({ finished: true })
                    console.log(parlay)
                }
                if(parlay.finished) {
                    continue
                } 

                let finished = parlay.finished
                let won = parlay.won

                if (!parlay.bets.some(x => x.match.scoreHomeTeam == null)) {
                    finished = true

                    if (!parlay.bets.some(x => !x.won)) {
                        won = true
                    }

                    await parlay.update({ finished, won })
                }
            }
        }

        return { statusCode: 200, data: 'Match updated successfully.' }
    } catch (error) {
        console.log(error)
        return { statusCode: 500, data: 'An error has occured', error: error }
    }
};

module.exports = {
    list,
    update
}