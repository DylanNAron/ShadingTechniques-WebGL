/*
  function PV (isPoint) {
  function PV (x, y, z, isPoint)
  function PV (x, y, z, w)
*/
function PV (x, y, z, w) {
    var v = [0, 0, 0, 0];

    if (typeof x === "boolean") {
        // function PV (isPoint)
	if (x)
	    v[3] = 1;
    }
    else if (typeof x === "number" &&
             typeof y === "number" &&
             typeof z === "number") {
	v[0] = x;
	v[1] = y;
	v[2] = z;
	if (typeof w === "number")
            v[3] = w;
        else if (typeof w === "boolean") {
            if (w) 
	        v[3] = 1;
        }
        else
            throw "Illegal Argument 1";
    }
    else
        throw "Illegal Argument 2";
    
    v.__proto__ = PV.prototype;

    return v;  
}

PV.prototype = Object.create(Array.prototype);

PV.prototype.constructor = PV;

PV.prototype.toString = function () {
    return "[ " + this[0] + " " + this[1] + " " + this[2] + " " + this[3] + " ]";

}

PV.prototype.isVector = function () {
    return this[3] == 0;
}

PV.prototype.isPoint = function () {
    return this[3] != 0;
}

PV.prototype.flatten = function () {
    var floats = new Float32Array( 4 );
    for (var i = 0; i < 4; i++)
        floats[i] = this[i];
    return floats;
}

function flatten (v) {
    if (!(v[0] instanceof PV))
        throw "Illegal Argument 3";

    var floats = new Float32Array(4 * v.length);

    var n = 0;
    for (var i = 0; i < v.length; i++)
        for (var j = 0; j < 4; j++) {
            floats[n++] = v[i][j];
            // console.log("i " + i + " j " + j + " v[i][j] " + v[i][j]);
        }
    
    return floats;
}        

function Mat(c1, c2, c3, c4) {
    var cols = [ c1, c2, c3, c4 ];
    
    var mat = [new PV(1, 0, 0, 0),
               new PV(0, 1, 0, 0),
               new PV(0, 0, 1, 0),
               new PV(0, 0, 0, 1)];
    
    for (var j = 0; j < 4; j++) {
        if (cols[j] === undefined)
            break;
        if (!(cols[j] instanceof PV))
            throw "Illegal Argument 4";
        
        for (var i = 0; i < 4; i++)
            mat[i][j] = cols[j][i];
    }
    
    mat.__proto__ = Mat.prototype;

    return mat;
}

Mat.prototype = Object.create(Array.prototype);
Mat.prototype.constructor = Mat;

Mat.prototype.toString = function () {
    return this[0].toString() + "\n" + 
        this[1].toString() + "\n" + 
        this[2].toString() + "\n" + 
        this[3].toString() + "\n";
}

Mat.prototype.flatten = function () {
    var floats = new Float32Array( 16 );
    var n = 0;
    for (var j = 0; j < 4; j++)
        for (var i = 0; i < 4; i++)
            floats[n++] = this[i][j];
    return floats;
}

PV.prototype.plus = function (that) {
    if (that instanceof PV) {
        return new PV(this[0] + that[0],
                      this[1] + that[1],
                      this[2] + that[2],
                      this[3] + that[3]);
    }
    else {
        console.log("illegal argument 5");
        throw "Illegal Argument 6";
    }
}

// (2, -1, 3, 1) times -2 equals (-4, 2, -6, -2)
// (2, -1, 3, 1) times (3, 2, 5, 0) equals (6, -2, 15, 0)
PV.prototype.times = function (that) {
    if (typeof that === "number") {
        return new PV(this[0] * that,
                      this[1] * that,
                      this[2] * that,
                      this[3] * that);
    }
    if (that instanceof PV) {
        return new PV(this[0] * that[0],
                      this[1] * that[1],
                      this[2] * that[2],
                      this[3] * that[3]);
    }
    else {
        console.log("illegal argument 7");
        throw "Illegal Argument 8";
    }
}

// u.minus() = -u
// u.minus(v) = u - v
PV.prototype.minus = function (that) {
    if (that === undefined) {
        return new PV(-this[0],
                      -this[1],
                      -this[2],
                      -this[3]);
    }
    else if (that instanceof PV) {
        return new PV(this[0] - that[0],
                      this[1] - that[1],
                      this[2] - that[2],
                      this[3] - that[3]);
    }
    else {
        console.log("illegal argument 9");
        throw "Illegal Argument 10";
    }
}

// Do a 4-dimensional dot product:
// (1, 2, 3, 4) dot (-2, -3, 1, 1) = 1 * -2 + 2 * -3 + 3 * 1 + 4 * 1
PV.prototype.dot = function (that) {
    if (!(that instanceof PV))
        throw "Illegal Argument 11";
    
    var sum = 0;
    for (var i = 0; i < 4; i++)
        sum += this[i] * that[i];
    return sum;
}

