
import LEDDisplay from './dash-daq/components/LEDDisplay.react';
import Plot from 'react-plotly.js';
import React, { Component } from 'react'
import Slider from './dash-core-components/components/Slider.react'

// import { Button, Col, Container, Row } from 'reactstrap';
import { Button, Col, Container, Row } from 'react-bootstrap';

// import logo from './logo.svg';
// import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import './bWLwgP.css';

const msPerIteration = 10

const colorMutedBlue = '#1f77b4'
const colorSafetyOrange = '#ff7f0e'
const colorCookedAsparagusGreen = '#2ca02c'

const numericSort = function(a, b) { return a - b }
const numericSum = function(a, b) { return a + b }
const colorFunction = function(rank, n) {
  if (rank < 0.5*n) {
    return colorCookedAsparagusGreen
  } else if (rank < 0.9*n) {
    return colorMutedBlue
  } else {
    return colorSafetyOrange
  }
}
const argsort = function(wealth, nAgents) {
  const indices = Array.apply(null, {length: nAgents}).map(Number.call, Number)
  const indexed = indices.map(function(i){return  {wealth: wealth[i],index: i}})
  const sorted = indexed.sort(function(a, b){return numericSort(a.wealth, b.wealth)})
  const ranked = indices.map(function(i){return {wealth: sorted[i].wealth, index: sorted[i].index, rank: i}})
  const resorted = ranked.sort(function(a, b){return numericSort(a.index, b.index)})
  return resorted.map(function(i){return i.rank})
}

const nAgents = 100
const vDebt = 0
const vWealth = 20
const color = Array(nAgents).fill(colorMutedBlue)

