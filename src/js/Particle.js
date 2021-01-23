class Particle {
    constructor(ctx, startX, startY) {
        this.ctx = ctx
        this.startX = startX
        this.startY = startY
        this.x = 0
        this.y = 0
        this.hv = Math.random() * 4 - 2
        this.vv = -(Math.random() * 5 + 1)
        this.opacity = 255
    }
    isVisible() {
        return this.opacity > 0
    }
    update(force) {
        const {
            vf,
            hf
        } = force
        this.x += this.hv + hf
        this.y += this.vv + vf
        this.opacity -= 2.5
    }
    getParticle() {
        const {
            startX,
            startY,
            x,
            y,
            opacity
        } = this
        return [
            Math.floor(startX + x),
            Math.floor(startY + y),
            opacity,
        ]
    }
}

export default Particle