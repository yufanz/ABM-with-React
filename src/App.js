import LEDDisplay from './dash-daq/components/LEDDisplay.react';
import Plot from 'react-plotly.js';
import React, { Component } from 'react'
import Slider from './dash-core-components/components/Slider.react'

import logo from './logo.svg';
import './App.css';

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

const nAgents = 10
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
      if (newX[i] > -this.state.parameters.vDebt) {
        newX[i] -= 1;
        n_benefactors += 1;
      }
    }
    for (var j = 0; j < n_benefactors; j++){
      newX[Math.floor(Math.random() * this.state.parameters.nAgents)] += 1;
    }
    var newX_sorted = newX.slice().sort(numericSort);
    var aggregate_bottom_50_pct = this.state.data.aggregate_bottom_50_pct.slice();
    aggregate_bottom_50_pct.push(newX_sorted.slice(0, this.state.parameters.nAgents*0.5).reduce(numericSum));
    var aggregate_top_10_pct = this.state.data.aggregate_top_10_pct.slice();
    aggregate_top_10_pct.push(newX_sorted.slice(this.state.parameters.nAgents*0.9).reduce(numericSum));

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
    const nAgents = this.state.parameters.nAgents
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
        <Slider
          id='nAgents'
          marks={{10:'10', 100:'100', 200:'200'}}
          max={200}
          min={10}
          onChange={(value)=>{this.updateNAgents(value)}}
          onAfterChange={(value)=>{this.updateNAgents(value)}}
          step={200}
          style={{'marginBottom': 40, 'marginLeft': 40, 'marginRight': 40, 'marginTop': 40, 'height': 100}}
          value={this.state.parameters.nAgents}
        />
        <Slider
          id='vDebt'
          marks={{0:'0', 10:'10', 20:'20', 50:'50'}}
          max={50}
          min={0}
          onChange={(value)=>{this.updateVDebt(value)}}
          onAfterChange={(value)=>{this.updateVDebt(value)}}
          step={50}
          style={{'marginBottom': 40, 'marginLeft': 40, 'marginRight': 40, 'height': 100}}
          value={this.state.parameters.vDebt}
        />
        <Slider
          id='vWealth'
          marks={{1:'1', 10:'10', 20:'20', 50:'50'}}
          max={50}
          min={1}
          onChange={(value)=>{this.updateVWealth(value)}}
          onAfterChange={(value)=>{this.updateVWealth(value)}}
          step={50}
          style={{'marginBottom': 40, 'marginLeft': 40, 'marginRight': 40, 'height': 100}}
          value={this.state.parameters.vWealth}
        />
        <button onClick={() => this.setup()} >Setup</button>
        <button onClick={() => this.step()} >Step</button>
        <button onClick={() => this.play()} >Play / Pause</button>
        <button onClick={() => this.group()} >Group</button>
        <LEDDisplay value={this.state.iterations}/>
        <LEDDisplay value={aggregate_bottom_50_pct}/>
        <LEDDisplay value={aggregate_top_10_pct}/>
        <LEDDisplay value={this.state.constants.aggregate_wealth}/>
        <Plot
          data={[{
            x: this.state.data.wealth,
            y: Array.apply(null, {length: this.state.parameters.nAgents}).map(Number.call, Number),
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
        <Plot
          data={[
            {
              x: Array.apply(null, {length: this.state.data.aggregate_bottom_50_pct.length}).map(Number.call, Number),
              y: this.state.data.aggregate_bottom_50_pct,
              type: 'scatter',
            },
            {
              x: Array.apply(null, {length: this.state.data.aggregate_bottom_50_pct.length}).map(Number.call, Number),
              y: this.state.data.aggregate_top_10_pct,
              type: 'scatter',
            },
          ]}
        />
      </div>
    )
  }
}

export default App;
