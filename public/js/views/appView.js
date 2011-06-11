Game.Views.App = Backbone.View.extend({
	
  
	events: {
		"click": "clickWorld",
    "keydown": "keypressWorld",
    "keyup": "keyupWorld"
	},
	
	
	/*
		function initialize
	*/
	initialize: function() {
		
    var
      characterModel,
      playerModel,
      i, len, playerData;
    
		_.bindAll( this, "update", "updatePlayers" );
		
		this.initLand();
		
    // init user's character
    characterModel = new Game.Models.Player(Game.data.character)
		this.characterView = characterModel.view = new Game.Views.Character({
      model: characterModel
    });

    // init other world players    
    this.players = new Game.Collections.Player();
    
    playerData = Game.data.players;
   
    for ( i = 0; len = playerData.length, i < len; i++ ) {
      // Create player model & view
      playerModel = new Game.Models.Player(playerData[i].session);
      playerModel.view = new Game.Views.Player({
        model: playerModel
      });
      
      // Add to players collection
      this.players.add(playerModel);
    }
    
    // Initialize socket message listener
    Game.socket.on('message', this.updatePlayers);
    
	},
	
	
	/*
		function update
	*/
  update: function() {
		this.characterView.update();
    this.players.each(function(player){
      player.view.update();
    });
	},
	
	
  /*
    function updatePlayers
    callback to socket.io message listener
  */
  updatePlayers: function(obj) {
    // Update changed player model
    var player = this.players.get(obj.userID);
    
    // New player
    if ( player === undefined ) {
      player = new Game.Models.Player(obj); 
      player.view = new Game.Views.Player({
        model: player
      });
      this.players.add(player);
    } else if ( obj.active === false ) {
      player.view.removePlayer();
      this.players.remove(player);
    }
    else {
      player.set(obj);
    }
    
  },
  
  
	/*
		function renderLand
		Renders the landscape of the world and attaches to scene
	*/
	initLand: function() {
		var
			grass,
			plane,
			uvs, i, j,
			mesh;
		
		// Load texture
		grass  = THREE.ImageUtils.loadTexture( "textures/grass.gif" );
		grass.wrapT = grass.wrapS = THREE.RepeatWrapping;

		// Create plane
		plane = new THREE.Plane(8, 8, 8, 8);
		plane.doubleSided = true;
		
		// Create plane texture mapping
		for ( i = 0; i < plane.faceVertexUvs[ 0 ].length; i ++ ) {

			uvs = plane.faceVertexUvs[ 0 ][ i ];

			for ( j = 0; j < uvs.length; j ++ ) {

				uvs[ j ].u *= 8;
				uvs[ j ].v *= 8;

			}
		}
		
		// Create mesh for plane
		mesh = new THREE.Mesh( plane, new THREE.MeshBasicMaterial( { map: grass, wireframe: false} ));
		mesh.rotation.x = -90 * Math.PI / 180;
		mesh.scale.x = mesh.scale.y = mesh.scale.z = 100;
		
		// Add object to scene
		Game.Controllers.App.scene.addObject( mesh );
	},
	
	
	/*
		function clickWorld
		Handles clicks for the entire world, since we don't really have sub-elements of the canvas
	*/
  clickWorld: function(e) {
		// Move character
		this.characterView.moveCharacter(e);
	},
  
  
  /*
    function keyPressWorld
  */
  keypressWorld: function(e) {
    if ( Game.keyDict[e.keyCode] === undefined ) {
      Game.keyDict[e.keyCode] = true;
    } else {
      Game.keyDict[e.keyCode] = !Game.keyDict[e.keyCode];
    }
  },
  
  
  /*
    function keyupWorld
  */
  keyupWorld: function(e) {
    Game.keyDict[e.keyCode] = false;
  }
	
});