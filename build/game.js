"use strict";
const ants_1 = require("./ants");
const ants_2 = require("./ants");
class PlaceParent {
}
exports.PlaceParent = PlaceParent;
class Place extends PlaceParent {
    constructor(name, exit, entrance) {
        super();
        this.name = name;
        this.exit = exit;
        this.entrance = entrance;
        this.bees = [];
    }
    getExit() { return this.exit; }
    setEntrance(place) { this.entrance = place; }
    getName() {
        return this.name;
    }
    getAnt() {
        if (this.ant != undefined && this.ant.getGuard() != undefined)
            return this.ant.getGuard();
        else
            return this.ant;
    }
    getBees() { return this.bees; }
    getEntrance() {
        return this.entrance;
    }
    getClosestBee(maxDistance, minDistance = 0) {
        let p = this;
        for (let dist = 0; p !== undefined && dist <= maxDistance; dist++) {
            if (dist >= minDistance && p.getBees().length > 0) {
                return p.getBees[0];
            }
            p = p.getEntrance();
        }
        return undefined;
    }
    addAnt(ant) {
        if (this.ant == undefined) {
            this.ant = ant;
            this.ant.setPlace(this);
            console.log("in addAnt, undefined before");
            return true;
        }
        if (ant instanceof ants_1.GuardAnt &&
            !(this.ant instanceof ants_1.GuardAnt) && this.ant.getGuard() == undefined) {
            console.log("in addAnt, add guard to current this ant");
            this.ant.setGuard(ant);
            this.ant.getGuard().setGuaredAnt(this.ant);
            return true;
        }
        return false;
    }
    removeAnt() {
        if (this.ant !== undefined) {
            if (this.ant.getGuard() != undefined) {
                let temp = this.ant.getGuard();
                this.ant.setGuard(undefined);
                return temp;
            }
            else {
                let result = this.ant;
                this.ant = undefined;
                return this.ant;
            }
        }
        return undefined;
    }
    addBee(bee) {
        this.bees.push(bee);
        bee.setPlace(this);
    }
    removeBee(bee) {
        var index = this.bees.indexOf(bee);
        if (index >= 0) {
            this.bees.splice(index, 1);
            bee.setPlace(undefined);
        }
    }
    removeAllBees() {
        this.bees.forEach((bee) => bee.setPlace(undefined));
        this.bees = [];
    }
    exitBee(bee) {
        this.removeBee(bee);
        this.exit.addBee(bee);
    }
    removeInsect(insect) {
        if (insect instanceof ants_1.Ant) {
            this.removeAnt();
        }
        else if (insect instanceof ants_1.Bee) {
            this.removeBee(insect);
        }
    }
    act() { }
}
exports.Place = Place;
class PlaceDecorator extends PlaceParent {
    constructor(decorated) {
        super();
        this.decorated = decorated;
    }
}
class WaterDecorator extends PlaceDecorator {
    getAnt() {
        return this.decorated.getAnt();
    }
    getBees() {
        return this.decorated.getBees();
    }
    addBee(bee) {
        this.decorated.addBee(bee);
    }
    setEntrance(curr) {
        this.decorated.setEntrance(curr);
    }
    getEntrance() {
        return this.decorated.getEntrance();
    }
    exitBee(bee) {
        this.decorated.exitBee(bee);
    }
    getClosestBee(max, min = 0) {
        return this.decorated.getClosestBee(max, min);
    }
    removeBee(bee) {
        this.decorated.removeBee(bee);
    }
    getName() {
        return this.decorated.getName();
    }
    getExit() {
        return this.decorated.getExit();
    }
    removeInsect(insect) {
        this.decorated.removeInsect(insect);
    }
    addAnt(ant) {
        return this.decorated.addAnt(ant);
    }
    removeAnt() {
        return this.decorated.removeAnt();
    }
    act() {
        if (!(this.decorated.getAnt() instanceof ants_1.ScubaAnt))
            this.decorated.removeAnt();
    }
}
exports.WaterDecorator = WaterDecorator;
class Hive extends Place {
    constructor(beeArmor, beeDamage) {
        super('Hive');
        this.beeArmor = beeArmor;
        this.beeDamage = beeDamage;
        this.waves = {};
    }
    addWave(attackTurn, numBees) {
        let wave = [];
        for (let i = 0; i < numBees; i++) {
            let bee = new ants_1.Bee(this.beeArmor, this.beeDamage, this);
            this.addBee(bee);
            wave.push(bee);
        }
        this.waves[attackTurn] = wave;
        return this;
    }
    invade(colony, currentTurn) {
        if (this.waves[currentTurn] !== undefined) {
            this.waves[currentTurn].forEach((bee) => {
                this.removeBee(bee);
                let entrances = colony.getEntrances();
                let randEntrance = Math.floor(Math.random() * entrances.length);
                entrances[randEntrance].addBee(bee);
            });
            return this.waves[currentTurn];
        }
        else {
            return [];
        }
    }
}
exports.Hive = Hive;
class AntColony {
    constructor(startingFood, numTunnels, tunnelLength, moatFrequency = 0) {
        this.places = [];
        this.beeEntrances = [];
        this.queenPlace = new Place('Ant Queen');
        this.boosts = { 'FlyingLeaf': 1, 'StickyLeaf': 1, 'IcyLeaf': 1, 'BugSpray': 0 };
        this.food = startingFood;
        let prev;
        for (let tunnel = 0; tunnel < numTunnels; tunnel++) {
            let curr = this.queenPlace;
            this.places[tunnel] = [];
            for (let step = 0; step < tunnelLength; step++) {
                let typeName = 'tunnel';
                prev = curr;
                let locationId = tunnel + ',' + step;
                if (moatFrequency !== 0 && (step + 1) % moatFrequency === 0) {
                    curr = new WaterDecorator(new Place(typeName + '[' + locationId + ']', prev));
                }
                else
                    curr = new Place(typeName + '[' + locationId + ']', prev);
                prev.setEntrance(curr);
                this.places[tunnel][step] = curr;
            }
            this.beeEntrances.push(curr);
        }
    }
    getFood() { return this.food; }
    increaseFood(amount) { this.food += amount; }
    getPlaces() { return this.places; }
    getEntrances() { return this.beeEntrances; }
    getQueenPlace() { return this.queenPlace; }
    queenHasBees() { return this.queenPlace.getBees().length > 0; }
    getBoosts() { return this.boosts; }
    addBoost(boost) {
        if (this.boosts[boost] === undefined) {
            this.boosts[boost] = 0;
        }
        this.boosts[boost] = this.boosts[boost] + 1;
        console.log('Found a ' + boost + '!');
    }
    deployAnt(ant, place) {
        if (this.food >= ant.getFoodCost()) {
            let success = place.addAnt(ant);
            if (success) {
                this.food -= ant.getFoodCost();
                return undefined;
            }
            return 'tunnel already occupied';
        }
        return 'not enough food';
    }
    removeAnt(place) {
        place.removeAnt();
    }
    applyBoost(boost, place) {
        if (this.boosts[boost] === undefined || this.boosts[boost] < 1) {
            return 'no such boost';
        }
        let ant = place.getAnt();
        if (!ant) {
            return 'no Ant at location';
        }
        ant.setBoost(boost);
        return undefined;
    }
    antsAct() {
        this.getAllAnts().forEach((ant) => {
            if (ant instanceof ants_1.GuardAnt) {
                let guarded = ant.getGuarded();
            }
            ant.act(this);
        });
    }
    beesAct() {
        this.getAllBees().forEach((bee) => {
            bee.act();
        });
    }
    placesAct() {
        for (let i = 0; i < this.places.length; i++) {
            for (let j = 0; j < this.places[i].length; j++) {
                this.places[i][j].act();
            }
        }
    }
    getAllAnts() {
        let ants = [];
        for (let i = 0; i < this.places.length; i++) {
            for (let j = 0; j < this.places[i].length; j++) {
                if (this.places[i][j].getAnt() !== undefined) {
                    ants.push(this.places[i][j].getAnt());
                }
            }
        }
        return ants;
    }
    getAllBees() {
        var bees = [];
        for (var i = 0; i < this.places.length; i++) {
            for (var j = 0; j < this.places[i].length; j++) {
                bees = bees.concat(this.places[i][j].getBees());
            }
        }
        return bees;
    }
}
exports.AntColony = AntColony;
class AntGame {
    constructor(colony, hive) {
        this.colony = colony;
        this.hive = hive;
        this.turn = 0;
    }
    takeTurn() {
        console.log('');
        this.colony.antsAct();
        this.colony.beesAct();
        this.colony.placesAct();
        this.hive.invade(this.colony, this.turn);
        this.turn++;
        console.log('');
    }
    getTurn() { return this.turn; }
    gameIsWon() {
        if (this.colony.queenHasBees()) {
            return false;
        }
        else if (this.colony.getAllBees().length + this.hive.getBees().length === 0) {
            return true;
        }
        return undefined;
    }
    deployAnt(antType, placeCoordinates) {
        let ant;
        var factory = new ants_2.AntFactory();
        if (factory.createAntObject(antType) != null) {
            ant = factory.createAntObject(antType);
        }
        else {
            return 'unknown ant type';
        }
        try {
            let coords = placeCoordinates.split(',');
            let place = this.colony.getPlaces()[coords[0]][coords[1]];
            return this.colony.deployAnt(ant, place);
        }
        catch (e) {
            return 'illegal location';
        }
    }
    removeAnt(placeCoordinates) {
        try {
            let coords = placeCoordinates.split(',');
            let place = this.colony.getPlaces()[coords[0]][coords[1]];
            place.removeAnt();
            return undefined;
        }
        catch (e) {
            return 'illegal location';
        }
    }
    boostAnt(boostType, placeCoordinates) {
        try {
            let coords = placeCoordinates.split(',');
            let place = this.colony.getPlaces()[coords[0]][coords[1]];
            return this.colony.applyBoost(boostType, place);
        }
        catch (e) {
            return 'illegal location';
        }
    }
    getPlaces() { return this.colony.getPlaces(); }
    getFood() { return this.colony.getFood(); }
    getHiveBeesCount() { return this.hive.getBees().length; }
    getBoostNames() {
        let boosts = this.colony.getBoosts();
        return Object.keys(boosts).filter((boost) => {
            return boosts[boost] > 0;
        });
    }
}
exports.AntGame = AntGame;
//# sourceMappingURL=game.js.map