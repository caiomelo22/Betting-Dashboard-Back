const Bet = require('../models/Bet').Bet;
const Match = require('../models/Match').Match;
const Team = require('../models/Team').Team;
const BetMoneyline = require('../models/BetMoneyline').BetMoneyline;
const BetTotal = require('../models/BetTotal').BetTotal;
const moment = require('moment');
const { Op } = require('sequelize');
const { BetBothScore } = require('../models/BetBothScore');
const { League } = require('../models/League');
const { Parlay } = require('../models/Parlay');
const { get_deposited_value } = require('../services/ConfigService');

const list = async (req, res) => {
    try {
        const page = parseInt(req.query.page);

        const pageSize = 15

        const { count, rows } = await Bet.findAndCountAll({
            where: {
                value: { [Op.ne]: null }
            },
            include: [{ model: Match, as: 'match', include: [{ model: Team, as: 'homeTeam' }, { model: Team, as: 'awayTeam' }, { model: League, as: 'league' }] }, 
            { model: BetTotal, as: 'total' }, { model: BetMoneyline, as: 'moneyline' }, { model: BetBothScore, as: 'bothScore' }], 
            offset: (page - 1) * pageSize, limit: pageSize, order: [
                [{ model: Match, as: 'match' }, 'matchDate', 'DESC'],
                ['updatedAt', 'DESC'],
            ],
        });

        const totalPages = Math.ceil(count / pageSize);

        const returnObject = {
            totalPages,
            bets: rows
        }

        return { statusCode: 200, data: returnObject };
    } catch (error) {
        console.log(error)
        return { statusCode: 500, data: 'An error has occured', error: error }
    }
};

const create_bet = async (bet) => {
    let { leagueId, homeTeamId, awayTeamId, matchDate, value, odds, type, prediction, line, parlayId } = bet;

    try {

        let match = null;

        matchDate = moment(matchDate).format();

        match = await Match.findOne({ where: { leagueId, homeTeamId, awayTeamId, matchDate } });

        if (!match) {
            match = await Match.create({ leagueId, homeTeamId, awayTeamId, matchDate });
        }

        const matchId = match.id;

        const newBet = await Bet.create({ matchId, parlayId, value, odds, type });

        const betId = newBet.id;

        switch (type) {
            case 'Moneyline':
                newBet.moneyline = await BetMoneyline.create({ betId, prediction });
                break;
            case 'Total':
                newBet.total = await BetTotal.create({ betId, prediction, line });
                break;
            case 'BothScore':
                newBet.bothScore = await BetBothScore.create({ betId, prediction });
                break;
        }

        return { statusCode: 200, data: newBet }
    } catch (error) {
        console.log(error)
        return { statusCode: 500, data: 'An error has occured', error: error }
    }
}

const create = async (req, res) => {
    return await create_bet(req.body)
};

const update = async (req, res) => {
    const { id, matchId, value, odds, type, prediction, line } = req.body;

    try {
        const findBet = await Bet.findOne({ where: { id: id }, include: { all: true } })

        if (findBet == null) {
            return { statusCode: 404, data: 'Bet not found.' }
        }

        await findBet.update({ matchId, value, odds, type });

        switch (type) {
            case 'Moneyline':
                await findBet.moneyline.update({ prediction });
                break;
            case 'Total':
                await findBet.total.update({ prediction, line });
                break;
            case 'BothScore':
                await findBet.bothScore.update({ prediction });
                break;
        }

        return { statusCode: 200, data: 'Bet updated successfully.' }
    } catch (error) {
        console.log(error)
        return { statusCode: 500, data: 'An error has occured', error: error }
    }
};

const remove = async (req, res) => {
    const { id } = req.body;

    try {
        const findBet = await Bet.findOne({ where: { id: id } })

        if (findBet == null) {
            return { statusCode: 404, data: 'Bet not found.' }
        }

        await findBet.destroy();

        return { statusCode: 200, data: 'Bet removed successfully.' }
    } catch (error) {
        console.log(error);
        return { statusCode: 500, data: 'An error has occured', error: error }
    }
};

