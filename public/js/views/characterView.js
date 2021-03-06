Game.Views.Character = Game.Views.Player.extend({

  // Class variables
  nServerTick: (new Date).getTime(),
  startVector: new THREE.Vector3(),
  endVector: new THREE.Vector3(),
  dirVector: new THREE.Vector3(),
  goalVector: new THREE.Vector3(),

  initialize: function() {
    var 
      camera = Game.Controllers.App.camera,
      pos = this.model.get("pos");
    
    // Create player
    Game.Views.Player.prototype.initialize.call(this);
    
    // Init camera pos
    camera.position.x += pos.x;
    camera.position.z += pos.z;
    camera.target.position.x += pos.x;
    camera.target.position.z += pos.z;
    
    _.bindAll( this, "moveCharacter", "update" );
  
  },
  
  
  /*
		Update character
	*/
  update: function() {  
    var 
			camera = Game.Controllers.App.camera,
      moving = this.model.get("moving");
    
    var posInd = this.goalVector.x / this.goalVector.z;
    
    if ( Game.keyDict[37] ) {
      // Set direction left vector
      if ( (this.goalVector.x < 0 && posInd < 1.0 && posInd > 0) || (this.goalVector.x > 0 && posInd > -1.0 && posInd < 0) ) { // quadrant 1
        // up
        this.model.set({dir: {x: -1, y: 0, z: -1}, moving: true });
        
      } else if ( (this.goalVector.x > 0 && posInd < -1.0 && posInd < 0) || (this.goalVector.x > 0 && posInd > 1.0 && posInd > 0) ) { // quadrant 2
        // down
        this.model.set({dir: {x: 1, y: 0, z: 1}, moving: true });
      } else {
        
        this.model.set({dir: {x: this.goalVector.x, y: 0, z: this.goalVector.z}, moving: true });
      }
      
    } else if ( Game.keyDict[38] ) {
      // Set direction up vector
      if ( (this.goalVector.x > 0 && posInd < 1.0 && posInd > 0) || (this.goalVector.x < 0 && posInd > -1.0 && posInd < 0) ) { // quadrant 3
        // left
        this.model.set({dir: {x: -1, y: 0, z: 1}, moving: true });
        
      } else if ( (this.goalVector.x > 0 && posInd < -1.0 && posInd < 0) || (this.goalVector.x > 0 && posInd > 1.0 && posInd > 0) ) { // quadrant 2
        // right
        this.model.set({dir: {x: 1, y: 0, z: -1}, moving: true });
        
      } else {
        this.model.set({dir: {x: this.goalVector.x, y: 0, z: this.goalVector.z}, moving: true });
      }
      
    } else if ( Game.keyDict[39] ) {
      // Set direction right vector
      if ( (this.goalVector.x < 0 && posInd < -1.0 && posInd < 0) || (this.goalVector.x < 0 && posInd > 1.0 && posInd > 0) ) { // quadrant 4
        // up
        this.model.set({dir: {x: -1, y: 0, z: -1}, moving: true });
      } else if ( (this.goalVector.x > 0 && posInd < 1.0 && posInd > 0) || (this.goalVector.x < 0 && posInd > -1.0 && posInd < 0) ) { // qudrant 3
        // down
        this.model.set({dir: {x: 1, y: 0, z: 1}, moving: true });
      } else {
        this.model.set({dir: {x: this.goalVector.x, y: 0, z: this.goalVector.z}, moving: true });
      }
      
    } else if ( Game.keyDict[40] ) {
      // Set direction down vector
      if ( (this.goalVector.x < 0 && posInd < -1.0 && posInd < 0) || (this.goalVector.x < 0 && posInd > 1.0 && posInd > 0) ) { // qudrant 4
        // left
        this.model.set({dir: {x: -1, y: 0, z: 1}, moving: true });
      } else if ( (this.goalVector.x < 0 && posInd < 1.0 && posInd > 0) || (this.goalVector.x > 0 && posInd > -1.0 && posInd < 0) ) { // quadrant 1
        // right
        this.model.set({dir: {x: 1, y: 0, z: -1}, moving: true });
      } else {
        this.model.set({dir: {x: this.goalVector.x, y: 0, z: this.goalVector.z}, moving: true });
      }
      
    } else if ( moving ){
      // Stop moving
      this.model.set({moving: false});
    }
    
    
    // Call super's update
    Game.Views.Player.prototype.update.call(this);
		
    if ( this.model.get("moving") ) {
      // Change camera position to match character
			camera.position.x += this.speed * this.dirVec.x;
			camera.position.z += this.speed * this.dirVec.z;
			camera.target.position.x += this.speed * this.dirVec.x;
			camera.target.position.z += this.speed * this.dirVec.z;
    }
    
    // Update finished - send update to server once a second
    if ((new Date).getTime() > this.nServerTick) {
      Game.socket.send(JSON.stringify(this.model));
      this.nServerTick += 33;
    }
	},
  
  
  /*
		function moveCharacter
		translates x, y coordinates to world space and updates character
	*/
	moveCharacter: function(e) {
    var
  			camera = Game.Controllers.App.camera,
  			projector = Game.Controllers.App.projector,
  			x, 
  			y,
  			t;
  		
  		// Convert screen coordinates to NDC coordinates -1.0 to 1.0
  		x = ( e.clientX / window.innerWidth ) * 2 - 1;
  		y = - ( e.clientY / window.innerHeight ) * 2 + 1;
  		
  		// Obtain one vector at click position for each side of the cube mapping
  		this.startVector.set( x, y, -1.0 );
  		this.endVector.set( x, y, 1.0 );
  	
  		// Convert coordinates back to world coordinates
  		this.startVector = projector.unprojectVector( this.startVector, camera );
  		this.endVector = projector.unprojectVector( this.endVector, camera );
  	
  		// Get direction from startVector to endVector
  		this.dirVector.sub( this.endVector, this.startVector );
  		this.dirVector.normalize();
  	
  		// Find intersection where y = 0
  		t = this.startVector.y / - ( this.dirVector.y );
  
  		// Start walking
  		this.goalVector.set( this.startVector.x + t * this.dirVector.x,
  		this.startVector.y + t * this.dirVector.y,
  		this.startVector.z + t * this.dirVector.z );
      
      // Find vector from player to goal
      this.goalVector.sub( this.goalVector, this.model.get("pos") );
      this.goalVector.normalize();
  }

});


