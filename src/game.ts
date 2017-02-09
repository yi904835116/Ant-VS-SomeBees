import { Insect, Bee, Ant, GrowerAnt, ThrowerAnt, EaterAnt, ScubaAnt, GuardAnt } from './ants';
import { Factory, AntFactory } from './ants';


export abstract class PlaceParent {
  abstract act();
  abstract getName();
  abstract getAnt();  
  abstract addBee(bee);
  abstract getEntrance();
  abstract addAnt(an);
  abstract getExit();
  abstract setEntrance(curr: PlaceParent);
  abstract getBees();
  abstract exitBee(bee: Bee);
  abstract removeInsect(insect: Insect);
  abstract getClosestBee(max, min?): Bee;
  abstract removeBee(bee);
  abstract removeAnt();
}

/**
 * This class does the major calculation of movement or types of ant and bee, and judges the geolocation
 */
class Place extends PlaceParent{
  protected ant: Ant;
  protected bees: Bee[] = [];

  constructor(readonly name: string,
    private exit?: PlaceParent,
    private entrance?: PlaceParent) {
      super();
    }

  getExit(): PlaceParent { return this.exit; }

  setEntrance(place: Place) { this.entrance = place; }



  getName() {
    return this.name;
  }
  getAnt(): Ant {
    if (this.ant != undefined && this.ant.getGuard() != undefined)
      return this.ant.getGuard();
    else
      return this.ant;
  }

  getBees(): Bee[] { return this.bees; }


  getEntrance() {
    return this.entrance;
  }

  /**
   * This method gets the closest bee object.
   * @param maxDistance  give the maxium distance which is a number.
   * @param maxDistance  give the munimum distance which is a number.
   * @returns  return a bee object.
   */
  getClosestBee(maxDistance: number, minDistance: number = 0): Bee {
    let p: PlaceParent = this;
    // try to determine the bees in the closest until it reaches minimum distance.
    for (let dist = 0; p !== undefined && dist <= maxDistance; dist++) {
      if (dist >= minDistance && p.getBees().length > 0) {
        return p.getBees[0];
      }
      p = p.getEntrance();
    }
    return undefined;
  }

  /**
   * this method adds a ant object into the system.
   * @param ant is a given ant object.
   * @returns returns whether this place has successfully been set.
   */
  addAnt(ant: Ant): boolean {
    // places guard ant if it exists
    if (this.ant == undefined) {
      this.ant = ant;
      this.ant.setPlace(this);
      console.log("in addAnt, undefined before");
      return true;
    }
    if (ant instanceof GuardAnt &&
      !(this.ant instanceof GuardAnt) && this.ant.getGuard() == undefined) {
      console.log("in addAnt, add guard to current this ant");
      this.ant.setGuard(ant); // 保护的蚂蚁加个guard
      this.ant.getGuard().setGuaredAnt(this.ant);
      // this.ant = ant;
      return true;
    }
    return false;
  }

  /**
   * this method removes current ant object in the system.
   * @returns returns current ant object. If it is a guard, returns guard.
   */
  removeAnt(): Ant {
    if (this.ant !== undefined) {
      if (this.ant.getGuard() != undefined) {
        let temp: GuardAnt = this.ant.getGuard();
        this.ant.setGuard(undefined);
        return temp;
      } else {
        let result = this.ant;
        this.ant = undefined;
        return this.ant;
      }
    }
    return undefined;
  }

  addBee(bee: Bee): void {
    this.bees.push(bee);
    bee.setPlace(this);
  }

  removeBee(bee: Bee): void {
    var index = this.bees.indexOf(bee);
    if (index >= 0) {
      this.bees.splice(index, 1);
      bee.setPlace(undefined);
    }
  }

  removeAllBees(): void {
    this.bees.forEach((bee) => bee.setPlace(undefined));
    this.bees = [];
  }

  exitBee(bee: Bee): void {
    this.removeBee(bee);
    this.exit.addBee(bee);
  }

  removeInsect(insect: Insect) {
    if (insect instanceof Ant) {
      this.removeAnt();
    }
    else if (insect instanceof Bee) {
      this.removeBee(insect);
    }
  }


  act() { }
}

abstract class PlaceDecorator extends PlaceParent {
  protected decorated: Place;

  constructor(decorated: Place) {
    super();
    this.decorated = decorated;
  }
}

export class WaterDecorator extends PlaceDecorator {
  getAnt() {
    return this.decorated.getAnt();
  }

  getBees() {
    return this.decorated.getBees();
  }

