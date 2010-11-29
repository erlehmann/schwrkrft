var Universe = function(canvas, milliseconds, offset) {
    this.addPointMass = function(position, velocity, mass) {
        this.particles.push(new PointMass(this, position, velocity, mass));
    }

    this.particles = [];

    this.step = function() {
        // two loops for interaction between every particle pair
        // see <http://codeflow.org/entries/2010/aug/22/html5-canvas-and-the-flying-dots/>

        // reverse while loops are fast
        // see <http://blog.jcoglan.com/2010/10/18/i-am-a-fast-loop/>
        var i = this.particles.length;
        while (i--) {
            var p1 = this.particles[i];

            var j = i;
            while (j--) {
                    var p2 = this.particles[j];
    
                    var direction = p1.position.subtract(p2.position);
                    var distance = p1.position.distanceFrom(p2.position);

                    // Newton's law of universal gravitation
                    var gravForce = 9.81 * (p1.mass * p2.mass) / Math.pow(distance, 2)
                    var gravVector = direction.toUnitVector().multiply(gravForce);
    
                    // heavy things are not as affected
                    p1.velocity = p1.velocity.subtract(gravVector.multiply(1/p1.mass));
                    p2.velocity = p2.velocity.add(gravVector.multiply(1/p2.mass));
            }
            p1.position = p1.position.add(p1.velocity);
        }
    }

    // setInterval scope fix
    // see <http://alexle.net/archives/169>
    setInterval( function(that) { that.step(); }, milliseconds, this);
}

var Camera = function(universe, canvas, milliseconds) {
    this.draw = function(context) {
        var c = this.context;

        // fading
        c.globalCompositeOperation = 'source-in';
        c.fillStyle = 'rgba(128, 128, 128, 0.75)';
        c.fillRect(0, 0, canvas.width, canvas.height);

        // dot drawing style
        c.globalCompositeOperation = 'lighter';
        c.fillStyle = 'rgba(128, 128, 128, 0.75)';

        // reverse while loops are fast
        // see <http://blog.jcoglan.com/2010/10/18/i-am-a-fast-loop/>
        var i = universe.particles.length;
        while (i--) {
            var particle = universe.particles[i];

            // mass is threated as an equivalent to area
            // maybe this should be changed to 3D volume?
            var radius = Math.sqrt(particle.mass / Math.PI);
            var position = particle.position.add(this.offset).add($V([canvas.width/2, canvas.height/2]));

            // particle
            c.beginPath();
            c.arc(position.e(1), position.e(2), radius, 0, Math.PI*2, false);
            c.fill();
        }
    }

    this.context = canvas.getContext('2d');
    this.offset = $V([0, 0]);

    // setInterval scope fix
    // see <http://alexle.net/archives/169>
    setInterval( function(that) { that.draw(); }, milliseconds, this);
}

var PointMass = function(universe, position, velocity, mass) {
    // position is assumed to be a Sylvester vector
    this.position = position;
    // velocity is assumed to be a Sylvester vector
    this.velocity = velocity;
    this.mass = mass;
}