const layout_xrange_min = 0
const layout_xrange_max = vWealth * 5

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      color: color,
      constants: {
        aggregate_wealth: nAgents * vWealth,
        layout_xrange_min: layout_xrange_min,
        layout_xrange_max: layout_xrange_max,
        nAgents: nAgents,
        vDebt: vDebt,
        vWealth: vWealth,
      },
      data: {
        aggregate_bottom_50_pct: [vWealth*nAgents*0.5],
      	aggregate_top_10_pct: [vWealth*nAgents*0.1],
        wealth: Array(nAgents).fill(vWealth),
      },
      iterations: 0,
      parameters: {
        nAgents: nAgents,
        vDebt: vDebt,
        vWealth: vWealth,
      },
      playing: false,
    }
  }

  initializeColors() {
    const nAgents = this.state.parameters.nAgents
    return (
      Array(nAgents).fill(colorMutedBlue)
    )
  }

  initializeConstants() {
    return ({
      aggregate_wealth: this.state.parameters.nAgents * this.state.parameters.vWealth,
      layout_xrange_min: -this.state.parameters.vDebt,
      layout_xrange_max: this.state.parameters.vWealth * 5,
      nAgents: this.state.parameters.nAgents,
      vDebt: this.state.parameters.vDebt,
      vWealth: this.state.parameters.vWealth,
    })
  }

  initializeData() {
    return ({
      aggregate_bottom_50_pct: [this.state.parameters.vWealth*this.state.parameters.nAgents*0.5],
      aggregate_top_10_pct: [this.state.parameters.vWealth*this.state.parameters.nAgents*0.1],
      wealth: Array(this.state.parameters.nAgents).fill(this.state.parameters.vWealth),
    })
  }

  updateNAgents(value) {
    this.setState({
      color: this.state.color,
      constants: this.state.constants,
      data: this.state.data,
      iterations: this.state.iterations,
      parameters: {
        nAgents: value,
        vDebt: this.state.parameters.vDebt,
        vWealth: this.state.parameters.vWealth,
      },
      // playing: false,
      playing: this.state.playing,
    })
  }

  updateVDebt(value) {
    this.setState({
      color: this.state.color,
      constants: this.state.constants,
      data: this.state.data,
      iterations: this.state.iterations,
      parameters: {
        nAgents: this.state.parameters.nAgents,
        vDebt: value,
        vWealth: this.state.parameters.vWealth,
      },
      // playing: false,
      playing: this.state.playing,
    })
  }

  updateVWealth(value) {
    this.setState({
      color: this.state.color,
      constants: this.state.constants,
      data: this.state.data,
      iterations: this.state.iterations,
      parameters: {
        nAgents: this.state.parameters.nAgents,
        vDebt: this.state.parameters.vDebt,
        vWealth: value,
      },
      // playing: false,
      playing: this.state.playing,
    })
  }

  setup() {
    if (this.state.playing) {
      clearInterval(this.interval);
    }
    this.setState({
      color: this.initializeColors(),
      constants: this.initializeConstants(),
      data: this.initializeData(),
      iterations: 0,
      parameters: {
        nAgents: this.state.parameters.nAgents,
        vDebt: this.state.parameters.vDebt,
        vWealth: this.state.parameters.vWealth,
      },
      playing: false,
    })
  }

  step() {
    var n_benefactors = 0;
    var newX = this.state.data.wealth.slice();
    for (var i = 0; i < newX.length; i++) {
      if (newX[i] > -this.state.constants.vDebt) {
        newX[i] -= 1;
        n_benefactors += 1;
      }
    }
    for (var j = 0; j < n_benefactors; j++){
      newX[Math.floor(Math.random() * this.state.constants.nAgents)] += 1;
    }
    var newX_sorted = newX.slice().sort(numericSort);
    var aggregate_bottom_50_pct = this.state.data.aggregate_bottom_50_pct.slice();
    aggregate_bottom_50_pct.push(newX_sorted.slice(0, this.state.constants.nAgents*0.5).reduce(numericSum));
    var aggregate_top_10_pct = this.state.data.aggregate_top_10_pct.slice();
    aggregate_top_10_pct.push(newX_sorted.slice(this.state.constants.nAgents*0.9).reduce(numericSum));

    this.setState({
      color: this.state.color,
      constants: this.state.constants,
      data: {
        aggregate_bottom_50_pct: aggregate_bottom_50_pct,
      	aggregate_top_10_pct: aggregate_top_10_pct,
        wealth: newX,
      },
      iterations: this.state.iterations + 1,
      parameters: this.state.parameters,
      playing: this.state.playing,
    })
  }

  play() {
    if (!this.state.playing) {
      this.setState({
        color: this.state.color,
        constants: this.state.constants,
      	data: this.state.data,
        iterations: this.state.iterations,
        parameters: this.state.parameters,
        playing: true,
      });
      this.interval = setInterval(() => {this.step()}, msPerIteration);
    } else {
      this.setState({
        color: this.state.color,
        constants: this.state.constants,
        data: this.state.data,
        iterations: this.state.iterations,
        parameters: this.state.parameters,
        playing: false,
      });
      clearInterval(this.interval);
    }
  }

  group() {
    const wealth = this.state.data.wealth
    const nAgents = this.state.constants.nAgents
    const rank = argsort(wealth, nAgents)
    this.setState({
      color: rank.map(function(rank) { return colorFunction(rank, nAgents)}),
      constants: this.state.constants,
      data: this.state.data,
      iterations: this.state.iterations,
      parameters: this.state.parameters,
      playing: this.state.playing,
    })
  }

  render() {
    const aggregate_bottom_50_pct = this.state.data.aggregate_bottom_50_pct.slice()[this.state.data.aggregate_bottom_50_pct.length-1]
    const aggregate_top_10_pct = this.state.data.aggregate_top_10_pct.slice()[this.state.data.aggregate_top_10_pct.length-1]
    return (
      <div>
        <Container style={{marginTop: 40}}>
          <h1>Simple Economy Extended</h1>
          <div>The purpose of this simple web app is to illustrate</div>
          <div>that a population with equal initial wealth and fair rules</div>
          <div>can evolve into an extremely unequal economy</div>
          <div>where the richest 10% has more money than the poorest 50% does.</div>
        </Container>

        <Container style={{marginTop: 40}}>
          <div>Initially, everybody has the same amount of money, say $20.</div>
          <div>On each day, everybody with at least $1 gives $1 to someone else randomly.</div>
        </Container>

        <Container style={{marginTop: 40}}>
          <h3>Parameters</h3>
          <Row>
            <Col>How many agents are there?</Col>
            <Col>How much debt is allowed?</Col>
            <Col>How much money do agents have initially?</Col>
          </Row>
        </Container>

        <Container>
          <Row>
            <Col>
              <Slider
                id='nAgents'
                marks={{10:'10', 100:'100', 200:'200'}}
                max={200}
                min={10}
                onChange={(value)=>{this.updateNAgents(value)}}
                onAfterChange={(value)=>{this.updateNAgents(value)}}
                step={200}
                // style={{'marginBottom': 40, 'marginLeft': 40, 'marginRight': 40, 'marginTop': 40, 'height': 100}}
                value={this.state.parameters.nAgents}
              />
            </Col>
            <Col>
              <Slider
                id='vDebt'
                marks={{0:'0', 10:'10', 20:'20', 50:'50'}}
                max={50}
                min={0}
                onChange={(value)=>{this.updateVDebt(value)}}
                onAfterChange={(value)=>{this.updateVDebt(value)}}
                step={50}
                // style={{'marginBottom': 40, 'marginLeft': 40, 'marginRight': 40, 'height': 100}}
                value={this.state.parameters.vDebt}
              />
            </Col>
            <Col>
              <Slider
                id='vWealth'
                marks={{10:'10', 20:'20', 50:'50'}}
                max={50}
                min={10}
                onChange={(value)=>{this.updateVWealth(value)}}
                onAfterChange={(value)=>{this.updateVWealth(value)}}
                step={50}
                // style={{'marginBottom': 40, 'marginLeft': 40, 'marginRight': 40, 'height': 100}}
                value={this.state.parameters.vWealth}
              />
            </Col>
          </Row>
        </Container>
        
        <Container style={{marginTop: 40}}>
          <h3>Control Buttons (Click SETUP to apply parameters)</h3>
          <Row>
            <Col><Button onClick={() => this.setup()} style={{width: 100}} >Setup</Button></Col>
            <Col><Button onClick={() => this.step()} style={{width: 100}}>Step</Button></Col>
            <Col><Button onClick={() => this.play()} style={{width: 100}}>Play / Pause</Button></Col>
            <Col><Button onClick={() => this.group()} style={{width: 100}}>Group</Button></Col>
          </Row>
        </Container>

        <Container >
          <Row>
            <Col>
              <Plot
                data={[{
                  x: this.state.data.wealth,
                  y: Array.apply(null, {length: this.state.data.wealth.length}).map(Number.call, Number),
                  type: 'scatter',
                  mode: 'markers',
                  marker: {
                    color: this.state.color,
                  },
                }]}
                layout={
                  {
                    hovermode: 'closest',
                    xaxis: {
                      range: [this.state.constants.layout_xrange_min, this.state.constants.layout_xrange_max],
                    }
                  }
                }
              />
            </Col>
          </Row>
        </Container>
        
        <Container>
          <Row>
            <Col>Time (days)</Col>
            <Col>Poorest 50% combined ($)</Col>
            <Col>Richest 10% combined ($)</Col>
            <Col>Total wealth in the economy ($)</Col>
          </Row>
          <Row>
            <Col><LEDDisplay value={this.state.iterations}/></Col>
            <Col><LEDDisplay value={aggregate_bottom_50_pct}/></Col>
            <Col><LEDDisplay value={aggregate_top_10_pct}/></Col>
            <Col><LEDDisplay value={this.state.constants.aggregate_wealth}/></Col>
          </Row>
        </Container>

        <Container>
          <Row>
            <Col>
              <Plot
                data={[
                  {
                    x: Array.apply(null, {length: this.state.data.aggregate_bottom_50_pct.length}).map(Number.call, Number),
                    y: this.state.data.aggregate_bottom_50_pct,
                    type: 'scatter',
                    name: 'Bottom 50%',
                  },
                  {
                    x: Array.apply(null, {length: this.state.data.aggregate_bottom_50_pct.length}).map(Number.call, Number),
                    y: this.state.data.aggregate_top_10_pct,
                    type: 'scatter',
                    name: 'Top 10%',
                  },
                ]}
              />
            </Col>
          </Row>
        </Container>
        
        <Container style={{marginTop: 40}}>
          <h3>Uniform or Normal?</h3>
          <div>You would think that after some time, the distribution of wealth is uniform. Or at least normal.</div>
          <div>But no. It's exponential, i.e. the richest 10% will have more money than the poorest 50%.</div>
        </Container>

        <Container>
          <Row>
            <Col>
              <Plot
                data={[{
                  x: this.state.data.wealth,
                  histnorm: 'probability',
                  type: 'histogram',
                }]}
                layout={{
                  hovermode: 'closest',
                  xaxis: {
                    range: [this.state.constants.layout_xrange_min, this.state.constants.layout_xrange_max],
                  },
                  yaxis: {
                    range: [0, 1],
                  }
                }}
              />
            </Col>
          </Row>
        </Container>

        <Container style={{marginTop: 40}}>
          <h3>Why is that?</h3>
          <div>You can't give any money if you don't have any money to give.</div>
          <div>So if you are poor, you stay poor, because you can't get any poorer.</div>
        </Container>

        <Container style={{marginTop: 40}}>
          <h3>Actually, that is not true. You can get poorer.</h3>
          <div>If you are allowed to have debts.</div>
          <div>Adjust the parameter for <b>DEBT</b> to observe.</div>
        </Container>

        <Container style={{marginTop: 40}}>
          <h3>And you can get richer</h3>
          <div>The poor can get rich, and the rich can get poor.</div>
          <div>Click <b>GROUP</b> to color the poorest 50% and the richest 10% to track their movements.</div>
        </Container>

        <Container style={{marginTop: 40, marginBottom: 100}}>
          <h1>About the model</h1>
          <p>Simple Economy is an agent-based model in Dr. Uri Wilensky's Introduction to Agent-Based Modeling, 
          originally implemented in <a href="https://ccl.northwestern.edu/netlogo/">NetLogo</a>.</p>
          <p>This web app implements the functionalities of the original model, as well as some features suggested by Dr. Wilensky.</p>
        </Container>
      </div>
    )
  }
}

export default App;
