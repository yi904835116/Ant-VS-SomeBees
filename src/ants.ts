import { AntColony, Place } from './game';
import chalk = require('chalk');






/**
 * An skeleton of insects with different properties: name, armor, place and act.
 */
export abstract class Insect {
  readonly name: string;

  constructor(protected armor: number, protected place: Place) { }

  getName(): string { return this.name; }
  getArmor(): number { return this.armor; }
  getPlace() { return this.place; }
  setPlace(place: Place) { this.place = place; }

  /**
  * reduces the armor of the insect.
  * @param amount is the number of armor strength that should be deducted.
  * @returns true if this ant is out of armor or false if the insect still exists.
  */
  reduceArmor(amount: number): boolean {
    this.armor -= amount;
    if (this.armor <= 0) {
      console.log(this.toString() + ' ran out of armor and expired');
      this.place.removeInsect(this);
      return true;
    }
    return false;
  }

  /**
  * this abstract function represents an action of current insect.
  * @param colony if exists is the current ant colony.
  */
  abstract act(colony?: AntColony): void;

  /**
   * @returns a string includes the information of an insect including its name and current place if exists.
   */
  toString(): string {
    return this.name + '(' + (this.place ? this.place.name : '') + ')';
  }
}

/**
 * A Bee Objext which extends Insect Object
 */
export class Bee extends Insect {
  readonly name: string = 'Bee';
  private status: string;

  /**
   * @param damage is the this bee will cause to others.
   * @param armor is the current existing armor of the insect.
   * @param place is the current place if exists.
   */
  constructor(armor: number, private damage: number, place?: Place) {
    super(armor, place);
  }

  /**
   * @param ant is an Ant Object.
   * @returns true if this ant is dead, return false if it still exists.
   */
  sting(ant: Ant): boolean {
    console.log(this + ' stings ' + ant + '!');
    return ant.reduceArmor(this.damage);
  }

  /**
   * checks if this place is occupied by a ant
   * @returns true if ant exists, false otherwise.
   */
  isBlocked(): boolean {
    return this.place.getAnt() !== undefined;
  }

  setStatus(status: string) { this.status = status; }

