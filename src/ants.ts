import { AntColony, Place } from './game';

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
  constructor(armor: number, private foodCost: number = 0, place?: Place) {
    super(armor, place);
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

  /**
   * defines the action of theThrower ant to attack the bee based on different boosts.
   */
  act() {
    if (this.boost !== 'BugSpray') {
      let target;
      // if FlyingLeaf boost is applied, extend the its attacking range to 5. If not, its attack range is 3.
      if (this.boost === 'FlyingLeaf')
        target = this.place.getClosestBee(5);
      else
        target = this.place.getClosestBee(3);

      if (target) {
        console.log(this + ' throws a leaf at ' + target);
        target.reduceArmor(this.damage);
        // deploys StickyLeaf boost to stick a bee.
        if (this.boost === 'StickyLeaf') {
          target.setStatus('stuck');
          console.log(target + ' is stuck!');
        }
        // deploys IcyLeaf boost to freeze a bee.    
        if (this.boost === 'IcyLeaf') {
          target.setStatus('cold');
          console.log(target + ' is cold!');
        }
        // resets the boost.
        this.boost = undefined;
      }
    }

    // if the BugSpray boost is applied, the boost destroy all the insects in that tunnel by 10 armor.
    else {
      console.log(this + ' sprays bug repellant everywhere!');
      let target = this.place.getClosestBee(0);
      while (target) {
        target.reduceArmor(10);
        target = this.place.getClosestBee(0);
      }
      this.reduceArmor(10);
    }
  }
}

/**
 * defines a Eater ant with 2 armor, 4 food consumption and ability to eat the bee.
 */
export class EaterAnt extends Ant {
  readonly name: string = "Eater";
  private turnsEating: number = 0;
  private stomach: Place = new Place('stomach');
  constructor() {
    super(2, 4)
  }

  isFull(): boolean {
    return this.stomach.getBees().length > 0;
  }

  /**
   * defines the action of Eater ant that swallows a bee and takes 3 turns to digest it.
   */
  act() {
    console.log("eating: " + this.turnsEating);
    if (this.turnsEating == 0) {     
      // able to swallow a bee.
      console.log("try to eat");
      let target = this.place.getClosestBee(0);
      if (target) {
        console.log(this + ' eats ' + target + '!');
        this.place.removeBee(target);
        this.stomach.addBee(target);
        this.turnsEating = 1;
      }
    } else {
      if (this.turnsEating > 3) { 
        // after three rounds, Eater finishs digesting a bee and able to swallow the next one.
        this.stomach.removeBee(this.stomach.getBees()[0]);
        this.turnsEating = 0;
      }
      else
        // counting the digesting rounds.
        this.turnsEating++;
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
    if (this.armor > 0) {
      // if it just digests the bee a round, it can't destroy the bee and throw it back.
      if (this.turnsEating == 1) {
        let eaten = this.stomach.getBees()[0];
        this.stomach.removeBee(eaten);
        this.place.addBee(eaten);
        console.log(this + ' coughs up ' + eaten + '!');
        this.turnsEating = 3;
      }
    }
    // if the Eater is dead
    else if (this.armor <= 0) {
      // if the he have a target to digest and less than two rounds, it can't destroy the bee and throw it back.
      if (this.turnsEating > 0 && this.turnsEating <= 2) {
        let eaten = this.stomach.getBees()[0];
        this.stomach.removeBee(eaten);
        this.place.addBee(eaten);
        console.log(this + ' coughs up ' + eaten + '!');
      }
      return super.reduceArmor(amount);
    }
    return false;
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

  // defines the action of Scuba ant and applies the boost if any.
  act() {
    // if the boost is not BugSpray
    if (this.boost !== 'BugSpray') {
      let target;
      if (this.boost === 'FlyingLeaf')
        target = this.place.getClosestBee(5);
      else
        target = this.place.getClosestBee(3);

      // if the Scuba ant have the closest target.
      if (target) {
        console.log(this + ' throws a leaf at ' + target);
        target.reduceArmor(this.damage);

        // applies StickyLeaf boost on this Scuba ant.
        if (this.boost === 'StickyLeaf') {
          target.setStatus('stuck');
          console.log(target + ' is stuck!');
        }
        // applies IcyLeaf boost on this Scuba ant.
        if (this.boost === 'IcyLeaf') {
          target.setStatus('cold');
          console.log(target + ' is cold!');
        }
        this.boost = undefined;
      }
    }
    // applies BugSpray boost on this Scuba ant that kills all of the insects in that tunnel by 10 armor
    else {
      console.log(this + ' sprays bug repellant everywhere!');
      let target = this.place.getClosestBee(0);
      while (target) {
        target.reduceArmor(10);
        target = this.place.getClosestBee(0);
      }
      this.reduceArmor(10);
    }
  }
}

/**
 * defines a Guard ant with 2 armor, 4 food consumption.
 */
export class GuardAnt extends Ant {
  readonly name: string = "Guard";

  constructor() {
    super(2, 4)
  }

  /**
   * @returns the current Guard ant in that place.
   */
  getGuarded(): Ant {
    return this.place.getGuardedAnt();
  }
  /**
   * defines the action of Guard ant.
   * the Guard ant doesn't have any specific action.
   */
  act() { }
}
