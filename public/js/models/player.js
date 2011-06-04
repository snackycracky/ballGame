Game.Models.Player = Backbone.Model.extend({

  defaults: {
    pos: {
      x: 0,
      y: 40,
      z: 0
    },
    dir: {
      x: 0,
      y: 0,
      z: 0
    }, // Three.js Vector
    moving: false,
    type: "rock"
  },


  initialize: function() {
    
  }

});