const update_bar_chart_colors = (barChartInfo) => {
    if (barChartInfo.datasets[0].data[barChartInfo.datasets[0].data.length - 1] > 0) {
        barChartInfo.datasets[0].backgroundColor.push('#41b883')
        barChartInfo.datasets[0].borderColor.push('#41b883')
    } else if (barChartInfo.datasets[0].data[barChartInfo.datasets[0].data.length - 1] < 0) {
        barChartInfo.datasets[0].backgroundColor.push('#990000')
        barChartInfo.datasets[0].borderColor.push('#990000')
    }
}

const project_colors = [
    '#9C9EFE', '#6594C0', '#38003c', '#2B4865', '#41b883', '#774360', '#FF7F3F', '#7DCE13', '#224B0C'
]

const check_bet_outcome = (bet, generalInfo, barChartInfo, chartInfo) => {
    let betOutcomeValue
    if (bet.won || bet.earlyPayout) {
        generalInfo.totalGreens += 1
        betOutcomeValue = bet.value * bet.odds - bet.value
    } else {
        generalInfo.totalReds += 1
        betOutcomeValue = -bet.value
    }

    generalInfo.totalProfit += betOutcomeValue
    barChartInfo.datasets[0].data[barChartInfo.datasets[0].data.length - 1] += betOutcomeValue
    chartInfo.datasets[0].data[chartInfo.datasets[0].data.length - 1] += betOutcomeValue

    return betOutcomeValue
}

const get_parlay_leagues = (parlay) => {
    return [...new Set(parlay.bets.map(x => x.match.league.id))]
}

