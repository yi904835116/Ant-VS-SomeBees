# Ant-VS-SomeBees
This game is working with a tower defense game called Ants vs. Some Bees (inspired by the PopCap game Plants vs. Zombies). In this game (which is played on the command-line), the player populates an ant colony with the bravest ants they can muster. The ants must protect their queen from the evil bees that invade their territory. Irritate the bees enough by throwing leaves at them, and they will be vanquished. Fail to pester the airborne intruders adequately, and your queen will succumb to the bees' wrath!


The game involves a couple of different parts:

# Ants:
The ant colony is defended by a number of different types of ants (described below). Each type of ant has a special action it can perform: for example, Throwers are able to throw leaves at bees to drive them off, while Growers are able to produce more food that is used to breed ants. Ants have some amount of armor that determines how many stings they can take from the bees before they have to retreat. Ants can also be given special leaves and other resources called boosts that can aid them in their defense.

# Bees:
The bees will fly down the tunnels towards the queen (who lives off to the left). If an ant blocks its path, the bee will stop to sting the ant until the path is clear. More bees arrive in swarms throughout the game, until the Hive where they come from is empty.

# Colony:
The ants live in a colony--a set of tunnels divided into discrete sections. Only one ant can occupy each tunnel section at a time, but there is no limit to have many bees can swarm in! The colony has a stock of food which is used to breed and deploy ants, as well as a collection of special resources called boosts (e.g., specially designed leaves) that can be given to ants. Tunnel sections may have other properties as well: for example, some are filled with water making them impassable to most ants.

On the board, each tunnel section is marked with a separate space. Any ant in that section is marked with a letter (depending on the type of ant), and any bees are represented by a yellow 'B' (with a number indicating if there is more than 1 bee in the section).

# Game Play

A game of Ants vs. Some-Bees is played in turns. Each turn, the player can deploy ants into different spots in the colony (as long as the colony has enough food for that ant). Once the player has finished deploying ants, the turn is over. At the end of the turn, all the insects (ants first, then bees) perform their individual actions: ants throw leaves at bees, and bees sting ants. Then any special environmental effects (e.g., from the tunnels) occur. Finally any new bees arrive from the hive, and the next turn starts.

The game ends either when a bee reaches the ant queen (you lose), or the entire bee flotilla has been vanquished (you win).

Player actions are performed by entering commands at the command-line. The following commands are supported:

deploy <antType> <tunnel> This command deploys a kind of ant to a particular tunnel section (assuming there is enough food!). The antType is the name of the ant's type, such as Thrower or Grower (use the tab key to get an auto-completing list of options). The tunnel is the "row,col" coordinates separated by a comma. For example:

  deploy Thrower 2,3
will create a Thrower ant at the 3rd spot of the 2nd row (right about where the word "these" is in the example above).

remove <tunnel> This command removes the ant from a particular spot (using the same "row,col" syntax as deploy).

boost <boost> <tunnel> This command will give a kind of boosting resource to the ant in a particular tunnel (assuming you have such a boost, and an ant is there!). The boost is the name of the boost type (e.g., FlyingLeaf; use tab to autocomplete for options), and tunnel is the same "row,col" syntax as deploy.

turn This command ends the current turn. All the ants will act, then the bees will act, then the tunnels will act, then new bees will invade, and then the next turn will start.

show This command re-displays the current game board (in case you've forgotten it!)

help [command] This command will give you information about any of the commands. Just entering help by itself will give you a list of commands.

exit This command quits the program. You can also hit ctrl-c twice to quit.

# The Ants

The colony can be defended by the following types of ants:

# Grower (G)
Growers are ants that grow food and boosts. Each turn a Grower ant will either produce 1 food for the colony or occasionally a boost that can be given to the ants. Growers cost 1 food to deploy and have 1 armor.

# Thrower (T)
Throwers are ants that throw leaves at bees to drive them off. Each turn a Thrower ant will throw one leaf at the closest bee within range. Note that Throwers can throw different leaves when boosted. Throwers cost 4 food to deploy and have 1 armor


# Eater (E)
Eaters are ants that will eat the bees outright! On its turn, an Eater ant will swallow a bee in the same tunnel and begin digesting. It takes 3 turns to eat the bee and be ready to eat another. If the Eater is damaged or perishes quickly after swallowing the bee, it may cough up the invader! Eaters cost 4 food to deploy and have 2 armor.

# Scuba (S)
Scuba ants are like Throwers and throw leaves at the bees. However, Scuba ants are able to survive in water-filled tunnels. Scuba ants cost 5 food and have 1 armor.

# Guard (_)
Guard ants are able to protect other ants, occupying the same tunnel as them (this is the only time you can have more than one ant in a tunnel). When a guard is in the tunnel, any attacks from the bees hit it first, and only hurt the protected ant if the Guard perishes. Guards cost 4 food to deploy and have 2 armor.

Note that Guards are shown on the board as underlining the ant they are protecting. If they are not protecting a particular ant, they are shown as an x.

More ant types could be added to the game as future expansions!

Boosts

You are also able to give ants boosts that are dug up by the Growers. If an ant has a boost, it will use that instead of performing its turn as normal. Each boost is lost once used. You are able to offer the following boosts:

# FlyingLeaf
This leaf is particularly well-shaped and aerodynamic, allowing it to be thrown further.

# StickyLeaf
This leaf is covered in spider webs, making it sticky. Bees hit by this leaf become stuck, unable to leave the current tunnel until it frees itself on its next turn.

# IcyLeaf
This leaf is covered in ice because of global climate change. Bees hit by this leaf become cold, and will not sting the any bees until it warms up on its next turn.

# BugSpray
Ants can use this dangerous item to wreak havoc on a single tunnel. Releasing bug spray will deal significant damage to every single insect in the current tunnel (including the poor ant who activates it!)

Use boosts wisely to help defend the colony!