// Assume inputs are vectors.  Output is a vector.
PV.prototype.cross = function (that) {
    if (!(that instanceof PV))
        throw "Illegal Argument 12";

    return new PV(this[1] * that[2] - this[2] * that[1],
                  this[2] * that[0] - this[0] * that[2],
                  this[0] * that[1] - this[1] * that[0],
                  false);
}

PV.prototype.magnitude = function () {
    return Math.sqrt(this.dot(this));
};

PV.prototype.distance = function (that) {
    if (!(that instanceof PV))
        throw "Illegal Argument 13";

    return that.minus(this).magnitude();
};

// Return unit vector pointing same direction as this.
PV.prototype.unit = function () {
    return this.times(1. / this.magnitude());
};

// Replace this with unit vector pointing same direction as this.
// (Divide each coordinate by the magnitude.)
PV.prototype.unitize = function () {
    var l = this.magnitude();
    for (var i = 0; i < 4; i++)
        this[i] /= l;
};

// Return version with 1 in fourth coordinate.
PV.prototype.homogeneous = function () {
    if (this[3] == 0)
        return this;
    var p = new PV(true);
    for (var i = 0; i < 3; i++)
        p[i] = this[i] / this[3];
    return p;
};

// Return homogeneous point by dividing all coordinates by this[3].
// Does not change this.
PV.prototype.homogeneous = function () {
    return this.times(1. / this[3]);
};

// Divide all coordinates by this[3].  Changes this.
PV.prototype.homogenize = function () {
    if (this[3] != 0) {
        for (var i = 0; i < 3; i++)
            this[i] /= this[3];
        this[3] = 1;
    }
};


// Return rotation matrix for rotation by angle about axis i.
// 0: x, 1: y, 2: z
Mat.rotation = function (i, angle) {
    if (i === undefined || angle === undefined ||
        !(typeof i === "number") || !(typeof angle === "number"))
	throw "Illegal Argument 14";

    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    var mat = new Mat();

    mat[j][j] = c;
    mat[k][j] = s;
    mat[j][k] = -s;
    mat[k][k] = c;

    return mat;
};

Mat.translation = function (v) {
    if (!(v instanceof PV))
	throw "Illegal Argument 15";

    var mat = new Mat();

    for ( var i = 0; i < 3; i++) {
	mat[i][3] = v[i];
    }

    return mat;
};

Mat.scale = function (s) {
    var mat = new Mat();

    if (typeof s === "number") {
        for ( var i = 0; i < 3; i++) {
	    mat[i][i] = s;
        }
    }
    else if (s instanceof PV) {
        for ( var i = 0; i < 3; i++) {
	    mat[i][i] = s[i];
        }
    }
    else
	throw "Illegal Argument 16";

    return mat;

};

Mat.prototype.transpose = function() {
    var mat = new Mat();

    for ( var i = 0; i < 4; i++)
	for ( var j = 0; j < 4; j++)
	    mat[i][j] = this[j][i];

    return mat;
};

/*
  Matrix multiplication.
  If that is a PV, it is treated as a 4 by 1 column vector.
*/
Mat.prototype.times = function (that) {
    if (that instanceof PV) {
        var v = new PV(false);
        
        for(var i = 0; i < 4; i++) {
            var sum = 0;
            for(var j = 0; j < 4; j++)
                sum += this[i][j] * that[j];
            v[i] = sum;
        }

        return v;
    }
    else if (that instanceof Mat) {
        var mat = new Mat();
        
        for(var i = 0; i < 4; i++) {
            for(var j = 0; j < 4; j++) {
                var sum = 0;
                for(var k = 0; k < 4; k++)
                    sum += this[i][k] * that[k][j];
                mat[i][j] = sum;
            }
        }
        
        return mat;
    }
}

function testMV () {
    var v = new PV(false);
    console.log("v = " + v);
    console.log("v[0] = " + v[0]);
    console.log("v instanceof PV: " + (v instanceof PV));
    console.log("v instanceof Array: " + (v instanceof Array));

    var p = new PV(1, 1, 1, 1);
    var q = new PV(2, 2, 2, 2);

    console.log("p = " + p);
    console.log("q = " + q);
    console.log("p.plus(q) = " + p.plus(q));

    var m = new Mat();
    console.log("m = \n" + m);
    console.log("m[2][2] = " + m[2][2]);
    console.log("m instanceof Mat: " + (m instanceof Mat));
    console.log("m instanceof Array: " + (m instanceof Array));
    console.log("m.times(p) = " + m.times(p));

    var n = new Mat(new PV(0, 0, 0, 1),
		    new PV(0, 0, 1, 0),
		    new PV(0, 1, 0, 0),
		    new PV(1, 0, 0, 0));

    var r = new PV(1, 2, 3, 4);
    
    console.log("n = \n" + n);
    console.log("r = " + r);
    console.log("n.times(r) = " + n.times(r));
}
