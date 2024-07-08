class RefTriangles2 {
  #gl = null
  #inputs = null

  vao
  buffers
  shader
  N

  static vShaderUrl = './shaders/vertex.glsl'
  static fShaderUrl = './shaders/fragment.glsl'
  static scriptName = document.currentScript.src
  static vShaderTxt = ''
  static fShaderTxt = ''

  constructor (gl, {pos, colors}) {
    this.#gl = gl
    
    if (pos.length !== colors.length) {
      throw new TypeError({
	pos: pos.length,
	required:'equal',
	colors: colors.length
      })
    }

    // Num elements required to be rendered
    this.N = pos.length

    // Compile program to memory
    // --------------------------------------------------
    this.setupShaders()

    // Copy data to memory 
    // --------------------------------------------------
    this.setupBuffers({pos, colors})

    // Setup memory mapping
    // --------------------------------------------------
    this.setupVao()
  }

  setupShaders() {
    const gl = this.#gl
    const {vShaderTxt, fShaderTxt} = this.constructor

    console.log("VERTEX_SHADER")
    console.log(vShaderTxt)
    console.log("FRAGMENT_SHADER")
    console.log(fShaderTxt)

    // ----------------------------------------------------
    // Create Program
    // ----------------------------------------------------
    // // For clarity
    // writeTextToDomSelector(vShaderTxt, '#vShader code')
    // writeTextToDomSelector(fShaderTxt, '#fShader code')
    const vShader = compileShader(gl, vShaderTxt, gl.VERTEX_SHADER)
    const fShader = compileShader(gl, fShaderTxt, gl.FRAGMENT_SHADER)
    const shaderProgram = linkShaders(
      gl, vShader, fShader, true
    )

    // ----------------------------------------------------
    // Extract Program Pointers
    // ----------------------------------------------------
    gl.useProgram(shaderProgram);
    const aPositionLoc
	  = gl.getAttribLocation(
	    shaderProgram, "aPosition"
	  )
    , aColorRgbLoc
	  = gl.getAttribLocation(
	    shaderProgram, "aColorRgb"
	  )

    // This is just a boilerplate to use for getting
    // uniforms.
    // , uPointSizeLoc	= gl.getUniformLocation(
    //   shaderProgram,
    //   "uPointSize"
    // )

    gl.useProgram(null);

    this.shader = {
      program: shaderProgram,
      attributes: {
	aPosition: aPositionLoc,
	aColorRgb: aColorRgbLoc,
      },
      uniforms: {
	// uPointSize: uPointSizeLoc,
      }
    }

    console.log({shader:this.shader})
  }

  setupBuffers({pos, colors}) {
    const gl = this.#gl

    pos = pos.flat()
    colors = colors.flat()

    const {pos: posVerts, colors: colorVerts}
	  = setupDataBuffers(gl, {pos, colors})

    this.buffers = {
      pos: posVerts, colors: colorVerts
    }

    console.log({buffers:this.buffers})

  }

  setupVao() {
    const gl = this.#gl

    const {
      program,
      attributes: {
	aPosition, aColorRgb
      }
    } = this.shader

    const {pos, colors} = this.buffers

    const vao = gl.createVertexArray()

    // ----------------------------------------------------
    // Bind Program Pointers to Data & Buffers
    // ----------------------------------------------------

    //Activate the Shader
    gl.useProgram(program);
    gl.bindVertexArray(vao);

    // Uniforms
    // ----------------------------------------------------
    // Store data to the shader's uniform variable
    // uPointSize
    // gl.uniform1f(uPointSizeLoc, pointSize);

    // r = fgColor.r
    // g = fgColor.g
    // b = fgColor.b
    // a = fgColor.a
    // console.log({fgColor: [r,g,b,a]})
    // gl.uniform3fv(uFgColorRgbLoc, new Float32Array([r,g,b]));


    // Attributes
    // ----------------------------------------------------
    // Tell gl which buffer we want to use at the moment
    gl.bindBuffer(gl.ARRAY_BUFFER, pos);
    // Set which buffer the attribute will pull its data from
    gl.vertexAttribPointer(aPosition,3,gl.FLOAT,false,0,0);

    // Tell gl which buffer we want to use at the moment
    gl.bindBuffer(gl.ARRAY_BUFFER, colors);
    // Set which buffer the attribute will pull its data from
    gl.vertexAttribPointer(aColorRgb,3,gl.FLOAT,false,0,0);

    // Enable the attributes in the shader. (Because they
    // are disabled by default! Probably some code
    // optimisation)
    gl.enableVertexAttribArray(aPosition);
    gl.enableVertexAttribArray(aColorRgb);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
    // Done setting up the buffer
    // ----------------------------------------------------

    // gl.bindVertexArray(null);
    gl.useProgram(null);

    this.vao = vao

    console.log({vao:this.vao})
  }

  static async bootstrap() {
    const Cls = this
    
    if (Cls.vShaderUrl instanceof URL === false) {
      Cls.vShaderUrl = new URL(Cls.vShaderUrl, Cls.scriptName)
    }
    if (Cls.fShaderUrl instanceof URL === false) {
      Cls.fShaderUrl = new URL(Cls.fShaderUrl, Cls.scriptName)
    }

    console.log({
      vShaderUrl: Cls.vShaderUrl,
      fShaderUrl: Cls.fShaderUrl,
    })

    Cls.vShaderTxt = await cachedLoad(
      Cls.vShaderUrl, 'text'
    )
    Cls.fShaderTxt = await cachedLoad(
      Cls.fShaderUrl, 'text'
    )
  }

  draw(ms, inputs) {
    // ------------------------------------------------
    // FIXME: HANDLE INPUTS
    //
    // Uncomment the debugInputs to understand the
    // inputs format
    // ------------------------------------------------
    this.#debugInputs(inputs)

    // ------------------------------------------------
    // FIXME: HANDLE Cube Rotation based on MS and
    // INPUTS
    // ------------------------------------------------

    const gl = this.#gl
    const N = this.N
    const vao = this.vao
    gl.useProgram(this.shader.program);
    gl.bindVertexArray(vao)
    gl.drawArrays(gl.TRIANGLES, 0, N);
    gl.bindVertexArray(null)
    gl.useProgram(null);
  }

  #debugInputs(inputs) {
    if (!deepEqual(inputs, this.#inputs)) {
      console.log({inputs})
    }
    this.#inputs = inputs
  }
  
}

/**
 * Deep Equal for object comparison.
 *
 * Adapted from this SO exchange:
 * https://stackoverflow.com/a/32922084
 */
function deepEqual(x, y) {
  const ok = Object.keys, tx = typeof x, ty = typeof y;
  return x && y && tx === 'object' && tx === ty ? (
    ok(x).length === ok(y).length &&
      ok(x).every(key => deepEqual(x[key], y[key]))
  ) : (x === y);
}

setupUniforms()
{
  const gl=this.#gl
  const{
    uniforms:{
      uModelView
      },
    }=this.shader
    
    gl.uniform1(uModelView,this.uModelView);
  }
