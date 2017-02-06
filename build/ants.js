"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var game_1 = require("./game");
var chalk = require("chalk");
var Insect = (function () {
    function Insect(armor, place) {
        this.armor = armor;
        this.place = place;
    }
    Insect.prototype.getName = function () { return this.name; };
    Insect.prototype.getArmor = function () { return this.armor; };
    Insect.prototype.getPlace = function () { return this.place; };
    Insect.prototype.setPlace = function (place) { this.place = place; };
    Insect.prototype.reduceArmor = function (amount) {
        this.armor -= amount;
        if (this.armor <= 0) {
            console.log(this.toString() + ' ran out of armor and expired');
            this.place.removeInsect(this);
            return true;
        }
        return false;
    };
    Insect.prototype.toString = function () {
        return this.name + '(' + (this.place ? this.place.name : '') + ')';
    };
    return Insect;
}());
exports.Insect = Insect;
var Bee = (function (_super) {
    __extends(Bee, _super);
    function Bee(armor, damage, place) {
        var _this = _super.call(this, armor, place) || this;
        _this.damage = damage;
        _this.name = 'Bee';
        return _this;
    }
    Bee.prototype.sting = function (ant) {
        console.log(this + ' stings ' + ant + '!');
        return ant.reduceArmor(this.damage);
    };
    Bee.prototype.isBlocked = function () {
        return this.place.getAnt() !== undefined;
    };
    Bee.prototype.setStatus = function (status) { this.status = status; };
    Bee.prototype.act = function () {
        if (this.isBlocked()) {
            if (this.status !== 'cold') {
                this.sting(this.place.getAnt());
            }
        }
        else if (this.armor > 0) {
            if (this.status !== 'stuck') {
                this.place.exitBee(this);
            }
        }
        this.status = undefined;
    };
    return Bee;
}(Insect));
exports.Bee = Bee;
var Ant = (function (_super) {
    __extends(Ant, _super);
    function Ant(armor, foodCost, place) {
        if (foodCost === void 0) { foodCost = 0; }
        var _this = _super.call(this, armor, place) || this;
        _this.foodCost = foodCost;
        return _this;
    }
    Ant.prototype.getFoodCost = function () { return this.foodCost; };
    Ant.prototype.setBoost = function (boost) {
        this.boost = boost;
        console.log(this.toString() + ' is given a ' + boost);
    };
    return Ant;
}(Insect));
exports.Ant = Ant;
var GrowerAnt = (function (_super) {
    __extends(GrowerAnt, _super);
    function GrowerAnt() {
        var _this = _super.call(this, 1, 1) || this;
        _this.name = "Grower";
        return _this;
    }
    GrowerAnt.prototype.act = function (colony) {
        generateBoost(colony);
    };
    return GrowerAnt;
}(Ant));
exports.GrowerAnt = GrowerAnt;
var ThrowerAnt = (function (_super) {
    __extends(ThrowerAnt, _super);
    function ThrowerAnt() {
        var _this = _super.call(this, 1, 4) || this;
        _this.name = "Thrower";
        _this.damage = 1;
        return _this;
    }
    ThrowerAnt.prototype.act = function () {
        boostFunction(this, this.boost, this.place, this.damage);
    };
    return ThrowerAnt;
}(Ant));
exports.ThrowerAnt = ThrowerAnt;
var EaterAnt = (function (_super) {
    __extends(EaterAnt, _super);
    function EaterAnt() {
        var _this = _super.call(this, 2, 4) || this;
        _this.hungry = 0;
        _this.digest1 = 1;
        _this.digest2 = 2;
        _this.digest3 = 3;
        _this.digested = 4;
        _this.name = "Eater";
        _this.stomach = new game_1.Place('stomach');
        _this.current = _this.hungry;
        return _this;
    }
    EaterAnt.prototype.isFull = function () {
        return this.stomach.getBees().length > 0;
    };
    EaterAnt.prototype.act = function () {
        console.log("eating: " + this.current);
        if (this.current == this.hungry) {
            console.log("try to eat");
            var target = this.place.getClosestBee(0);
            if (target) {
                console.log(this + ' eats ' + target + '!');
                this.place.removeBee(target);
                this.stomach.addBee(target);
                this.current = this.digest1;
            }
        }
        else if (this.current == this.digest1) {
            this.current = this.digest2;
        }
        else if (this.current == this.digest2) {
            this.current = this.digest3;
        }
        else if (this.current == this.digest3) {
            this.current = this.digested;
        }
        else {
            this.stomach.removeBee(this.stomach.getBees()[0]);
            this.current = this.hungry;
        }
    };
    EaterAnt.prototype.reduceArmor = function (amount) {
        this.armor -= amount;
        console.log('armor reduced to: ' + this.armor);
        if (this.current = this.hungry) {
            return false;
        }
        else if (this.current == this.digest1) {
            var eaten = this.stomach.getBees()[0];
            this.stomach.removeBee(eaten);
            this.place.addBee(eaten);
            console.log(this + ' coughs up ' + eaten + '!');
            if (this.armor > 0) {
                this.current = this.digest3;
                return false;
            }
            else {
                return _super.prototype.reduceArmor.call(this, amount);
            }
        }
        else if (this.current == this.digest2) {
            if (this.armor <= 0) {
                var eaten = this.stomach.getBees()[0];
                this.stomach.removeBee(eaten);
                this.place.addBee(eaten);
                console.log(this + ' coughs up ' + eaten + '!');
                return _super.prototype.reduceArmor.call(this, amount);
            }
            return false;
        }
        else if (this.current == this.digest3) {
            return false;
        }
        else {
            return false;
        }
    };
    return EaterAnt;
}(Ant));
exports.EaterAnt = EaterAnt;
var ScubaAnt = (function (_super) {
    __extends(ScubaAnt, _super);
    function ScubaAnt() {
        var _this = _super.call(this, 1, 5) || this;
        _this.name = "Scuba";
        _this.damage = 1;
        return _this;
    }
    ScubaAnt.prototype.act = function () {
        boostFunction(this, this.boost, this.place, this.damage);
    };
    return ScubaAnt;
}(Ant));
exports.ScubaAnt = ScubaAnt;
var GuardAnt = (function (_super) {
    __extends(GuardAnt, _super);
    function GuardAnt() {
        var _this = _super.call(this, 2, 4) || this;
        _this.name = "Guard";
        return _this;
    }
    GuardAnt.prototype.getGuarded = function () {
        return this.place.getGuardedAnt();
    };
    GuardAnt.prototype.act = function () { };
    return GuardAnt;
}(Ant));
exports.GuardAnt = GuardAnt;
var generateBoost = function (colony) {
    var roll = Math.random();
    if (roll < 0.6) {
        colony.increaseFood(1);
    }
    else if (roll < 0.7) {
        colony.addBoost('FlyingLeaf');
    }
    else if (roll < 0.8) {
        colony.addBoost('StickyLeaf');
    }
    else if (roll < 0.9) {
        colony.addBoost('IcyLeaf');
    }
    else if (roll < 0.95) {
        colony.addBoost('BugSpray');
    }
};
var boostFunction = function (ant, boost, place, damage) {
    if (boost !== 'BugSpray') {
        var target = void 0;
        if (boost === 'FlyingLeaf')
            target = place.getClosestBee(5);
        else
            target = place.getClosestBee(3);
        if (target) {
            console.log(ant + ' throws a leaf at ' + target);
            target.reduceArmor(damage);
            if (boost === 'StickyLeaf') {
                target.setStatus('stuck');
                console.log(target + ' is stuck!');
            }
            if (boost === 'IcyLeaf') {
                target.setStatus('cold');
                console.log(target + ' is cold!');
            }
            boost = undefined;
        }
    }
    else {
        console.log(ant + ' sprays bug repellant everywhere!');
        var target = place.getClosestBee(0);
        while (target) {
            target.reduceArmor(10);
            target = place.getClosestBee(0);
        }
        ant.reduceArmor(10);
    }
};
var AntFactory = (function () {
    function AntFactory() {
    }
    AntFactory.prototype.createAntObject = function (type) {
        switch (type.toLowerCase()) {
            case "grower":
                return new GrowerAnt();
            case "thrower":
                return new ThrowerAnt();
            case "eater":
                return new EaterAnt();
            case "scuba":
                return new ScubaAnt();
            case "guard":
                return new GuardAnt();
            default:
                return null;
        }
    };
    AntFactory.prototype.createAntSymbol = function (ant) {
        if (ant.name == "Grower") {
            return chalk.green('G');
        }
        else if (ant.name == "Thrower") {
            return chalk.red('T');
            ;
        }
        else if (ant.name == "Eater") {
            if (ant.isFull())
                return chalk.yellow.bgMagenta('E');
            else {
                return chalk.magenta('E');
            }
        }
        else if (ant.name == "Scuba") {
            return chalk.cyan('S');
        }
        else if (ant.name == "Guard") {
            var guarded = ant.getGuarded();
            if (guarded) {
                return chalk.underline(new AntFactory().createAntSymbol(guarded));
            }
            else {
                return chalk.underline('x');
            }
        }
    };
    return AntFactory;
}());
exports.AntFactory = AntFactory;
//# sourceMappingURL=ants.js.map