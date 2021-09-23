import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import numeral from 'numeral';

const options= {
    maintainAspectRatio: false,
    responsive: true,
    elements: {
        point: {
            radius: 0,
        },
    },
    tooltips: {
        mode: "index",
        intersect: false,
        
        callbacks: {
            label: function (tooltipItem, data) {
                return numeral(tooltipItem.value).format("+0,0");
            },
        },
    },
    scales: {
        xAxes: [{
            type: "time",
            time: {
                format: "MM/DD/YY",
                tooltipFormat: "ll",
            },
            ticks: { display: true },
            gridLines: {
                display: true,
                drawBorder: true
            }
        }],
        yAxes: [{
           max:5000000000,
           min:0,
            stepSize: 20000000,
            ticks: {
                callback: function (value, index, values) {
                    return numeral(value).format("0a");
                }
            },
            gridLines: {
                display: true,
                drawBorder: true
            },
            
        }]
   
   
    }
  }



function GraphContent({ country,...props }) {
    const [data, setData] = useState({});
    
    const buildChartData = (data) => {
      
let fullChartData=[];
        for(let item in data){
            let chartData = [];
            for (let date in data.cases) {

                let newDataPoint = {
                    x: date,
                    y: data[item][date],
                };
                chartData.push(newDataPoint);
            }
            let obj = {};
            obj[item] = chartData;
            fullChartData.push(obj)
        }
       


        return fullChartData;
    };

    useEffect(() => {
        const fetchData = async () => {
            country==='worldwide'? (await fetch("https://disease.sh/v3/covid-19/vaccine/coverage?lastdays=120")
                .then((response) => {
                    return response.json();
                })
                .then((dataVaccine) => {
                    
                    fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=120")
                        .then((response) => {
                            return response.json();
                        })
                        .then((data) => {
                            const dataItem = {
                                ...data,
                                vaccine: dataVaccine
                            }                       
                            let chartData = buildChartData(dataItem);
                           
                            setData(chartData);
                        })
                })
            ):(await fetch(`https://disease.sh/v3/covid-19/vaccine/coverage/countries/${country}?lastdays=120`)
            .then((response) => {
                return response.json();
            })
            .then((dataVaccine) => {
                
                fetch(`https://disease.sh/v3/covid-19/historical/${country}?lastdays=120`)
                    .then((response) => {
                        return response.json();
                    })
                    .then((data) => {
                        const dataItem = {
                            ...data.timeline,
                            vaccine: dataVaccine.timeline
                        }                       
                        let chartData = buildChartData(dataItem);                       
                        setData(chartData);
                    })
            }))
        }

        fetchData();
    }, [country]);
    return (
        <div className={props.className} >
            { data?.length > 0 &&
        <Line
          options={options}
          data={{
            datasets: [{
              label:"Cases",
              borderColor: "#CC1034",
              lineTension: 0.5,
              data: data[0].cases,
              fill: false,
            },{
                label:"Deaths",
                borderColor: "#21618C",
                data: data[1].deaths,
                lineTension: 0.5,
                fill: false,

            },{
                label:"Recovered",
                borderColor: "#7dd71d",
                fill: false,
                data: data[2].recovered,
                lineTension: 0.5,

            },{
                label:"Vaccine",
                borderColor: "#742774",
                lineTension: 0.5,
                fill: false,
                data: data[3].vaccine

            }]
          }}
        />}
        </div>
    )
}

export default GraphContent
