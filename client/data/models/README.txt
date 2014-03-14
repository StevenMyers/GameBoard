---In Database
Game: {
  name: (String),
  start: {
    min_players: (Int)
    max_players: (Int)
    deck: [(1-52)]
  }
  handsize: (Int)
  
--Added by server

--Private
  deck: [(1-52)]
  
--- Public
  players: [
    {
      pid: (ID),
      score: (Int),
      dealer: (Boolean)
    }
  }

  board: {
    played: [{
      pid:  (Card Int)
    }]
  }
-- On deal, server messages each player with hand and board
  pid: {
    hand: [x-y]
  }
}