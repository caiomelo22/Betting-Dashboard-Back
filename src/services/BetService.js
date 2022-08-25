const Bet = require('../models/Bet').Bet;
const Match = require('../models/Match').Match;
const Team = require('../models/Team').Team;
const BetMoneyline = require('../models/BetMoneyline').BetMoneyline;
const BetTotal = require('../models/BetTotal').BetTotal;
const moment = require('moment');
const { League } = require('../models/League');
const { get_deposited_value } = require('../services/ConfigService');

const list = async (req, res) => {
    try {
        const page = parseInt(req.query.page);

        const pageSize = 15

        const { count, rows } = await Bet.findAndCountAll({
            include: [{ model: Match, as: 'match', include: [{ model: Team, as: 'homeTeam' }, { model: Team, as: 'awayTeam' }, { model: League, as: 'league' }] }, { model: BetTotal, as: 'total' }, { model: BetMoneyline, as: 'moneyline' }], offset: (page - 1) * pageSize, limit: pageSize, order: [
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

const create = async (req, res) => {
    let { leagueId, homeTeamId, awayTeamId, matchDate, value, odds, type, prediction, line } = req.body;

    try {

        let match = null;

        matchDate = moment(matchDate).format();

        match = await Match.findOne({ where: { leagueId, homeTeamId, awayTeamId, matchDate } });
        console.log(match)

        if (!match) {
            match = await Match.create({ leagueId, homeTeamId, awayTeamId, matchDate });
        }

        const matchId = match.id;

        const newBet = await Bet.create({ matchId, value, odds, type });

        const betId = newBet.id;

        switch (type) {
            case 'Moneyline':
                newBet.moneyline = await BetMoneyline.create({ betId, prediction });
                break;
            case 'Total':
                newBet.total = await BetTotal.create({ betId, prediction, line });
                break;
        }

        return { statusCode: 200, data: newBet }
    } catch (error) {
        console.log(error)
        return { statusCode: 500, data: 'An error has occured', error: error }
    }
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
    '#9C9EFE', '#2B4865', '#41b883', '#774360', '#FF7F3F', '#7DCE13'
]

const dashboard = async (req, res) => {
    try {
        const bets = await Bet.findAll({
            include: [{
                model: Match, as: 'match', include: [{ model: Team, as: 'homeTeam' },
                { model: Team, as: 'awayTeam' }, { model: League, as: 'league' }]
            }, { model: BetTotal, as: 'total' }, { model: BetMoneyline, as: 'moneyline' }], order: [
                [{ model: Match, as: 'match' }, 'matchDate', 'ASC'],
                ['updatedAt', 'DESC'],
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

        let generalInfo = {
            totalBet: 0,
            totalProfit: 0,
            totalGreens: 0,
            totalReds: 0,
            totalDeposited: (await get_deposited_value()).data
        }

        for (let i = 0; i < bets.length; i++) {
            let betDate = moment(bets[i].match.matchDate).format('DD-MM-YYYY')
            if (labels[labels.length - 1] != betDate) {
                update_bar_chart_colors(barChartInfo)

                labels.push(betDate)

                chartInfo.datasets[0].data.push(generalInfo.totalProfit)
                barChartInfo.datasets[0].data.push(0)

                for (let i = 0; i < leagues.length; i++) {
                    leagueChartInfo.datasets[i].data.push(leagueChartInfo.datasets[i].data[leagueChartInfo.datasets[i].data.length - 1] || 0)
                }
            }

            generalInfo.totalBet += bets[i].value

            let betOutcomeValue
            if (bets[i].won) {
                generalInfo.totalGreens += 1
                betOutcomeValue = bets[i].value * bets[i].odds - bets[i].value
            } else {
                generalInfo.totalReds += 1
                betOutcomeValue = -bets[i].value
            }

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

            generalInfo.totalProfit += betOutcomeValue
            barChartInfo.datasets[0].data[barChartInfo.datasets[0].data.length - 1] += betOutcomeValue
            chartInfo.datasets[0].data[chartInfo.datasets[0].data.length - 1] += betOutcomeValue

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
    dashboard
}