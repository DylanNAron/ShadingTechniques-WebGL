function Sphere (gl, nLon, nLat, color) {
    this.color = color;
    this.verts = [];
    this.vnormals = [];
    this.tangents = [];
    this.tcoords = [];
    this.faces = [];
    this.fnormals = [];

    this.basisPositions = [];
    this.basisColors = [];

    var vbuffers = [];
    var nbuffers = [];
    var xbuffers = [];
    var tbuffers = [];

    var rotStep = Mat.rotation(1, 2 * Math.PI / nLon);
    var o = new PV(true);
    for ( var i = 0; i <= nLat + 1; i++) {
        var t = new PV(0, 0, -1, false);
        var lat = Math.PI / (nLat + 1) * i;
        var p = new PV(Math.sin(lat), -Math.cos(lat), 0, true);
        for ( var j = 0; j <= nLon; j++) {
            var n = p.minus(o).unit();
            this.verts.push(p);
            this.vnormals.push(n);
            this.tangents.push(t);
            
            // EXERCISE 1
            //var tcoord = n;  // WRONG:  set to texture coordinates

            var lat = Math.PI*i / (nLat + 1);
            var lon = 2*Math.PI*j / (nLon);

            var x = lon/(2*Math.PI);
            var y = lat/Math.PI;

            tcoord = new PV(x,y,0,0);

            // Set tcoord to the texture coordinates of this vertex
            this.tcoords.push(tcoord);

            var b = n.cross(t);

            this.basisPositions.push(p);
            this.basisColors.push(new PV(1, 0.25, 0.25, false));
            this.basisPositions.push(p.plus(t.times(0.05)));
            this.basisColors.push(new PV(1, 0.25, 0.25, false));
            this.basisPositions.push(p);
            this.basisColors.push(new PV(0.25, 1, 0.25, false));
            this.basisPositions.push(p.plus(b.times(0.05)));
            this.basisColors.push(new PV(0.25, 1, 0.25, false));
            this.basisPositions.push(p);
            this.basisColors.push(new PV(0.25, 0.25, 1, false));
            this.basisPositions.push(p.plus(n.times(0.05)));
            this.basisColors.push(new PV(0.25, 0.25, 1, false));

            p = rotStep.times(p);
            t = rotStep.times(t);
        }
    }

    var tangentPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tangentPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.basisPositions), gl.STATIC_DRAW);

    var tangentColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tangentColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.basisColors), gl.STATIC_DRAW);

    for ( var i = 1; i <= nLat + 1; i++)
	for ( var j = 0; j < nLon; j++) {
	    var vInds = [];
	    vInds.push((nLon + 1) * i + j);
	    vInds.push((nLon + 1) * i + (j + 1));
	    vInds.push((nLon + 1) * (i - 1) + (j + 1));
	    vInds.push((nLon + 1) * (i - 1) + j);
	    this.faces.push(vInds);
	}

    for (var i = 0; i < this.faces.length; i++) {
        var fverts = [];
        for (var j = 0; j < this.faces[i].length; j++)
            fverts.push(this.verts[this.faces[i][j]]);

        var vbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(fverts), gl.STATIC_DRAW);
        vbuffers.push(vbuffer);
        
        var fnormals = [];
        for (var j = 0; j < this.faces[i].length; j++)
            fnormals.push(this.vnormals[this.faces[i][j]]);

        var nbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(fnormals), gl.STATIC_DRAW);
        nbuffers.push(nbuffer);

        var ftangents = [];
        for (var j = 0; j < this.faces[i].length; j++)
            ftangents.push(this.tangents[this.faces[i][j]]);

        var xbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, xbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(ftangents), gl.STATIC_DRAW);
        xbuffers.push(xbuffer);

        var ftcoords = [];
        for (var j = 0; j < this.faces[i].length; j++)
            ftcoords.push(this.tcoords[this.faces[i][j]]);

        var tbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(ftcoords), gl.STATIC_DRAW);
        tbuffers.push(tbuffer);

        var n = new PV(false);

        var a = fverts[0];
        for (var j = 2; j < fverts.length; j++) {
            var b = fverts[j-1];
            var c = fverts[j];
            n = n.plus(b.minus(a).cross(c.minus(a)));
        }

        n.unitize();
        this.fnormals.push(n);
    }

    this.render = function (gl, program, flatOrRound) {
        var vPosition = gl.getAttribLocation(program, "vPosition");
        var vNormal = gl.getAttribLocation(program, "vNormal");
        var vTangent = gl.getAttribLocation(program, "vTangent");
        var vTCoord = gl.getAttribLocation(program, "vTCoord");
        var colorLoc = gl.getUniformLocation(program, "color");
        var normalLoc = gl.getUniformLocation(program, "normal");
        var useNormalLoc = gl.getUniformLocation(program, "useNormal");

        var center = new PV(0.5, 0.5, 0.5, true);

        for (var i = 0; i < this.faces.length; i++) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vbuffers[i]);
            gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            gl.bindBuffer(gl.ARRAY_BUFFER, nbuffers[i]);
            gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vNormal);

            gl.bindBuffer(gl.ARRAY_BUFFER, xbuffers[i]);
            gl.vertexAttribPointer(vTangent, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vTangent);

            gl.bindBuffer(gl.ARRAY_BUFFER, tbuffers[i]);
            gl.vertexAttribPointer(vTCoord, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vTCoord);

            var color = center.plus(this.fnormals[i].times(0.5));
            gl.uniform4fv(colorLoc, color.flatten());

            gl.uniform4fv(normalLoc, this.fnormals[i].flatten());
            gl.uniform1i(useNormalLoc, flatOrRound);

            gl.drawArrays(gl.TRIANGLE_FAN, 0, this.faces[i].length);
        }
     }
     
     this.renderTangentBases = function(gl, program) {

        var tangent_position = gl.getAttribLocation(program, "vs_position");
        var tangent_color = gl.getAttribLocation(program, "vs_color");

        gl.bindBuffer(gl.ARRAY_BUFFER, tangentPositionBuffer);
        gl.vertexAttribPointer(tangent_position, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, tangentColorBuffer);
        gl.vertexAttribPointer(tangent_color, 4, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.LINES, 0, this.basisPositions.length);
    }
}
