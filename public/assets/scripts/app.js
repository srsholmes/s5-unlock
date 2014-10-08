/*
 * Stick everything in an IIFE so we dont pollute global scope.
 */
(function(w,d) {

	var particleArrays = [],
		mdown = false;

	function rgbToHex(r, g, b) {
	    if (r > 255 || g > 255 || b > 255)
	        throw "Invalid color component";
	    return ((r << 16) | (g << 8) | b).toString(16);
	}

	var randomRange = function(min,max) {
		return Math.random() * (max - min) + min;
	};

	var Particle = function(x, y, vx, vy, radius, life, color) {
		this.x = x || 0;
		this.y = y || 0;
		this.vx = vx || 0;
		this.vy = vy || 0;
		this.radius = radius || 10;
		this.life = life || 60;
		this.color = color || '#ffffff';
	}

	Particle.prototype.update = function(vx, vy) {
		this.x += this.vx + (vx || 0);
		this.y += this.vy + (vy || 0);
	};

	var Emitter = function(x, y) {
		this.x = x || 0;
		this.y = y || 0;
		this.lifespan = 10;
	};

    var canvas = d.getElementById('galaxyCanvas'),
    	context = canvas.getContext('2d'),
    	bg = new Image();
		
	var stats = new Stats();
	stats.setMode(0);

	// Align top-left
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.right = '0px';
	stats.domElement.style.top = '0px';

	d.body.appendChild( stats.domElement );

    //Use Conduit for Request animation frame to re render the canvas at 60fps. (for animation purposes).	
    Conduit.add('a', stats.begin)
    	   .add('render' , render)
    	   .add('z', stats.end);


    //Only start conduit once bg is loaded
    bg.onload = function() {
    	Conduit.start();
    }


    bg.src = '/assets/images/background.png';

    //render function, which is being called at 60fps from conduit
    function render() {
    	context.clearRect(0,0, canvas.width, canvas.height);
    	context.drawImage(bg, 0, 0);
    	for (var i = 0; i < particleArrays.length; i++) {
    		var particles = particleArrays[i];
    		for (var j = 0; j < particles.length; j++) {
    			var particle = particles[j];
    			particle.update(randomRange(-1, 1), randomRange(-1, 0));
    			context.beginPath();
    			context.fillStyle = particle.color;
    			context.arc(particle.x,particle.y,particle.radius,0,Math.PI*2,true);
    			context.fill();
    		}
    	}
    }

    canvas.addEventListener('mousedown', function() {
    	mdown = true;
    });

    canvas.addEventListener('mousemove', function(e) {
    	if (!mdown) return;
    	var posX = e.offsetX;
    	var posY = e.offsetY;

    	var emitter = new Emitter(posX, posY);
    	var p = context.getImageData(posX, posY, 1, 1).data;
    	var particles = [];
    	for (var i = 0; i < randomRange(2, 7); i++) {
    		particles.push(
    			new Particle(
    				emitter.x,
    				emitter.y,
    				randomRange(-1, 1),
    				randomRange(-1,0),
    				randomRange(2, 15),
    				60,
    				'rgba(' + p[0] + ',' + p[1] + ',' + p[2] + ',' + randomRange(0.1, 0.7) + ')' 
    				// '#' + ('000000' + rgbToHex(p[0], p[1], p[2])).slice(-6)
    				)
    			);
    	}
    	particleArrays.push(particles);
    });

    canvas.addEventListener('mouseup', function() {
    	mdown = false;
    })


   
})(window, document);