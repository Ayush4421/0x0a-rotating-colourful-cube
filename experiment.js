class Experiment {
  // Candidate Details
  static rollNo = '102153019';
  static name = 'Ayush Garg';

  #gl;
  #programs = [];

  canvasSel = '#myCanvas';
  cameraControls;

  constructor() {
    const Cls = this.constructor;

    this.controls = new Controls('#controls', {
      submitSel: '#controls-submit'
    });

    // Uncomment to enable transform controls
    // --------------------------------------------------
    this.controls.unhide();

    const { inputs } = this.controls;
    console.log({ inputs });
  }

  async setupPrograms(gl) {
    this.#gl = gl;
    const Cls = this.constructor;
    await RefTriangles2.bootstrap();

    const data = Cls.generateData();

    try {
      const refTriangles2 = new RefTriangles2(gl, data);
      this.#programs.push(refTriangles2);

    } catch (e) {
      console.error(e);
    }
  }

  loop(ms) {
    const gl = this.#gl;

    const { inputs } = this.controls;
    // console.log({ handleCamera: true, inputs });

    gl.clearColor(0, 0, 0, 0);
    // Clear Buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (const program of this.#programs) {
      program.draw(ms, inputs);
    }
  }

  static generateData() {
    const data = this.#getStandardCubeData();
    console.log({ data });
    return data;
  }

  static #getStandardCubeData() {
    // Define the 8 corners of a cube
    const pos8 = [
      [-1, -1, -1], // 0
      [1, -1, -1],  // 1
      [1, 1, -1],   // 2
      [-1, 1, -1],  // 3
      [-1, -1, 1],  // 4
      [1, -1, 1],   // 5
      [1, 1, 1],    // 6
      [-1, 1, 1]    // 7
    ];

    const N = 8;
    const color8 = getRandomColorsRgb(N, 3);

    // Define the indices for the 12 triangles of the cube (36 indices)
    const indexArray = [
      0, 1, 2,  0, 2, 3, // Front face
      4, 5, 6,  4, 6, 7, // Back face
      0, 3, 7,  0, 7, 4, // Left face
      1, 2, 6,  1, 6, 5, // Right face
      3, 2, 6,  3, 6, 7, // Top face
      0, 1, 5,  0, 5, 4  // Bottom face
    ];

    const pos = indexArray.map(i => pos8[i]);
    const colors = indexArray.map(i => color8[i]);

    return { pos, colors };
  }
}