const dashboard = async (req, res) => {
    try {
        const bets = await Bet.findAll({
            include: [{
                model: Match, as: 'match', 
                // where: {matchDate: {[Op.gte]: '2022-09-09'}}, 
                include: [{ model: Team, as: 'homeTeam' },
                { model: Team, as: 'awayTeam' }, { model: League, as: 'league' }]
            }, { model: BetTotal, as: 'total' }, { model: BetMoneyline, as: 'moneyline' }, { model: BetBothScore, as: 'bothScore' }], order: [
                [{ model: Match, as: 'match' }, 'matchDate', 'ASC'],
                ['createdAt', 'DESC'],
            ],
        });
        
        const parlayInclude = {
            model: Bet,
            as: 'bets',
            include: [{
                model: Match, as: 'match', include: [
                    { model: Team, as: 'homeTeam' },
                    { model: Team, as: 'awayTeam' },
                    { model: League, as: 'league' }]
            }, { model: BetTotal, as: 'total' }, { model: BetMoneyline, as: 'moneyline' }, { model: BetBothScore, as: 'bothScore' }]
        }

        const parlays = await Parlay.findAll({
            include: parlayInclude, order: [
                ['date', 'ASC'],
                ['createdAt', 'DESC'],
            ],
        });

        const leagues = await League.findAll();

        let labels = []

        let leagueChartInfo = {
            labels: [],
            datasets: []
        }

        for (let i = 0; i < leagues.length; i++) {
            leagueChartInfo.datasets.push({
                label: leagues[i].name,
                leagueId: leagues[i].id,
                fill: false,
                backgroundColor: project_colors[i],
                borderColor: project_colors[i],
                data: []
            })
        }

        // Inicializando a estrutura base do gráfico utilizada pelo ChartJS
        let chartInfo = {
            labels: [],
            datasets: [
                {
                    label: 'Progression',
                    fill: false,
                    backgroundColor: '#41b883',
                    borderColor: '#41b883',
                    data: []
                },
                {
                    label: 'Moving Average',
                    fill: false,
                    backgroundColor: '#9C9EFE',
                    borderColor: '#9C9EFE',
                    data: []
                },
            ]
        }

        let barChartInfo = {
            labels: [],
            datasets: [
                {
                    label: 'Profit by Day',
                    fill: false,
                    backgroundColor: [],
                    borderColor: [],
                    data: []
                },
            ]
        }

        let profitByTeam = {}
        let proiftByOutcome = {
            'Home': 0,
            'Draw': 0,
            'Away': 0,
        }

        const validBets = bets.filter(x => x.value)
        let generalInfo = {
            avgOdds: (validBets.reduce((prev, curr) => prev + curr.odds, 0))/validBets.length,
            totalBet: 0,
            totalProfit: 0,
            totalGreens: 0,
            totalReds: 0,
            totalDeposited: (await get_deposited_value()).data
        }

        for (let i = 0; i < bets.length; i++) {
            let betDate = moment.utc(bets[i].match.matchDate).format('DD-MM-YYYY')
            if (labels[labels.length - 1] != betDate) {
                update_bar_chart_colors(barChartInfo)

                labels.push(betDate)

                chartInfo.datasets[0].data.push(generalInfo.totalProfit)
                barChartInfo.datasets[0].data.push(0)

                for (let j = 0; j < leagues.length; j++) {
                    leagueChartInfo.datasets[j].data.push(leagueChartInfo.datasets[j].data[leagueChartInfo.datasets[j].data.length - 1] || 0)
                }

                let dateParlays = parlays.filter(x => moment(x.date).format('DD-MM-YYYY') == betDate)
                for(let j = 0; j < dateParlays.length; j++) {
                    const parlayValue = check_bet_outcome(dateParlays[j], generalInfo, barChartInfo, chartInfo)
                    const parlayLeagues = get_parlay_leagues(dateParlays[j])
                    if(parlayLeagues.length == 1) {
                        const index = leagueChartInfo.datasets.map(x => x.leagueId).indexOf(parlayLeagues[0])
                        leagueChartInfo.datasets[index].data[leagueChartInfo.datasets[index].data.length - 1] += parlayValue
                    }
                }
            }

            if(bets[i].value == null) {
                continue
            }

            generalInfo.totalBet += bets[i].value

            betOutcomeValue = check_bet_outcome(bets[i], generalInfo, barChartInfo, chartInfo)

            if (bets[i].type == 'Moneyline') {
                let team
                switch (bets[i].moneyline.prediction) {
                    case 'Home':
                        team = bets[i].match.homeTeam.name;
                        break;
                    case 'Away':
                        team = bets[i].match.awayTeam.name;
                        break;
                }

                if (!(team in profitByTeam)) profitByTeam[team] = 0
                if (bets[i].moneyline.prediction != 'Draw') profitByTeam[team] += betOutcomeValue
                proiftByOutcome[bets[i].moneyline.prediction] += betOutcomeValue
            }

            if (i + 1 == bets.length || moment(bets[i + 1].match.matchDate).format('DD-MM-YYYY') != betDate) {
                const last5Profit = chartInfo.datasets[0].data.slice(-5).reduce((acc, val) => acc + val);
                const last5Length = chartInfo.datasets[0].data.slice(-5).length
                movingAvg = last5Profit / last5Length
                chartInfo.datasets[1].data.push(movingAvg)
            }

            const index = leagueChartInfo.datasets.map(x => x.leagueId).indexOf(bets[i].match.leagueId)
            leagueChartInfo.datasets[index].data[leagueChartInfo.datasets[index].data.length - 1] += betOutcomeValue

        }

        let teamChartInfo = {
            labels: [],
            datasets: [
                {
                    label: 'Profit by Team',
                    fill: false,
                    backgroundColor: [],
                    borderColor: [],
                    data: []
                },
            ]
        }

        for (let team in Object.entries(profitByTeam)
            .sort(([, a], [, b]) => a - b)
            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {})) {
            if (profitByTeam[team]) {
                teamChartInfo.labels.push(team)
                teamChartInfo.datasets[0].data.push(profitByTeam[team])
                update_bar_chart_colors(teamChartInfo)
            }
        }

        let outcomeChartInfo = {
            labels: [],
            datasets: [
                {
                    label: 'Profit by Outcome',
                    backgroundColor: project_colors,
                    borderColor: project_colors,
                    data: []
                },
            ]
        }

        for (let outcome in Object.entries(proiftByOutcome)
            .sort(([, a], [, b]) => a - b)
            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {})) {
            outcomeChartInfo.labels.push(outcome)
            outcomeChartInfo.datasets[0].data.push(proiftByOutcome[outcome])
        }

        update_bar_chart_colors(barChartInfo)

        leagueChartInfo.labels = labels
        barChartInfo.labels = labels
        chartInfo.labels = labels

        leagueChartInfo.datasets = leagueChartInfo.datasets.map(x => {
            x.hidden = x.data[x.data.length - 1] == 0
            return x
        })

        return { statusCode: 200, data: { chartInfo, generalInfo, barChartInfo, leagueChartInfo, teamChartInfo, outcomeChartInfo } };
    } catch (error) {
        console.log(error)
        return { statusCode: 500, data: 'An error has occured', error: error }
    }
};

module.exports = {
    list,
    create,
    update,
    remove,
    dashboard,
    create_bet
}