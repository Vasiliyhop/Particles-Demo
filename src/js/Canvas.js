import React, { Component, createRef } from 'react'
import ParticlesSystem from './ParticlesSystem'

class Canvas extends Component {
    constructor(props) {
        super(props)
        const w = 900
        const h = 700
        this.state = {
            startX: w / 2,
            startY: h - 45,
            width: w,
            height: h,
            canvasRef: createRef(),
            fpsRef: createRef(),
            playRef: createRef()
        }
    }

    componentDidMount() {
        const {
            startX,
            startY,
            width,
            height,
            canvasRef,
            fpsRef,
            playRef,
        } = this.state
        const canvas = canvasRef.current
        const ctx = canvas.getContext('webgl2')
        const system = new ParticlesSystem(ctx, width, height, startX, startY, fpsRef, playRef)
        system.init()
        canvas.addEventListener('mousemove', e => {
            const x = e.offsetX
            const y = e.offsetY
            const force = {
                vf: (y - startY) / (height / 5),
                hf: (x - startX) / (width / 5)
            }
            system.setForce(force)
        })
        canvas.addEventListener('mouseleave', e => {
            const force = {
                vf: 0,
                hf: 0
            }
            system.setForce(force)
        })
    }

    render() {
        const {
            width,
            height,
            canvasRef,
            fpsRef,
            playRef
        } = this.state
        return (
            <>
                <canvas ref={canvasRef} className='canvas' width={width} height={height} />
                <div ref={fpsRef} className='fps-counter'>...</div>
                <div ref={playRef} className='play'>Click somewhere to play sound</div>
            </>
        )
    }
}

export default Canvas