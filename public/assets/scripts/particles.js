(function(w,d) {

	var renderCount = 1;

	Math.randomRange = function(min,max) {
		return Math.random() * (max - min) + min;
	};

	var Particle = {};

	Particle.create = function(x,y,vx,vy,c,l) {
		return new Float32Array([x || 0, y || 0, vx || 0, vy || 0, c || 0, l || 60]);
	};

	Particle.update = function(out, offset, vx, vy, c) {
		out[offset] += out[offset + 2] + (vx || 0);
		out[offset + 1] += out[offset + 3] + (vy || 0);
		out[offset + 4] = c || 0;
	};


	var ParticleSystem = {};

	ParticleSystem.create = function(canvas, count) {
		var particles = new Float32Array(count * 6);
		for (var i = 0; i < count; i++) {
			particles.set(
				Particle.create(
					(canvas.width / 2) + Math.randomRange(-20, 20),
					(canvas.height / 2) + Math.randomRange(-20, 20),
					0,0,0,
					Math.floor(Math.randomRange(10,120))
				), i * 6
			);
		}
		return particles;
	};

	ParticleSystem.update = function(_in, _out, _canvas, _emitters) {
		for (var i = 0; i < _in.length; i+=6) {
			var x = _in[i],
				y = _in[i + 1],
				vx = _in[i + 2],
				vy = _in[i + 3],
				c = _in[i + 4],
				l = _in[i + 5],
				dx, dy, em;

			var odds = Math.round(Math.randomRange(0, _emitters.collection.length - 1));
			em = _emitters.collection[odds];
			if (em) {
				dx = x - em.x;
				dy = y - em.y;
			} else {
				break;
			}

			if (c === 0) {
				if (dx * dx + dy * dy > Math.randomRange(1000, 3000)) {
					vx += -dx * 0.05;
					vy += -dy * 0.05;
					c = 1;
				} else {
					vx += dx * 0.05;
					vy += dy * 0.05;
				}
			}
			else {
				if (dx * dx + dy * dy < 900) {
					vx += dx * 0.05;
					vy += dy * 0.05;
					c = 0;
				} else {
					vx += -dx * 0.05;
					vy += -dy * 0.05;
				}
			}

			var div = Math.sqrt(dx * dx + dy * dy) / 50;

			vx *= 0.75 / div;
			vy *= 0.75 / div;

			vx += Math.random() - 0.5;
			vy += Math.random() - 0.5;


			if (x > 0 && x < _canvas.width && y > 0 && y < _canvas.height) {
				Particle.update(_out, i, vx, vy, c);
			} else {
				var r = Math.atan2(y - _canvas.width / 2, x - _canvas.height / 2);
				vx = -Math.cos(r);
				vy = -Math.sin(r);
				Particle.update(_out, i, vx, vy, c);
				_out[i] = em.x;
				_out[i + 1] = em.y;
			}

			if (renderCount % l === 0) {
				var r2 = 200 * Math.sqrt(Math.random());
				var angle = 2 * Math.PI * Math.random();
				_out[i] = (r2 * Math.cos(angle) + em.x);
				_out[i + 1] = (r2 * Math.sin(angle) + em.y);
				_out[i + 2] = Math.randomRange(-0.5, 0.5);
				_out[i + 3] = Math.randomRange(-0.5, 0.5);
			} else {
				_canvas.draw(_out[i], _out[i + 1]);
			}
			
		}
		_canvas.finalise();
	};

	var Canvas = function() {
		var $this = this;

		this.load = function(toLoad, callback) {

			this.canvas = d.getElementById('surface');
			this.context = this.canvas.getContext('2d');

			if (w.orientation === 90 || w.orientation === -90) {
				this.canvas.width = 1024;
				this.canvas.height = 768;
				this.canvas.style.width = '1024px';
				this.canvas.style.height = '768px';
			}

			this.touched = false;
			this.touchCTAOpacity = 1;
			this.hasRect = false;
			this.clickCTAOpacity = 0;

			this.assets = {};
			
			this.width = this.canvas.width;
			this.height = this.canvas.height;


			var left = toLoad.length;
			var onl = function() {
				left--;
				if (left <= 0) callback();
			};
			while (toLoad.length) {
				var img = new Image();
				var src = toLoad.shift();
				img.src = src;
				this.assets[src] = img;
				img.onload = onl;
			}
		};

		this.interact = function(fn) {
			this.listener = fn;
			this.canvas.addEventListener('mousedown', this.listener);
			this.canvas.addEventListener('mousemove', this.listener);
			this.canvas.addEventListener('mouseup', this.listener);
			this.canvas.addEventListener('touchstart', this.listener);
			this.canvas.addEventListener('touchmove', this.listener);
			this.canvas.addEventListener('touchend', this.listener);
		};

		this.refresh = function(e) {
			this.context.clearRect(0, 0, this.width, this.height);
			this.context.drawImage(this.assets['images/filings_bg_blk_noisey.jpg'], 0, 0, this.width, this.height);

			for (var i = 0, len = e.collection.length; i < len; i++) {
				var _e = e.collection[i];

				var grad = this.context.createRadialGradient(_e.x, _e.y, 40, _e.x, _e.y, 90);
				grad.addColorStop(0, 'rgba(30,30,30,0.9)');
				grad.addColorStop(1, 'rgba(10,10,10,0)');

				this.context.fillStyle = grad;
				this.context.fillRect(_e.x - 200, _e.y - 200, 400, 400);
			}
		};

		this.draw = function(x, y) {
			this.context.fillStyle = '#8b8b8b';
			//this.context.fillStyle = 'white';
			this.context.fillRect(x, y, 1.5, 1.5);
		};

		this.finalise = function() {
			this.context.drawImage(this.assets['images/watch_over.png'], 0, 0, this.width, this.height);
			this.context.save();

			this.context.translate(388, 467);

			var now = new Date(),
				minAngle = (360 / 60) * (now.getMinutes() + (now.getSeconds() / 60) + ((now.getMilliseconds() / 1000) / 60)),
				hourAngle = (360 / 12) * (now.getHours() + (now.getMinutes() / 60)),
				secAngle = (360 / 60) * (now.getSeconds() + (now.getMilliseconds() / 1000));

			this.context.rotate(minAngle * (Math.PI / 180));
			this.context.drawImage(this.assets['images/hands_min.png'], -10, -106);
			this.context.rotate(-minAngle * (Math.PI / 180));

			this.context.rotate(hourAngle * (Math.PI / 180));
			this.context.drawImage(this.assets['images/hands_hour.png'], -10, -70);
			this.context.rotate(-hourAngle * (Math.PI / 180));

			this.context.rotate(secAngle * (Math.PI / 180));
			this.context.drawImage(this.assets['images/hands_secs.png'], -5, -119);
			this.context.rotate(-secAngle * (Math.PI / 180));

			this.context.restore();
			this.context.save();

			this.context.drawImage(this.assets['images/top_lock_up.png'], this.width / 2 - 150, 15, 300, 139);
			this.context.drawImage(this.assets['images/bottom_lock_up.png'], this.width / 2 - 150, 820, 300, 56);
			this.context.drawImage(this.assets['images/cta_line.png'], this.width / 2 - 50, 875, 100, 4);

			if (this.touchCTAOpacity > 0) {
				this.context.font      = '22px omega_ctregular';
				this.context.fillStyle = 'rgba(255,255,255,' + this.touchCTAOpacity + ')';
				this.context.textAlign = 'center';
				this.context.textBaseline = 'top';
				this.context.fillText('TOUCH TO MAGNETISE', this.width / 2, 890);

				if (this.touched) {
					this.touchCTAOpacity -= 0.08;
				}
			} else {
				this.context.font	= '22px omega_ctregular';
				this.context.fillStyle = 'rgba(255,255,255,' + this.clickCTAOpacity + ')';
				this.context.textAlign = 'center';
				this.context.textBaseline = 'top';
				this.context.fillText('DISCOVER CO-AXIAL ANTI-MAGNETIC \u25B6', this.width / 2, 890);

				if (!this.hasRect) {
					var metrics = this.context.measureText('DISCOVER CO-AXIAL ANTI-MAGNETIC \u25B6');
					this.context.rect(this.width / 2 - metrics.width / 2, 890, metrics.width, 30);
					this.hasRect = true;
				}

				if (this.clickCTAOpacity < 1) {
					this.clickCTAOpacity += 0.08;
				}
			}

		};
	};

	var Emitter = function(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	};

	var EmitterCollection = function() {
		this.collection = [].concat(Array.prototype.slice.call(arguments));
	};

	w.addEventListener('DOMContentLoaded', function() {

		var mDown = false;

		var stats = new Stats();
		stats.setMode(0);

		// Align top-left
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';

		d.body.appendChild( stats.domElement );

		var _c = new Canvas();

		_c.load([
			'images/filings_bg_blk_noisey.jpg',
			'images/watch_over.png',
			'images/cta_line.png',
			'images/top_lock_up.png',
			'images/bottom_lock_up.png',
			'images/hands_min.png',
			'images/hands_secs.png',
			'images/hands_hour.png'
		], function() {
			Conduit
				.add('a', stats.begin)
				.add('paint', function() {

					_c.refresh(_ec);
					ParticleSystem.update(_ps,_ps,_c,_ec);
					renderCount++;

				})
				.add('z', stats.end)
				.start();
		});

		_c.interact(function(e) {
			e.preventDefault();
			if ('touches' in e) {
				var i, len, touch;
				switch (e.type) {
					case 'touchstart':
						mDown = true;
						_c.touched = true;
						_ec.collection = [];
						for (i = 0, len = e.touches.length; i < len; i++) {
							touch = e.touches[i];
							_ec.collection.push(new Emitter(touch.pageX, touch.pageY));
						}
						break;
					case 'touchmove':
						if (mDown) {
							_ec.collection = [];
							for (i = 0, len = e.touches.length; i < len; i++) {
								touch = e.touches[i];
								_ec.collection.push(new Emitter(touch.pageX, touch.pageY));
							}
						}
						break;
					case 'touchend':
						_ec.collection = [];
						for (i = 0, len = e.touches.length; i < len; i++) {
							touch = e.touches[i];
							_ec.collection.push(new Emitter(touch.pageX, touch.pageY));
						}
						if (_ec.collection.length === 0) {
							mDown = false;
							_ec.collection.push(new Emitter(_c.width / 2, _c.height / 2 - 50));
							if (_c.context.isPointInPath(e.changedTouches[0].pageX, e.changedTouches[0].pageY)) {
								goToLink();
							}
						}
						break;
				}
			} else {
				switch (e.type) {
					case 'mousedown':
						mDown = true;
						_c.touched = true;
						_ec.collection = [];
						_ec.collection.push(new Emitter(e.layerX, e.layerY));
						break;
					case 'mousemove':
						if (mDown) {
							_ec.collection = [];
							_ec.collection.push(new Emitter(e.layerX, e.layerY));
						}
						if (_c.context.isPointInPath(e.layerX, e.layerY)) {
							_c.canvas.style.cursor = 'pointer';
						} else {
							_c.canvas.style.cursor = 'auto';
						}
						break;
					case 'mouseup':
						mDown = false;
						_ec.collection = [];
						_ec.collection.push(new Emitter(_c.width / 2, _c.height / 2 - 50));
						if (_c.context.isPointInPath(e.layerX, e.layerY)) {
							goToLink();
						}
						break;
				}
			}
			
		});

		function goToLink() {
			var link = 'http://www.google.com';
			w.location = '' + link;
		}

		var _ec = new EmitterCollection(new Emitter(_c.width / 2, _c.height / 2 - 50));

		var _ps = ParticleSystem.create(_c, 15000);

		w.addEventListener('orientationchange', function() {
			switch (w.orientation) {
				case 90:
				case -90:
					// Landscape
					_c.canvas.width = 1024;
					_c.canvas.height = 768;
					_c.canvas.style.width = '1024px';
					_c.canvas.style.height = '768px';
					_c.width = _c.canvas.width;
					_c.height = _c.canvas.height;
					_ec = new EmitterCollection(new Emitter(_c.width / 2, _c.height / 2 - 50));
					break;
				default:
					// Portrait
					_c.canvas.width = 768;
					_c.canvas.height = 1024;
					_c.canvas.style.width = '768px';
					_c.canvas.style.height = '1024px';
					_c.width = _c.canvas.width;
					_c.height = _c.canvas.height;
					_ec = new EmitterCollection(new Emitter(_c.width / 2, _c.height / 2 - 50));
					break;
			}
		});

	});

})(window, document);