  /**
   * Defines a particular action of a this bee whether it attacks or not. 
   */
  act() {
    // if there exists an ant.
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

/**
 * A Ant Object that defines different types of ant and extends Insect class
 */
export abstract class Ant extends Insect {
  protected boost: string;
  protected guard: GuardAnt;

  constructor(armor: number, private foodCost: number = 0, place?: Place) {
    super(armor, place);
  }

  getGuard(): GuardAnt {
    return this.guard;
  }

  setGuard(guard: GuardAnt): void {
    this.guard = guard;
  }

  /**
   * @returns the number of food it costs to deploy this ant
   */
  getFoodCost(): number { return this.foodCost; }

  /**
   * @param boost is the given type of boost to this ant
   */
  setBoost(boost: string) {
    this.boost = boost;
    console.log(this.toString() + ' is given a ' + boost);
  }
}

/**
 * defines a Grower ant with 1 armor and 1 food consumption
 */
export class GrowerAnt extends Ant {
  readonly name: string = "Grower";
  constructor() {
    super(1, 1)
  }

  /**
   * @param colony This is the current ant's colony.
   * defines the action of Grower ant: 
   * randomly generate a single food or booster based on the following probability:
   *  produces food if the number between 0 - 0.6,
   *  produces FlyingLeaf if the number between 0.6 - 0.7,
   *  produces StickyLeaf if the number between 0.7 - 0.8, 
   *  produces IcyLeaf if the number between 0.8 - 0.9, 
   *  else produce BugSpray
   */
  act(colony: AntColony) {
    generateBoost(colony);
  }
}

/**
 * defines a Thrower ant with 1 armor and 4 food consumption and 1 attack damage.
 */
export class ThrowerAnt extends Ant {
  readonly name: string = "Thrower";
  private damage: number = 1;

  constructor() {
    super(1, 4);
  }

  getDamage(): number {
    return this.damage;
  }

  /**
   * defines the action of theThrower ant to attack the bee based on different boosts.
   */
  act() {
    // boostFunction(this, this.boost, this.place, this.damage);
    attackAction(this, this.boost, this.place,this.damage);
  }
}

/**
 * defines a Eater ant with 2 armor, 4 food consumption and ability to eat the bee.
 */
export class EaterAnt extends Ant {
  private hungry: number = 0;
  private digest1: number = 1;
  private digest2: number = 2;
  private digest3: number = 3;
  private digested: number = 4;

  private current: number;

  readonly name: string = "Eater";
  private stomach: Place = new Place('stomach');
  constructor() {
    super(2, 4)
    this.current = this.hungry;
  }

  isFull(): boolean {
    return this.stomach.getBees().length > 0;
  }

  /**
   * defines the action of Eater ant that swallows a bee and takes 3 turns to digest it.
   */
  act() {
    console.log("eating: " + this.current);
    if (this.current == this.hungry) {
      // able to swallow a bee.
      console.log("try to eat");
      let target = this.place.getClosestBee(0);
      if (target) {
        console.log(this + ' eats ' + target + '!');
        this.place.removeBee(target);
        this.stomach.addBee(target);
        this.current = this.digest1;
      }
    } else if (this.current == this.digest1) {
      this.current = this.digest2;
    } else if (this.current == this.digest2) {
      this.current = this.digest3;
    } else if (this.current == this.digest3) {
      this.current = this.digested;
    } else {
      this.stomach.removeBee(this.stomach.getBees()[0]);
      this.current = this.hungry;
    }
  }

  /**
   * defines the situation when Eater is digesting an bee and is about to under an attack.
   * @returns true if it is still alive, false otherwise.
   */
  reduceArmor(amount: number): boolean {
    this.armor -= amount;
    console.log('armor reduced to: ' + this.armor);
    // if the Eater's armor is still large than 0, alive.
    if (this.current = this.hungry) {
      return false;
    } else if (this.current == this.digest1) {
      let eaten = this.stomach.getBees()[0];
      this.stomach.removeBee(eaten);
      this.place.addBee(eaten);
      console.log(this + ' coughs up ' + eaten + '!');
      if (this.armor > 0) {
        this.current = this.digest3;
        return false;
      } else {
        return super.reduceArmor(amount);
      }
    } else if (this.current == this.digest2) {
      if (this.armor <= 0) {
        let eaten = this.stomach.getBees()[0];
        this.stomach.removeBee(eaten);
        this.place.addBee(eaten);
        console.log(this + ' coughs up ' + eaten + '!');
        return super.reduceArmor(amount);
      }
      return false;
    } else if (this.current == this.digest3) {
      return false;
    } else {
      return false;
    }
  }
}

/**
 * defines a Scuba ant with 1 armor, 4 food consumption, 1 damage attack and ability to stay in the water.
 */
export class ScubaAnt extends Ant {
  readonly name: string = "Scuba";
  private damage: number = 1;


  constructor() {
    super(1, 5)
  }

  getDamage(): number {
    return this.damage;
  }

  // defines the action of Scuba ant and applies the boost if any.
  act() {
    attackAction(this, this.boost, this.place,this.damage);
  }
}

/**
 * defines a Guard ant with 2 armor, 4 food consumption.
 */
export class GuardAnt extends Ant {
  readonly name: string = "Guard";
  private guarded: Ant;

  constructor() {
    super(2, 4)
  }


  setGuaredAnt(ant: Ant): void {
    this.guarded = ant;
  }

  /**
   * @returns the current Guard ant in that place.
   */
  getGuarded(): Ant {
    console.log("In GuardAnt return protected");
    return this.guarded;
    // return this.place.getGuardedAnt();
  }
  /**
   * defines the action of Guard ant.
   * the Guard ant doesn't have any specific action.
   */
  act() { }
}

function attackAction(ant: Ant, boost: String, place: Place,damage:number) {
  if (boost == "FlyingLeaf") {
    let boostAdding: BoostSetter = new FlyingLeafSetter();
    boostAdding.act(place, ant,damage);
  } else if (boost == "StickyLeaf") {
    let boostAdding: BoostSetter = new StickyLeafSetter();
    boostAdding.act(place, ant,damage);
  } else if (boost == "IcyLeaf") {
    let boostAdding: BoostSetter = new IcyLeafSetter();
    boostAdding.act(place, ant,damage);
  } else if (boost == "BugSpray") {
    let boostAdding: BoostSetter = new BugSpraySetter();
    boostAdding.act(place, ant,damage);
  } else {
    let boostAdding: BoostSetter = new NonBoostSetter();
    boostAdding.act(place, ant,damage);
  }
  ant.setBoost(undefined);
}

interface GenerateBoost {
  (colony: AntColony): void;
}

let generateBoost: GenerateBoost = function (colony: AntColony) {
  let roll = Math.random();
  if (roll < 0.6) {
    colony.increaseFood(1);
  } else if (roll < 0.7) {
    colony.addBoost('FlyingLeaf');
  } else if (roll < 0.8) {
    colony.addBoost('StickyLeaf');
  } else if (roll < 0.9) {
    colony.addBoost('IcyLeaf');
  } else if (roll < 0.95) {
    colony.addBoost('BugSpray');
  }
}

interface BoostSetter {
  act(place: Place, ant: Ant,damage:number);
}

class NonBoostSetter implements BoostSetter {
  act(place: Place, ant: Ant,damage:number) {
    let target = place.getClosestBee(3);
    if(target){
    console.log(ant + ' throws a leaf at ' + target);
    target.reduceArmor(damage);
    }
  }
}

class BugSpraySetter implements BoostSetter {
  act(place: Place, ant: Ant, damage:number) {
    console.log(ant + ' sprays bug repellant everywhere!');
    let target = place.getClosestBee(0);
    while (target) {
      target.reduceArmor(10);
      target = place.getClosestBee(0);
    }
    ant.reduceArmor(10);
  }
}

class FlyingLeafSetter implements BoostSetter {
  act(place: Place, ant: Ant, damage:number) {
    let target = place.getClosestBee(5);
    if (target) {
      console.log(ant + ' throws a leaf at ' + target);
      target.reduceArmor(damage);
    }
  }
}

class StickyLeafSetter implements BoostSetter {
  act(place: Place, ant: Ant,damage:number) {
    let target = place.getClosestBee(3);
    if (target) {
      console.log(ant + ' throws a leaf at ' + target);
      target.reduceArmor(damage);
      target.setStatus('stuck');
      console.log(target + ' is stuck!');
    }
  }
}

class IcyLeafSetter implements BoostSetter {
  act(place: Place, ant: Ant,damage:number) {
    let target = place.getClosestBee(3);
    if (target) {
      console.log(ant + ' throws a leaf at ' + target);
      target.reduceArmor(damage);
      // applies IcyLeaf boost on this Scuba ant.
      target.setStatus('cold');
      console.log(target + ' is cold!');
    }
  }
}

export interface Factory {
  createAntObject(type: string): Ant;
  createAntSymbol(ant: Ant): String;
}

export class AntFactory implements Factory {
  createAntObject(type: string) {
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

  createAntSymbol(ant: Ant): String {
    if (ant.name == "Grower") {
      return chalk.green('G');
    } else if (ant.name == "Thrower") {
      return chalk.red('T');;
    } else if (ant.name == "Eater") {
      if ((<EaterAnt>ant).isFull())
        return chalk.yellow.bgMagenta('E');
      else {
        return chalk.magenta('E');
      }
    }
    else if (ant.name == "Scuba") {
      return chalk.cyan('S');
    } else if (ant.name == "Guard") {
      console.log("createAntSymbol Guard");
      let guarded: Ant = (<GuardAnt>ant).getGuarded();

      if (guarded != undefined) {
        console.log("createAntSymbol Guard undefined");
        return chalk.underline(new AntFactory().createAntSymbol(guarded));
      } else {
        console.log("createAntSymbol Guard !undefined");
        return chalk.underline('x');
      }
    }
  }
}

