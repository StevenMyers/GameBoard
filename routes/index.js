
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'GameBoard' });
};


exports.board = function(req, res) {
  res.render('board', {title: 'GameBoard' });
}