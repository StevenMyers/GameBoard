// Pitch 
function Pitch() {
    Game.call(this);
    this.name = "Pitch";
}

// Inherit from game
Pitch.prototype = new Game();
Pitch.prototype.constructor = Pitch;