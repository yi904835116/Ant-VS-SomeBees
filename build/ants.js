"use strict";
const game_1 = require("./game");
const chalk = require("chalk");
class Insect {
    constructor(armor, place) {
        this.armor = armor;
        this.place = place;
    }
    getName() { return this.name; }
    getArmor() { return this.armor; }
    getPlace() { return this.place; }
    setPlace(place) { this.place = place; }
    reduceArmor(amount) {
        this.armor -= amount;
        if (this.armor <= 0) {
            console.log(this.toString() + ' ran out of armor and expired');
            this.place.removeInsect(this);
            return true;
        }
        return false;
    }
    toString() {
        return this.name + '(' + (this.place ? this.place.name : '') + ')';
    }
}
exports.Insect = Insect;
class Bee extends Insect {
    constructor(armor, damage, place) {
        super(armor, place);
        this.damage = damage;
        this.name = 'Bee';
    }
    sting(ant) {
        console.log(this + ' stings ' + ant + '!');
        return ant.reduceArmor(this.damage);
    }
    isBlocked() {
        return this.place.getAnt() !== undefined;
    }
    setStatus(status) { this.status = status; }
    act() {
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
    }
}
exports.Bee = Bee;
class Ant extends Insect {
    constructor(armor, foodCost = 0, place) {
        super(armor, place);
        this.foodCost = foodCost;
    }
    getGuard() {
        return this.guard;
    }
    setGuard(guard) {
        this.guard = guard;
    }
    getFoodCost() { return this.foodCost; }
    setBoost(boost) {
        this.boost = boost;
        console.log(this.toString() + ' is given a ' + boost);
    }
}
exports.Ant = Ant;
class GrowerAnt extends Ant {
    constructor() {
        super(1, 1);
        this.name = "Grower";
    }
    act(colony) {
        generateBoost(colony);
    }
}
exports.GrowerAnt = GrowerAnt;
class ThrowerAnt extends Ant {
    constructor() {
        super(1, 4);
        this.name = "Thrower";
        this.damage = 1;
    }
    getDamage() {
        return this.damage;
    }
    act() {
        attackAction(this, this.boost, this.place, this.damage);
    }
}
exports.ThrowerAnt = ThrowerAnt;
class EaterAnt extends Ant {
    constructor() {
        super(2, 4);
        this.hungry = 0;
        this.digest1 = 1;
        this.digest2 = 2;
        this.digest3 = 3;
        this.digested = 4;
        this.name = "Eater";
        this.stomach = new game_1.Place('stomach');
        this.current = this.hungry;
    }
    isFull() {
        return this.stomach.getBees().length > 0;
    }
    act() {
        console.log("eating: " + this.current);
        if (this.current == this.hungry) {
            console.log("try to eat");
            let target = this.place.getClosestBee(0);
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
    }
    reduceArmor(amount) {
        this.armor -= amount;
        console.log('armor reduced to: ' + this.armor);
        if (this.current = this.hungry) {
            return false;
        }
        else if (this.current == this.digest1) {
            let eaten = this.stomach.getBees()[0];
            this.stomach.removeBee(eaten);
            this.place.addBee(eaten);
            console.log(this + ' coughs up ' + eaten + '!');
            if (this.armor > 0) {
                this.current = this.digest3;
                return false;
            }
            else {
                return super.reduceArmor(amount);
            }
        }
        else if (this.current == this.digest2) {
            if (this.armor <= 0) {
                let eaten = this.stomach.getBees()[0];
                this.stomach.removeBee(eaten);
                this.place.addBee(eaten);
                console.log(this + ' coughs up ' + eaten + '!');
                return super.reduceArmor(amount);
            }
            return false;
        }
        else if (this.current == this.digest3) {
            return false;
        }
        else {
            return false;
        }
    }
}
exports.EaterAnt = EaterAnt;
class ScubaAnt extends Ant {
    constructor() {
        super(1, 5);
        this.name = "Scuba";
        this.damage = 1;
    }
    getDamage() {
        return this.damage;
    }
    act() {
        attackAction(this, this.boost, this.place, this.damage);
    }
}
exports.ScubaAnt = ScubaAnt;
class GuardAnt extends Ant {
    constructor() {
        super(2, 4);
        this.name = "Guard";
    }
    setGuaredAnt(ant) {
        this.guarded = ant;
    }
    getGuarded() {
        console.log("In GuardAnt return protected");
        return this.guarded;
    }
    act() { }
}
exports.GuardAnt = GuardAnt;
function attackAction(ant, boost, place, damage) {
    if (boost == "FlyingLeaf") {
        let boostAdding = new FlyingLeafSetter();
        boostAdding.act(place, ant, damage);
    }
    else if (boost == "StickyLeaf") {
        let boostAdding = new StickyLeafSetter();
        boostAdding.act(place, ant, damage);
    }
    else if (boost == "IcyLeaf") {
        let boostAdding = new StickyLeafSetter();
        boostAdding.act(place, ant, damage);
    }
    else if (boost == "BugSpray") {
        let boostAdding = new BugSpraySetter();
        boostAdding.act(place, ant, damage);
    }
    else {
        let boostAdding = new NonBoostSetter();
        boostAdding.act(place, ant, damage);
    }
    ant.setBoost(undefined);
}
let generateBoost = function (colony) {
    let roll = Math.random();
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
let boostFunction = function (ant, boost, place, damage) {
    if (boost !== 'BugSpray') {
        let target;
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
        let target = place.getClosestBee(0);
        while (target) {
            target.reduceArmor(10);
            target = place.getClosestBee(0);
        }
        ant.reduceArmor(10);
    }
};
class NonBoostSetter {
    act(place, ant, damage) {
        let target = place.getClosestBee(3);
        if (target) {
            console.log(ant + ' throws a leaf at ' + target);
            target.reduceArmor(damage);
        }
    }
}
class BugSpraySetter {
    act(place, ant, damage) {
        console.log(ant + ' sprays bug repellant everywhere!');
        let target = place.getClosestBee(0);
        while (target) {
            target.reduceArmor(10);
            target = place.getClosestBee(0);
        }
        ant.reduceArmor(10);
    }
}
class FlyingLeafSetter {
    act(place, ant, damage) {
        let target = place.getClosestBee(5);
        if (target) {
            console.log(ant + ' throws a leaf at ' + target);
            target.reduceArmor(damage);
        }
    }
}
class StickyLeafSetter {
    act(place, ant, damage) {
        let target = place.getClosestBee(3);
        if (target) {
            console.log(ant + ' throws a leaf at ' + target);
            target.reduceArmor(damage);
            target.setStatus('stuck');
            console.log(target + ' is stuck!');
        }
    }
}
class IcyLeaf {
    act(place, ant, damage) {
        let target = place.getClosestBee(3);
        if (target) {
            console.log(ant + ' throws a leaf at ' + target);
            target.reduceArmor(damage);
            target.setStatus('cold');
            console.log(target + ' is cold!');
        }
    }
}
class AntFactory {
    createAntObject(type) {
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
    }
    createAntSymbol(ant) {
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
            console.log("createAntSymbol Guard");
            let guarded = ant.getGuarded();
            if (guarded != undefined) {
                console.log("createAntSymbol Guard undefined");
                return chalk.underline(new AntFactory().createAntSymbol(guarded));
            }
            else {
                console.log("createAntSymbol Guard !undefined");
                return chalk.underline('x');
            }
        }
    }
}
exports.AntFactory = AntFactory;
//# sourceMappingURL=ants.js.map