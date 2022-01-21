This code is a work in progress as I continue to learn Javascript and is likely buggy. I DO NOT RECOMMEND using a direct copy, as I have set it up to do what I personally need it to do. As such, many functions like sending items or gold are hard-coded to be sent straight to my own characters, and if you really want to run a copy of this code, you will need to replace my character names in various files with your own if you want things like auto party and magiports (if you have a mage) to work. Also if you don't want to send me free stuff by mistake. :^)

It has been pieced together from parts I have written myself, other parts I have utilised from other open repositories and code snippets from the Discord server.
(Credit to Spadar and Journeyover, amongst many others, and a shout-out to the active Adventureland Discord server)


--- USING THIS CODE ---

In order to use this code, you will need to do a couple of things. First and foremost, clone the repository to wherever you would like to save it on your local drive. Copy the code from the CODE.example file and paste it into the CODE window in the game (top right of the game window). Ensure you change the path(s) within the findOs() function, if necessary, so that the require files are exposed in the startup string. The only reason I have this set up is because I switch between Windows and Linux frequently, and it's just easier for me this way. If you only use one OS, delete the case you don't need.

e.g.

```
case 'win32':
      startup = 'C:/Users/username/Documents/'
      break;

case 'linux':
      startup = '/run/media/username/Documents/'
      break;
```
      
Once the CODE has been pasted and the startup path is correct, the CODE will load from the require<Class> files of the class you are running the code on. You can specify which files you would like to load on specific classes by editing the require files named requireClass (e.g. if you use a warrior, edit requireWarrior.js). Simply list the path to a file you would like to load on the relevant class, add new lines for a file created retroactively or remove existing lines for files if you don't need them or want to load them.
