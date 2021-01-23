import React, { Component } from 'react'
import Canvas from './js/Canvas'

class App extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {

    }

    render() {
        return (
            <section className='app-container'>
                <Canvas />
            </section>
        )
    }
}

export default App
