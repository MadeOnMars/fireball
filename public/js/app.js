var cursor = {
  x: $(window).width() / 2,
  y: $(window).height() / 2
};

$("body").on('mousemove touchmove', function(e) {
  cursor.x = e.pageX;
  cursor.y = e.pageY;
});

var Fireball = function(){
  this.$fireball = $('#fireball');
  this.width = 0;
  this.x = $(window).width();
  this.y = 0;
  this.easingAmount = 0.05;
  this.nbParticles = 30;
  this.parts = $('.part');
  this.nbLayers = this.parts.length;
  this.partWidth = [];
  this.particules = [];

  this.init = function(){
    this.partWidth = [];
    this.particules = [];
    Particule.empty();
    this.width = $(window).width() < $(window).height() ? $(window).height() / 10 : $(window).width() / 10
    this.$fireball.width(this.width);
    var that = this;
    this.parts.each(function(index, value){
      that.initFireballPart($(this), index)
      that.partWidth.push(that.width - index * that.width / that.nbLayers);
    });

  }
  this.generateParticules = function(){
    var particule = new Particule(this.x, this.y, this.width);
    particule.init();
    this.particules.push(particule);
  }
  this.initFireballPart = function(el, index){
    var alpha = 0.1 + index * 0.1;
    var partWidth = this.width - index * this.width / this.nbLayers;
    el.css('background-color', 'rgba(255, 100, 0, '+alpha+')');
    el.width(partWidth);
  }
  this.move = function(){
    var xDistance = cursor.x - this.x;
    var yDistance = cursor.y - this.y;
    var distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
    if (distance > 1) {
      this.x = this.x + xDistance * this.easingAmount;
      this.y = this.y + yDistance * this.easingAmount
      this.$fireball.css('left', this.x);
      this.$fireball.css('top', this.y);
    }
  }
  this.anim = function(){
    var layerSpeed = this.width/80;
    var that = this;
    this.parts.each(function(index, value){
      if(that.partWidth[index] <= 0){
        that.initFireballPart($(this), 0);
        that.partWidth[index] = that.width;
      }

      that.partWidth[index] = that.partWidth[index] - layerSpeed;
      $(this).width(that.partWidth[index]);
      $(this).css('background-color', function(){
        var alpha = (that.width - that.partWidth[index])/(2*that.width) + 0.1;
        return 'rgba(255, 100, 0, '+alpha+')';
      });
    });

    while(this.particules.length < this.nbParticles){
      this.generateParticules();
    }

    for(var i = this.particules.length - 1; i >= 0; i--){
      if(this.particules[i].width <= 0){
        this.particules[i].remove();
        this.particules.splice(i, 1);
        continue;
      }
      this.particules[i].anim(this.x + this.width/2, this.y + this.width/2);
    }
  }
}

var Particule = function(x, y, width){
  this.x = x;
  this.y = y;
  this.width = width/Math.floor((Math.random() * (10-5+1)) + 5);
  this.initialColor = Math.floor((Math.random() * (250-190+1)) + 190);
  this.lifetime = 0;
  this.zindex = Math.floor((Math.random() * (101-99+1)) + 99);
  this.easingLifetimeWidth = Math.floor((Math.random() * 10) + 1) * width/100000;
  this.offset = {
    x: Math.floor((Math.random() * width/2.5) + 1) * (Math.random() < 0.5 ? -1 : 1),
    y: Math.floor((Math.random() * width/2.5) + 1) * (Math.random() < 0.5 ? -1 : 1)
  };
  this.container = $('#drops');
  this.el = $('<div class="drop"></div>');

  this.init = function(){
    this.container.append(this.el);
    this.el.width(this.width);
    this.el.height(this.width);
    this.el.css('left', this.x);
    this.el.css('top', this.y);
    this.el.css('z-index', this.zindex);
  }
  this.anim = function(x, y){
    // Modify width
    this.width = this.width - this.lifetime * this.easingLifetimeWidth;
    this.el.width(this.width);
    this.el.height(this.width);

    // Modify position
    this.offset.x = this.offset.x - (this.offset.x / (this.width * 4))
    this.offset.y = this.offset.y - (this.offset.y / (this.width * 4))
    this.x = x + this.offset.x + this.lifetime;
    this.y = y + this.offset.y - this.lifetime;
    this.el.css('left', this.x);
    this.el.css('top', this.y);
    this.lifetime = this.lifetime + 4;

    // Modify color
    this.el.css('background', 'rgba(255, '+this.initialColor+', 0, 1)');
    this.initialColor = this.initialColor - 4;

  }
  this.remove = function(){
    this.el.remove();
  }
}

Particule.empty = function(){
  $('#drops').empty();
}

var Space = function(){
  this.rocks = [];
  this.xmax = 0;
  this.nbRocks = 3;
  this.fireball = new Fireball();
  this.init = function(){
    this.xmax = $(window).width() + $(window).width()/2;
    this.fireball.init()
  }
  this.anim = function(){
    this.fireball.move()
    this.fireball.anim()
    while(this.rocks.length < this.nbRocks){
      this.generateRocks();
    }

    for(var i = this.rocks.length - 1; i >= 0; i--){
      if(this.rocks[i].x > this.xmax){
        this.rocks[i].remove();
        this.rocks.splice(i, 1);
        continue;
      }
      this.rocks[i].anim();
    }
  }
  this.generateRocks = function(){
    var rock = new Rock();
    rock.init();
    this.rocks.push(rock);
  }
}

var Rock = function(){
  var WIDTH = $(window).width();
  var xrange = [-WIDTH/2, WIDTH/4, WIDTH/2, 3*WIDTH/4];
  this.x = xrange[Math.floor((Math.random() * 3))];
  this.y = $(window).height();
  this.width = $(window).width() / Math.floor((Math.random() * (4 - 2 + 1)) + 2)
  this.zindex = Math.random() < 0.5 ? 1 : 200;
  this.id = Math.floor((Math.random() * 4) + 1)
  this.container = $('#rocks');
  this.el = $('<div class="rock'+this.id+'"></div>');
  this.speed = Math.floor((Math.random() * (50 - 10 + 1)) + 10);
  this.rotate = Math.floor((Math.random() * 360) + 1)

  this.init = function(){
    this.container.append(this.el);
    this.el.width(this.width);
    this.el.height(this.width);
    this.el.css('left', this.x);
    this.el.css('top', this.y);
    this.el.css('transform', 'rotate('+this.rotate + 'deg)');
    this.el.css('z-index', this.zindex);
  }
  this.anim = function(){
    this.x = this.x + this.speed;
    this.y = this.y - this.speed;
    this.rotate = this.rotate + 1
    this.el.css('left', this.x);
    this.el.css('top', this.y);
    this.el.css('transform', 'rotate('+this.rotate + 'deg)');
  }
  this.remove = function(){
    this.el.remove();
  }
}



var space = new Space();
space.init()
$( window ).resize(function() {
  space.init()
});

function loop(){
  space.anim();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
