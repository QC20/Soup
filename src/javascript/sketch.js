let canvas = null; // The canvas element
let gl = null; // The WebGL context
let lastUpdate = null; // Timestamp of the last update
let timer = 0.0; // Timer for animations
let time = null; // Uniform location for the time in the shader

let vertexShader = null; // The vertex shader
let fragmentShader = null; // The fragment shader

const stats = new Stats(); // Stats.js instance for performance monitoring

const initialize = () => {
    // Initialize all necessary components and start the animation loop
    initialize3DCanvas();
    initializeResize();
    initializeShaders();
    initializeProgram();
    initializeModel();
    animate();
};

const initialize3DCanvas = () => {
    // Set up the WebGL context
    canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl") || canvas.getContext('experimental-webgl');
    if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height); // Set the viewport
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Set the depth function
        gl.clearColor(1.0, 1.0, 1.0, 1.0); // Set the clear color to white
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the color and depth buffers
    }
};

const initializeModel = () => {
    // Create and bind a buffer for a rectangle (two triangles)
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0, -1.0, 1.0, 1.0
    ]), gl.STATIC_DRAW);

    // Set up the vertex attribute for position
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Set the resolution uniform in the shader
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionLocation, gl.viewportWidth, gl.viewportHeight);

    // Initialize the time uniform location
    time = gl.getUniformLocation(program, "time");
    lastUpdate = new Date().getTime(); // Get the current time
};

const createShader = (gl, sourceId, type) => {
    // Create and compile a shader
    const shader = gl.createShader(type);
    const source = document.getElementById(sourceId).text;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Check if the shader compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
};

const initializeShaders = () => {
    // Initialize the vertex and fragment shaders
    vertexShader = createShader(gl, 'vert-shader', gl.VERTEX_SHADER);
    fragmentShader = createShader(gl, 'frag-shader', gl.FRAGMENT_SHADER);
};

let program = null;

const initializeProgram = () => {
    // Create and link the WebGL program
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Check if the program linked successfully
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        throw `Could not compile WebGL program.\n\n${info}`;
    }
    gl.useProgram(program); // Use the program
};

const animate = () => {
    // Main animation loop
    stats.begin();

    const currentTime = new Date().getTime();
    const timeSinceLastUpdate = currentTime - lastUpdate;
    lastUpdate = currentTime;

    render(timeSinceLastUpdate);

    stats.end();

    // Request the next frame
    window.requestAnimationFrame(animate);
};

const render = (timeDelta) => {
    // Update the timer and pass it to the shader
    timer += (timeDelta ? timeDelta / 1000 : 0.05);
    gl.uniform1fv(time, [timer]);

    // Draw the rectangle
    gl.drawArrays(gl.TRIANGLES, 0, 6);
};

const initializeResize = () => {
    // Handle canvas resizing
    const height = document.body.clientHeight;
    const width = document.body.clientWidth;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    gl.viewport(0, 0, canvas.width, canvas.height);
};

window.onresize = () => {
    // Reinitialize on resize
    initializeResize();
};

// Initialize everything
initialize();