/*Game.Views.Character = Backbone.View.extend({

	// View variables
	startVector: new THREE.Vector3(),
	endVector: new THREE.Vector3(),
	dirVector: new THREE.Vector3(),
	goalVector: new THREE.Vector3(),
	isWalking: false,
	SPEED: 10,
	IMAGE_OFFSET: .04167,
	
	
	initialize: function() {
		
		_.bindAll( this, "moveCharacter", "update" );
		
		this.initCharacter();
	},
	
	update: function() {
		var 
			dir,
			camera = Game.Controllers.App.camera;
		
		if ( this.isWalking ) {
			dir = new THREE.Vector3();
			dir.sub( this.goalVector, this.sprite.position);
			
			if (Math.abs( dir.x ) < 1 && Math.abs( dir.z ) < 1) {
				this.isWalking = false;
			}
			
			dir.normalize();
			
			// Position movement
			this.sprite.position.x += this.SPEED * dir.x;
			this.sprite.position.z += this.SPEED * dir.z;
			
			// Texture animation
			this.sprite.uvOffset.x += this.IMAGE_OFFSET;
			if (this.sprite.uvOffset.x > 1.0) {
				this.sprite.uvOffset.x = 0.0;
			}
			
			// Change camera position to match character
			camera.position.x += this.SPEED * dir.x;
			camera.position.z += this.SPEED * dir.z;
			camera.target.position.x += this.SPEED * dir.x;
			camera.target.position.z += this.SPEED * dir.z;
		}
	},
	
	
  initCharacter: function() {
		var 
			texture;

		// Load sprite map
		texture = THREE.ImageUtils.loadTexture( "assets/ball_sprite_red_upper_right.png" );
	
		// Create sprite
		this.sprite = new THREE.Sprite( { map: texture, useScreenCoordinates: false, affectedByDistance: false} );
		
		// Set scale to 1/24 of image (200px)
		this.sprite.scale.y = .041667;
		this.sprite.scale.x = -0.041167;

		// Set offset to first sprite of 24 images
		this.sprite.uvOffset.x = .95834;
		this.sprite.uvScale.x = 0.041167;
		
		// Add collision detection
		this.sprite.boundingMesh = new THREE.Mesh( new THREE.Cube(60, 60, 60, 1, 1, 1) );
		THREE.Collisions.colliders.push( THREE.CollisionUtils.MeshOBB(this.sprite.boundingMesh) );

		// Center sprite at 0, 0, 0 of world
		this.setPosition(0, 40, 0);
		
		
		Game.Controllers.App.scene.addObject( this.sprite );
		Game.Controllers.App.scene.addObject( this.sprite.boundingMesh );
	},
	
	
  
	setPosition: function(x, y, z) {
		this.sprite.position.set(x, y, z);
		this.sprite.boundingMesh.position.set(x, y, z);
  },
	
	
  
	
	moveCharacter: function(e) {
		var
			camera = Game.Controllers.App.camera,
			projector = Game.Controllers.App.projector,
			x, 
			y,
			t;
		
		// Convert screen coordinates to NDC coordinates -1.0 to 1.0
		x = ( e.clientX / window.innerWidth ) * 2 - 1;
		y = - ( e.clientY / window.innerHeight ) * 2 + 1;
		
		// Obtain one vector at click position for each side of the cube mapping
		this.startVector.set( x, y, -1.0 );
		this.endVector.set( x, y, 1.0 );
	
		// Convert coordinates back to world coordinates
		this.startVector = projector.unprojectVector( this.startVector, camera );
		this.endVector = projector.unprojectVector( this.endVector, camera );
	
		// Get direction from startVector to endVector
		this.dirVector.sub( this.endVector, this.startVector );
		this.dirVector.normalize();
	
		// Find intersection where y = 0
		t = this.startVector.y / - ( this.dirVector.y );

		// Start walking
		this.goalVector.set( this.startVector.x + t * this.dirVector.x,
			this.startVector.y + t * this.dirVector.y,
			this.startVector.z + t * this.dirVector.z );
			
		this.isWalking = true;	
	}
	
  });*/