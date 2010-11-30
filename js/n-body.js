/*
    n-body.js — javascript n-body simulation
    Copyright (C) 2010  erlehmann

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var Universe = function(canvas, milliseconds, offset) {
    this.addPointMass = function(position, velocity, mass, shape) {
        this.particles.push(new PointMass(this, position, velocity, mass, shape));
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
                    var gravForce = (p1.mass * p2.mass) / Math.pow(distance, 2);
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

            var position = particle.position.add(this.offset).add($V([canvas.width/2, canvas.height/2]));

            // particle
            c.beginPath();
            if (particle.shape == 'circle') {
                // mass is threated as an equivalent to area
                // maybe this should be changed to 3D volume?
                var radius = Math.pow((particle.mass / Math.PI), 1/3);
                c.arc(position.e(1), position.e(2), radius, 0, Math.PI*2, false);
            } else if (particle.shape == 'line') {
                var pointA = position.add(particle.velocity);
                c.moveTo(position.e(1), position.e(2));
                c.lineTo(pointA.e(1), pointA.e(2));
                c.stroke();
            } else {
                c.font = Math.pow(particle.mass, 1/3) + 'px sans-serif';
                c.fillText  ('?', position.e(1), position.e(2));
            }
            c.fill();
        }
    }

    this.follow = function(particle) {
        setInterval( function(that) { that.offset = particle.position.multiply(-1); }, milliseconds, this);
    }

    this.context = canvas.getContext('2d');
    this.offset = $V([0, 0]);

    // setInterval scope fix
    // see <http://alexle.net/archives/169>
    setInterval( function(that) { that.draw(); }, milliseconds, this);
}

var PointMass = function(universe, position, velocity, mass, shape) {
    // position is assumed to be a Sylvester vector
    this.position = position;
    // velocity is assumed to be a Sylvester vector
    this.velocity = velocity;
    this.mass = mass;
    this.shape = shape;
}
