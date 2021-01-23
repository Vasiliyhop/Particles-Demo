import Particle from './Particle'
//use free pixelated image from https://www.wallpaperflare.com/digital-art-field-fire-forest-knights-nature-pixel-art-wallpaper-stcsg free download
import imageUrl from '../assets/forest.jpg'
//use free sound from https://freesound.org/people/Dynamicell/sounds/17554/
import fireSound from '../assets/fire.mp3'
import {
    initShaders,
    initBuffers
} from '../utils/shaderUtils'

class ParticlesSystem {
    constructor(ctx, width, height, startX, startY, fpsRef, playRef) {
        this.GL = ctx
        this.width = width
        this.height = height
        this.startX = startX
        this.startY = startY
        this.particles = []
        this.fpsRef = fpsRef
        this.playRef = playRef
        this.force = {
            vf: 0,
            hf: 0
        }
    }
    init() {
        const {
            width,
            height,
            GL,
            render,
            playRef
        } = this
        GL.viewportWidth = width
        GL.viewportHeight = height
        this.shaderProgram = initShaders(GL)
        GL.useProgram(this.shaderProgram)

        GL.clearColor(0.0, 0.0, 0.0, 1.0)
        GL.viewport(0, 0, GL.viewportWidth, GL.viewportHeight)
        GL.clear(GL.COLOR_BUFFER_BIT)

        this.viewportWidth = GL.getUniformLocation(this.shaderProgram, 'viewportWidth')
        this.viewportHeight = GL.getUniformLocation(this.shaderProgram, 'viewportHeight')
        this.emitterPosition = GL.getUniformLocation(this.shaderProgram, 'emitterPosition')
        this.windForce = GL.getUniformLocation(this.shaderProgram, 'windForce')

        this.iTime = GL.getUniformLocation(this.shaderProgram, 'iTime')
        this.indexBuffer = initBuffers(GL, this.shaderProgram)
        this.startTime = new Date().getTime()
        this.prevTime = this.startTime
        this.timeSum = 0
        this.drawsCounter = 1

        this.arrayLocation = GL.getUniformLocation(this.shaderProgram, 'particles')
        GL.uniform3fv(this.arrayLocation, [-1.0, -1.0, -1.0])

        const image = new Image();

        function play() {
            var audio = new Audio(fireSound)
            audio.volume = 0.4
            audio.loop = true
            audio.play()
            playRef.current.innerText = ''
            document.removeEventListener('click', this.playEvent)
        }
        this.playEvent = document.addEventListener('click', play)
        image.onload = () => {
            let textureLoc = GL.getUniformLocation(this.shaderProgram, 'u_texture')
            GL.uniform1i(textureLoc, 0)
            this.texture = GL.createTexture()
            GL.bindTexture(GL.TEXTURE_2D, this.texture)
            GL.activeTexture(GL.TEXTURE0)
            GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, image.width, image.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, image)
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE)
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE)
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST)
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST)
            requestAnimationFrame(render)
        }
        image.src = imageUrl;
    }
    setForce(force) {
        this.force = force
    }
    render = () => {
        const {
            width,
            height,
            startX,
            startY,
            GL,
            particles,
            render,
            viewportWidth,
            viewportHeight,
            indexBuffer,
            shaderProgram,
            startTime,
            iTime,
            force,
            windForce,
        } = this
        for (let i = 0; i < 2; i++) {
            const particle = new Particle(GL, startX, startY)
            particles.push(particle)
        }
        const particlesData = (new Float32Array(3 * 256)).fill(-1)
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i]
            particle.update(force)
            if (!particle.isVisible()) {
                particles.splice(i, 1)
                continue
            }
            const pData = particle.getParticle()
            particlesData[i * 3] = pData[0]
            particlesData[i * 3 + 1] = pData[1]
            particlesData[i * 3 + 2] = pData[2]
        }

        let currentTime = new Date().getTime() - startTime
        GL.clear(GL.COLOR_BUFFER_BIT)
        GL.useProgram(shaderProgram)
        GL.viewport(0, 0, GL.viewportWidth, GL.viewportHeight)
        GL.uniform3fv(this.arrayLocation, particlesData)
        GL.uniform2fv(this.emitterPosition, [startX, startY])
        GL.uniform2fv(windForce, [force.hf, force.vf])
        GL.uniform1f(viewportWidth, width)
        GL.uniform1f(viewportHeight, height)
        GL.uniform1f(viewportHeight, height)
        GL.uniform1f(iTime, currentTime / 1000)
        GL.drawElements(GL.TRIANGLE_STRIP, indexBuffer.numberOfItems, GL.UNSIGNED_SHORT, 0)
        let cFps = 1000 / (currentTime - this.prevTime)
        this.timeSum += Math.round(cFps < 90 ? cFps : 90)

        this.fpsRef.current.innerText = 'FPS: ' + Math.round(this.timeSum / this.drawsCounter)
        this.prevTime = currentTime
        this.drawsCounter++
        if (this.drawsCounter > 60) {
            this.drawsCounter = 1
            this.timeSum = 0
        }
        requestAnimationFrame(render)
    }
}

export default ParticlesSystem