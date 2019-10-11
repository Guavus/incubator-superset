/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/* eslint-disable no-param-reassign */
import React from 'react';
import PropTypes from 'prop-types';

import 'chart.js';
import 'chartjs-plugin-annotation';
import './Chartjs.css'

const propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    xField:PropTypes.string,
    yField:PropTypes.string,
    showAnnotationLine:PropTypes.bool,
    annotationLineValue:PropTypes.number,
  };
  const defaultProps = {
    width: '100%',
    height: '100%',
    data: undefined,
    xField: undefined,
    yField:undefined,
    showAnnotationLine:true,
    annotationLineValue:1,
  };
  
  class ChartJSVis extends React.PureComponent {
    constructor(props) {
      super(props);
    }

    renderChart(){
        var ctx = document.getElementById('chartjs-line-cvs').getContext('2d');
        var config = this.createConfig();
        // console.log(config);
        new Chart(ctx, config);
    }

    createConfig(){
        const {width,height,data,xField,yField,showAnnotationLine,annotationLineValue} = this.props
        let labels =[];
        let chartData = [];
        data.forEach(element => {
            labels.push(element[yField]);
            chartData.push(
                {
                    x: element[xField],
                    y: element[yField]
                }
            )
         
        });
        return {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: "",
                    fill: true,
                    backgroundColor: 'red',
                    borderColor: 'red',
                    pointRadius: 7,
                    pointHoverRadius: 10,
                    data: chartData
                }]
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'linear',
                        position: 'bottom',
                        gridLines: {
                            display: false
                        }
                    }],
                    yAxes: [{
                        type: 'category',
                        position: 'left',
                        gridLines: {
                            display: false
                        }
                    }]
                },
                responsive: true,
                showLines: false,
                title: {
                    display: true,
                    text: ''
                },
                legend: {
                    display: false
                },
                elements: {
                    point: {
                        pointStyle: 'circle',
                    }
                },
                annotation: {
                    annotations: this.getAnnotations(showAnnotationLine,annotationLineValue)
                }

            },

        }
    }

    getAnnotations(show, value) {
        if (!show) {
            return []
        }
        return [{
            drawTime: "beforeDatasetsDraw",
            id: "hline",
            type: "line",
            mode: "vertical",
            scaleID: "x-axis-0",
            value: value,
            borderColor: "black",
            borderWidth: 2,
            borderDash: [2, 2],
        }
        ]
    }
    
    render() {
        let style = {display: 'block',height:this.props.height,width:this.props.width}
        return (
            <div style ={style}>
                <canvas id="chartjs-line-cvs" className="chartjs-render-monitor"
                   style={style}></canvas>
            </div>
        )
    }

    componentDidMount() {
        this.renderChart();
    }
}

ChartJSVis.propTypes = propTypes;
ChartJSVis.defaultProps = defaultProps;

export default ChartJSVis;