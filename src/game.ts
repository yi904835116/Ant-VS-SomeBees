import { Insect, Bee, Ant, GrowerAnt, ThrowerAnt, EaterAnt, ScubaAnt, GuardAnt } from './ants';


/**
 * This class do the major calculation of movement or types of ant and bee, and judge the geolocation
 */
class Place {
  protected ant: Ant;
  protected guard: GuardAnt;
  protected bees: Bee[] = [];

  constructor(readonly name: string,
    protected readonly water = false,
    private exit?: Place,
    private entrance?: Place) { }

  getExit(): Place { return this.exit; }

  setEntrance(place: Place) { this.entrance = place; }

  isWater(): boolean { return this.water; }

  /**
   * @returns returns current guard if exist otherwise ant.
   */
  getAnt(): Ant {
    if (this.guard)
      return this.guard;
    else
      return this.ant;
  }

  getGuardedAnt(): Ant {
    return this.ant;
  }

  getBees(): Bee[] { return this.bees; }


  /**
   * This method gets the closest bee object.
   * @param maxDistance  give the maxium distance which is a number.
   * @param maxDistance  give the munimum distance which is a number.
   * @returns  return a bee object.
   */
  getClosestBee(maxDistance: number, minDistance: number = 0): Bee {
    let p: Place = this;
    // try to determine the bees in the closest until it reaches minimum distance.
    for (let dist = 0; p !== undefined && dist <= maxDistance; dist++) {
      if (dist >= minDistance && p.bees.length > 0) {
        return p.bees[0];
      }
      p = p.entrance;
    }
    return undefined;
  }


  /**
   * this method adds a ant object into the system.
   * @param ant is a given ant object.
   * @returns returns whether this place has successfully been set.
   */
  addAnt(ant: Ant): boolean {
    // places guard ant if it exists.
    if (ant instanceof GuardAnt) {
      if (this.guard === undefined) {
        this.guard = ant;
        this.guard.setPlace(this);
        return true;
      }
    }
    // places ant if exits.
    else
      if (this.ant === undefined) {
        this.ant = ant;
        this.ant.setPlace(this);
        return true;
      }
    return false;
  }


  /**
   * this method removes current ant object in the system.
   * @returns returns current ant object. If it is a guard, returns guard.
   */
  removeAnt(): Ant {
    if (this.guard !== undefined) {
      let guard = this.guard;
      this.guard = undefined;
      return guard;
    }
    else {
      let ant = this.ant;
      this.ant = undefined;
      return ant;
    }
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

  /**
   * this method excutes the removeAnt method if this is a water and if guard exists or current ant is not a Scuba Ant.
   */
  act() { 
    if (this.water) {
      if (this.guard) {
        this.removeAnt();
      }
      if (!(this.ant instanceof ScubaAnt)) {
        this.removeAnt();
      }
    }
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
        let entrances: Place[] = colony.getEntrances();
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
  private places: Place[][] = [];
  private beeEntrances: Place[] = [];
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

    let prev: Place;
    for (let tunnel = 0; tunnel < numTunnels; tunnel++) {
      let curr: Place = this.queenPlace;
      this.places[tunnel] = [];
      for (let step = 0; step < tunnelLength; step++) {
        let typeName = 'tunnel';
        if (moatFrequency !== 0 && (step + 1) % moatFrequency === 0) {
          typeName = 'water';
        }

        prev = curr;
        let locationId: string = tunnel + ',' + step;
        curr = new Place(typeName + '[' + locationId + ']', typeName == 'water', prev);
        prev.setEntrance(curr);
        this.places[tunnel][step] = curr;
      }
      this.beeEntrances.push(curr);
    }
  }

  getFood(): number { return this.food; }

  increaseFood(amount: number): void { this.food += amount; }

  getPlaces(): Place[][] { return this.places; }

  getEntrances(): Place[] { return this.beeEntrances; }

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
  deployAnt(ant: Ant, place: Place): string {
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

  removeAnt(place: Place) {
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
  antsAct() {
    // tell every single ant to act based on different types
    this.getAllAnts().forEach((ant) => {
      // if this is a guard ant
      if (ant instanceof GuardAnt) {
        let guarded = ant.getGuarded();
        if (guarded)
          guarded.act(this);
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
    // define the type of this ant
    switch (antType.toLowerCase()) {
      case "grower":
        ant = new GrowerAnt(); break;
      case "thrower":
        ant = new ThrowerAnt(); break;
      case "eater":
        ant = new EaterAnt(); break;
      case "scuba":
        ant = new ScubaAnt(); break;
      case "guard":
        ant = new GuardAnt(); break;
      default:
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

  getPlaces(): Place[][] { return this.colony.getPlaces(); }
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