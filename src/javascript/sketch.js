let canvas = null;
let gl = null;
let lastUpdate = null;
let timer = 0.0;
let time = null;
let vertexShader = null;
let fragmentShader = null;
let program = null;
const stats = new Stats();

const initialize = () => {
    initializeStats();
    initialize3DCanvas();
    initializeShaders();
    initializeProgram();
    initializeModel();
    initializeResize();
    animate();
}

const initializeStats = () => {
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
}

const initialize3DCanvas = () => {
    canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl") || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
}

const initializeModel = () => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0
        ]),
        gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    time = gl.getUniformLocation(program, "time");
    lastUpdate = new Date().getTime();
}

const createShader = (gl, source, type) => {
    const shader = gl.createShader(type);
    source = document.getElementById(source).text;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

const initializeShaders = () => {
    vertexShader = createShader(gl, 'vert-shader', gl.VERTEX_SHADER);
    fragmentShader = createShader(gl, 'frag-shader', gl.FRAGMENT_SHADER);
}

const initializeProgram = () => {
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        throw "Could not compile WebGL program. \n\n" + info;
    }
}

const animate = () => {
    stats.begin();

    const currentTime = new Date().getTime();
    const timeSinceLastUpdate = currentTime - lastUpdate;
    lastUpdate = currentTime;

    render(timeSinceLastUpdate);

    stats.end();

    window.requestAnimationFrame(animate);
}

const render = (timeDelta) => {
    timer += (timeDelta ? timeDelta / 1000 : 0.05);
    gl.uniform1f(time, timer);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const initializeResize = () => {
    const resizeCanvas = () => {
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }

        gl.viewport(0, 0, canvas.width, canvas.height);
        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

window.onload = initialize;