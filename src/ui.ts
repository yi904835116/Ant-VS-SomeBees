import {AntGame, AntColony, Place, Hive} from './game';
import {Ant, EaterAnt, GuardAnt} from './ants';

let vorpal = require('vorpal');
import chalk = require('chalk');
import _ = require('lodash');

/**
 * The Vorpal library for command-line interaction
 */
const Vorpal = vorpal();


/**
 * This method drafts the whole graph and prints it out.
 * @param game is the current ant game.
 */
export function showMapOf(game:AntGame){
  console.log(getMap(game));
}

/**
 * gets the current map
 * @param game is the the current game
 */
function getMap(game:AntGame) {
  let places:Place[][] = game.getPlaces();
  let tunnelLength = places[0].length;
  let beeIcon = chalk.bgYellow.black('B');
   
  let map = '';
  
  // Provides user relative infomation about current situation.
  map += chalk.bold('The Colony is under attack!\n');
  map += `Turn: ${game.getTurn()}, Food: ${game.getFood()}, Boosts available: [${game.getBoostNames()}]\n`;
  map += '     '+_.range(0,tunnelLength).join('    ')+'      Hive'+'\n';
  
  // draws all the tunnels 
  for(let i=0; i<places.length; i++){
    map += '    '+Array(tunnelLength+1).join('=====');
    
    if(i===0){
      map += '    ';
      let hiveBeeCount = game.getHiveBeesCount();
      if(hiveBeeCount > 0){
        map += beeIcon;
        map += (hiveBeeCount > 1 ? hiveBeeCount : ' ');
      }
    }
    map += '\n';

    map += i+')  ';
    
    // draws the component for each tunnel
    for(let j=0; j<places[i].length; j++){ 
      let place:Place = places[i][j];

      map += iconFor(place.getAnt());
      map += ' '; 

      if(place.getBees().length > 0){
        map += beeIcon;
        map += (place.getBees().length > 1 ? place.getBees().length : ' ');
      } else {
        map += '  ';
      }
      map += ' '; 
    }
    map += '\n    ';

    // draw the waters and tunnel sections.
    for(let j=0; j<places[i].length; j++){
      let place = places[i][j];
      if(place.isWater()){
        map += chalk.bgCyan('~~~~')+' ';
      } else {
        map += '==== ';
      }
    }
    map += '\n';
  }
  map += '     '+_.range(0,tunnelLength).join('    ')+'\n';

  return map;
}

/**
 * draws the icon for the ants.
 * @param ant is the given Ant object.
 * @returns the icon of this ant.
 */
function iconFor(ant:Ant){
  if(ant === undefined){ return ' ' };
  let icon:string;
  // determines the type of the ant.
  switch(ant.name){
    case "Grower":
      icon = chalk.green('G'); break;
    case "Thrower":
      icon = chalk.red('T'); break;
    case "Eater":
      if((<EaterAnt>ant).isFull())
        icon = chalk.yellow.bgMagenta('E');
      else
        icon = chalk.magenta('E');
      break;
    case "Scuba":
      icon = chalk.cyan('S'); break;
    case "Guard":
      let guarded:Ant = (<GuardAnt>ant).getGuarded();
      if(guarded){
        icon = chalk.underline(iconFor(guarded)); break;
      } else {
        icon = chalk.underline('x'); break;
      }
    default:
      icon = '?';
  }
  return icon;
}

/**
 * builds up the interactive system fore users.
 * @param game is the current game user plays with.
 */
export function play(game:AntGame) {
  // builds up the console.
  Vorpal
    .delimiter(chalk.green('AvB $'))
    .log(getMap(game))
    .show();

  // builds up the show command.
  Vorpal
    .command('show', 'Shows the current game board.')
    .action(function(args, callback){
      Vorpal.log(getMap(game));
      callback();
    });

  // builds up the deploy command.
  Vorpal
    .command('deploy <antType> <tunnel>', 'Deploys an ant to tunnel (as "row,col" eg. "0,6").')
    .alias('add', 'd')
    .autocomplete(['Grower','Thrower','Eater','Scuba','Guard'])
    .action(function(args, callback) {
      let error = game.deployAnt(args.antType, args.tunnel)
      if(error){
        Vorpal.log(`Invalid deployment: ${error}.`);
      }
      else {
        Vorpal.log(getMap(game));
      }
      callback();
    });

  // builds up the remove command.
  Vorpal
    .command('remove <tunnel>', 'Removes the ant from the tunnel (as "row,col" eg. "0,6").')
    .alias('rm')
    .action(function(args, callback){
      let error = game.removeAnt(args.tunnel);
      if(error){
        Vorpal.log(`Invalid removal: ${error}.`);
      }
      else {
        Vorpal.log(getMap(game));
      }
      callback();
    });

  //builds up the boost command.
  Vorpal
    // builds up the boost notification.
    .command('boost <boost> <tunnel>', 'Applies a boost to the ant in a tunnel (as "row,col" eg. "0,6")')
    .alias('b')
    .autocomplete({data:() => game.getBoostNames()})
    .action(function(args, callback){
      let error = game.boostAnt(args.boost, args.tunnel);
      if(error){
        Vorpal.log(`Invalid boost: ${error}`);
      }
      callback();
    })

  // builds up the turn command.
  Vorpal
    .command('turn', 'Ends the current turn. Ants and bees will act.')
    .alias('end turn', 'take turn','t')
    .action(function(args, callback){
      game.takeTurn();
      Vorpal.log(getMap(game));
      let won:boolean = game.gameIsWon();
      // prints out the user win notification.
      if(won === true){
        Vorpal.log(chalk.green('Yaaaay---\nAll bees are vanquished. You win!\n'));
      }
      // prints out the bees win notification.
      else if(won === false){
        Vorpal.log(chalk.yellow('Bzzzzz---\nThe ant queen has perished! Please try again.\n'));
      }
      // call back to previous command.
      else {
        callback();
      }
    });
}
