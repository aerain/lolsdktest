'use strict';

const fetch = require('node-fetch');

class LeagueOfLegendsAPI {
    constructor(app_key = null) {
        console.log("생성자");
        this.app_key = app_key;

        this.bindMethod = this.bindMethod.bind(this);
        this.bindMethod();
    }

    bindMethod() {
        this.setAppKey = this.setAppKey.bind(this);
        this.hasAppkey = this.hasAppKey.bind(this);
        this.getEncryptedAccountIdFromName = this.getEncryptedAccountIdFromName.bind(this);
        this.getMatchListFromAccountId = this.getMatchListFromAccountId.bind(this);
        this.getMatchByMatchID = this.getMatchByMatchID.bind(this);
        this.verifyBody = this.verifyBody.bind(this);
    }

    setAppKey(app_key = null) {
        if(app_key === null) {
            console.error("app_key를 입력하세요");
            return;
        }
        this.app_key = app_key;
    }

    hasAppKey() {
        return this.appkey !== null;
    }

    verifyBody(body) {
        if(typeof body.status === 'undefined') return true;
        
        let { message, status_code } = body.status;
        console.error(status_code, message);
        return false;
    }

    async getEncryptedAccountIdFromName(summonerName) {
        if(!this.hasAppkey()) return;
        let uri = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}?api_key=${this.app_key}`;
        let response = await fetch(uri);
        let body = await response.json();

        if(!this.verifyBody(body)) return;
        
        return body.accountId;
    }

    async getMatchListFromAccountId(accountId, page=5, queue = null) {
        if(!this.hasAppkey()) return;
        let uri = `https://kr.api.riotgames.com/lol/match/v4/matchlists/by-account/${accountId}?api_key=${this.app_key}${queue !== null ? `&queue=${queue}` : ''}`
        let data = [];
        // let beginIndex = 0;
        // let lastIndex = 0;
        // let response = await fetch(`${uri}&beginIndex=${beginIndex}&endIndex=${}`);
        // let body = await response.json();

        // if(!this.verifyBody(body)) return;

        // var { matches } = body;
        // matches.map(({ gameId, champion }) => data.push({ gameId, champion }));
        let dataSize = 100;
        let index = 0;
        let totalGames = 0;

        do {        
            let response = await fetch(`${uri}&beginIndex=${index}&endIndex=${index+dataSize}`);
            let body = await response.json();
            
            if(!this.verifyBody(body)) break;

            var { matches } = body;
            index = body.endIndex;

            if(totalGames === 0) totalGames = body.totalGames;

            // totalGames = body.totalGames >= dataSize ? dataSize : body.totalGames;
            console.log(`${Math.floor((index / totalGames) * 100)}% / 100%`);
            matches.map(({ gameId, champion }) => data.push({ gameId, champion }));
        } while (index != totalGames);
        
        return data;
    }

    async getMatchByMatchID(matchId) {
        if(!this.hasAppKey()) return;
        let uri = `https://kr.api.riotgames.com/lol/match/v4/matches/${matchId}?api_key=${this.app_key}`
        let response = await fetch(uri);
        let body = await response.json();

        if(!this.verifyBody(body)) return;
        return body;
    }
}

module.exports = LeagueOfLegendsAPI;