  addBee(bee: Bee) {
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

  getClosestBee(max: number, min: number = 0): Bee {
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

  addAnt(ant: Ant): boolean {
    return this.decorated.addAnt(ant);
  }
  removeAnt() {
    return this.decorated.removeAnt();
  }

  act() {
    if (!(this.decorated.getAnt() instanceof ScubaAnt))
      this.decorated.removeAnt();
  }
}


/**
 * This class extends Place and initializes the waves of bee, and able to add wave in this object.
 */
class Hive extends Place {
  private waves: { [index: number]: Bee[] } = {}

  /**
   * Thid constructor initialzes the Hive.
   * @param beeArmor  beeAmor is a number of armor of bee.
  * @param beeDamage  beeAmor is a number of damage of bee.
   */
  constructor(private beeArmor: number, private beeDamage: number) {
    super('Hive');
  }

  /**
   * this method add a wave of bee into the Hive.
   * @param attackTurn  attackTurn is the turn that this wave is going to attack.
   * @param numBees  numBees is the number of bee.
   * @returns returns updated Hive.  
   */
  addWave(attackTurn: number, numBees: number): Hive {
    let wave: Bee[] = [];
    // this loop initialzes each bee in to this wave and add this wave into the array of waves.
    for (let i = 0; i < numBees; i++) {
      let bee = new Bee(this.beeArmor, this.beeDamage, this);
      this.addBee(bee);
      wave.push(bee);
    }
    this.waves[attackTurn] = wave;
    return this;
  }

  /**
   * Comment for method ´doSomething´.
   * @param colony is the given AntColony object.
   * @param currentTurn is the number of current turn.
   * @returns  returns an array of bee.
   */

  invade(colony: AntColony, currentTurn: number): Bee[] {
    // if current wave exists, 
    if (this.waves[currentTurn] !== undefined) {
      this.waves[currentTurn].forEach((bee) => {
        this.removeBee(bee);
        let entrances: PlaceParent[] = colony.getEntrances();
        let randEntrance: number = Math.floor(Math.random() * entrances.length);
        entrances[randEntrance].addBee(bee);
      });
      return this.waves[currentTurn];
    }
    else {
      return [];
    }
  }
}


/**
 * This class initialzes the colony of ant
 */
class AntColony {
  private food: number;
  private places: PlaceParent[][] = [];
  private beeEntrances: PlaceParent[] = [];
  private queenPlace: Place = new Place('Ant Queen');
  private boosts: { [index: string]: number } = { 'FlyingLeaf': 1, 'StickyLeaf': 1, 'IcyLeaf': 1, 'BugSpray': 0 }
  /**
   * This constructor initialzes the the colony.
   * @param startingFood is the number of food at start.
   * @param numTunnels is the number of tunnel.
   * @param tunnelLength is the length of tunnel.
   * @param moatFrequency is occurence of moat.
   */
  constructor(startingFood: number, numTunnels: number, tunnelLength: number, moatFrequency = 0) {
    this.food = startingFood;

    let prev: PlaceParent;
    for (let tunnel = 0; tunnel < numTunnels; tunnel++) {
      let curr: PlaceParent = this.queenPlace;
      this.places[tunnel] = [];
      for (let step = 0; step < tunnelLength; step++) {
        let typeName = 'tunnel';
        prev = curr;
        let locationId: string = tunnel + ',' + step;
        if (moatFrequency !== 0 && (step + 1) % moatFrequency === 0) {
          curr = new WaterDecorator(new Place(typeName + '[' + locationId + ']', prev));
        } else
          curr = new Place(typeName + '[' + locationId + ']', prev);
        prev.setEntrance(curr);
        this.places[tunnel][step] = curr;
      }
      this.beeEntrances.push(curr);
    }
  }

  getFood(): number { return this.food; }

  increaseFood(amount: number): void { this.food += amount; }

  getPlaces(): PlaceParent[][] { return this.places; }

  getEntrances(): PlaceParent[] { return this.beeEntrances; }

  getQueenPlace(): Place { return this.queenPlace; }

  queenHasBees(): boolean { return this.queenPlace.getBees().length > 0; }

  getBoosts(): { [index: string]: number } { return this.boosts; }

  /**
   * adds boost to the ant.
   * @param boost is the type of this boost.
   */
  addBoost(boost: string) {
    if (this.boosts[boost] === undefined) {
      this.boosts[boost] = 0;
    }
    this.boosts[boost] = this.boosts[boost] + 1;
    console.log('Found a ' + boost + '!');
  }

  /**
   * deploys the ant.
   * @param ant is the Ant object.
   * @param place is the Place object
   * @returns a string to tell user whether this deployment is success or not.
   */
  deployAnt(ant: Ant, place: PlaceParent): string {
    // determine whether this ant is affordable
    if (this.food >= ant.getFoodCost()) {
      let success = place.addAnt(ant);
      // consumes the food
      if (success) {
        this.food -= ant.getFoodCost();
        return undefined;
      }
      return 'tunnel already occupied';
    }
    return 'not enough food';
  }

  removeAnt(place: PlaceParent) {
    place.removeAnt();
  }


  /**
   * applys boost on the ant.
   * @param boost is the type of this boost.
   * @param place is the place in the colony.
   * @returns  a string to tell user whether this boost is successfully implemented or not..
   */
  applyBoost(boost: string, place: Place): string {
    if (this.boosts[boost] === undefined || this.boosts[boost] < 1) {
      return 'no such boost';
    }
    let ant: Ant = place.getAnt();
    if (!ant) {
      return 'no Ant at location'
    }
    ant.setBoost(boost);
    return undefined;
  }

  /**
   * applys boost on the ant.
   * @param boost is the type of this boost.
   * @param place is the place in the colony.
   * @returns  a string to tell user whether this boost is successfully implemented or not.
   */
  // !!!!
  antsAct() {
    // tell every single ant to act based on different types
    this.getAllAnts().forEach((ant) => {
      // if this is a guard ant
      if (ant instanceof GuardAnt) {
        let guarded = ant.getGuarded();
      }
      ant.act(this);
    });
  }


  /**
   * define the bee's action.
   */
  beesAct() {
    this.getAllBees().forEach((bee) => {
      bee.act();
    });
  }

  /**
   * defines the action for places.
   */
  placesAct() {
    // go through each single location in the colony.
    for (let i = 0; i < this.places.length; i++) {
      for (let j = 0; j < this.places[i].length; j++) {
        this.places[i][j].act();
      }
    }
  }

  getAllAnts(): Ant[] {
    let ants = [];
    // get ants in each single location.
    for (let i = 0; i < this.places.length; i++) {
      for (let j = 0; j < this.places[i].length; j++) {
        if (this.places[i][j].getAnt() !== undefined) {
          ants.push(this.places[i][j].getAnt());
        }
      }
    }
    return ants;
  }

  getAllBees(): Bee[] {
    var bees = [];
    // get bees in each single location.
    for (var i = 0; i < this.places.length; i++) {
      for (var j = 0; j < this.places[i].length; j++) {
        bees = bees.concat(this.places[i][j].getBees());
      }
    }
    return bees;
  }
}

/**
 * This class defines the rules of this game.
 */
class AntGame {
  private turn: number = 0;
  constructor(private colony: AntColony, private hive: Hive) { }

  /**
   * deploys the actions happened in each round.
   */
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

  /**
   * determine whether do bees take over the base of ant.
   * @returns return true if yes, return false if not or undefined if the game is not over.
   */
  gameIsWon(): boolean | undefined {
    if (this.colony.queenHasBees()) {
      return false;
    }
    else if (this.colony.getAllBees().length + this.hive.getBees().length === 0) {
      return true;
    }
    return undefined;
  }

  /**
   * deploys one type of ant 
   * @param antType is the given type of ant
   * @param placeCoordinates is the geolocation where we deploy the ant.
   * @returns undefined if the game is still going, or the result of this game.
   */
  deployAnt(antType: string, placeCoordinates: string): string {
    let ant;
    var factory: Factory = new AntFactory();
    if (factory.createAntObject(antType) != null) {
      ant = factory.createAntObject(antType)
    } else {
      return 'unknown ant type';
    }
    // deploys the ant or return a warning if the geolocation input is not correct.
    try {
      let coords = placeCoordinates.split(',');
      let place: Place = this.colony.getPlaces()[coords[0]][coords[1]];
      return this.colony.deployAnt(ant, place);
    } catch (e) {
      return 'illegal location';
    }
  }

  /**
   * removes ant from a location
   * @param placeCoordinates is the geolocation 
   */
  removeAnt(placeCoordinates: string): string {
    // removes the ant or warns user if the geolocation is not correct
    try {
      let coords = placeCoordinates.split(',');
      let place: Place = this.colony.getPlaces()[coords[0]][coords[1]];
      place.removeAnt();
      return undefined;
    } catch (e) {
      return 'illegal location';
    }
  }

  /**
   * boosts the ant at the given location
   * @param boostType is the type of the boost
   * @param placeCoordinates is the geolocation
   */
  boostAnt(boostType: string, placeCoordinates: string): string {
    // deploys this boost or warns user if the location is not correct
    try {
      let coords = placeCoordinates.split(',');
      let place: Place = this.colony.getPlaces()[coords[0]][coords[1]];
      return this.colony.applyBoost(boostType, place);
    } catch (e) {
      return 'illegal location';
    }
  }

  getPlaces(): PlaceParent[][] { return this.colony.getPlaces(); }
  getFood(): number { return this.colony.getFood(); }
  getHiveBeesCount(): number { return this.hive.getBees().length; }
  getBoostNames(): string[] {
    let boosts = this.colony.getBoosts();
    return Object.keys(boosts).filter((boost: string) => {
      return boosts[boost] > 0;
    });
  }
}

export { AntGame, Place, Hive, AntColony }