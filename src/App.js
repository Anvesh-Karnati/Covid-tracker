import './App.css';
import { FormControl, MenuItem, Select, Card, CardContent } from '@material-ui/core';
import { useState, useEffect } from 'react';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { sortData, prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import GraphContent from './GraphContent';

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [vaccine, setVaccine] = useState({});

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all").then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, [])
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/vaccine/coverage?lastdays=30")
        .then((response) => response.json())
        .then((data) => {
          const vaccine = {
            todayVaccine: (data[Object.keys(data)[Object.keys(data).length - 2]] - data[Object.keys(data)[Object.keys(data).length - 3]]),
            totalVaccine: data[Object.keys(data)[Object.keys(data).length - 1]]
          }
          setVaccine(vaccine);
          fetch("https://disease.sh/v3/covid-19/countries")
            .then((response) => response.json())
            .then((data) => {
              const countries = data.map((country) => (
                {
                  name: country.country,
                  value: country.countryInfo.iso2,
                  cases: country.cases,
                  deaths: country.deaths,
                  countryInfo: country.countryInfo,
                  recovered: country.recovered,
                  tests: country.tests,
                  vaccine: vaccine.totalVaccine,
                  active: country.active
                }));
              let sortedData = sortData(data);
              setCountries(countries);
              setMapCountries(countries);
              setTableData(sortedData);
            });
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;
    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' :
      `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);
        countryCode === "worldwide"
          ? setMapCenter([34.80746, -40.4796])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });

    const urlVaccine = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/vaccine/coverage?lastdays=30' :
      `https://disease.sh/v3/covid-19/vaccine/coverage/countries/${countryCode}?lastdays=30`;
    await fetch(urlVaccine)
      .then((response) => response.json())
      .then((data) => {
        const vaccine = countryCode === 'worldwide' ? ({
          todayVaccine: (data[Object.keys(data)[Object.keys(data).length - 2]] - data[Object.keys(data)[Object.keys(data).length - 3]]),
          totalVaccine: data[Object.keys(data)[Object.keys(data).length - 1]]
        }) : ({
          todayVaccine: (data.timeline[Object.keys(data.timeline)[Object.keys(data.timeline).length - 2]] - data.timeline[Object.keys(data.timeline)[Object.keys(data.timeline).length - 3]]),
          totalVaccine: data.timeline[Object.keys(data.timeline)[Object.keys(data.timeline).length - 1]]
        })
        setVaccine(vaccine)
      });
  };
  return (
    <div>
      <div className="app">

        <div className="app__left">
          <div className="app__header">
            <h1>COVID-19 TRACKER</h1>
            <button
              type="button" className="app__button"
              onClick={(e) => {
                e.preventDefault();
                window.open("https://dashboard.cowin.gov.in/", "_blank")
              }}
            > Co-Win Statistics</button>

            <FormControl className="app__dropdown">
              <Select
                onChange={onCountryChange}
                variant="outlined" value={country} >
                <MenuItem value="worldwide">Worldwide</MenuItem>
                {
                  countries.map(country => (
                    <MenuItem value={country.value}>{country.name}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </div>
          <div className="app_stats">
            <InfoBox onClick={e => setCasesType('cases')} isRed
              active={casesType === "cases"}
              title="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)}
              total={prettyPrintStat(countryInfo.cases)} />
            <InfoBox onClick={e => setCasesType('recovered')} active={casesType === "recovered"}
              title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)}
              total={prettyPrintStat(countryInfo.recovered)} />
            <InfoBox onClick={e => setCasesType('deaths')} isRed active={casesType === "deaths"}
              title="Death" cases={prettyPrintStat(countryInfo.todayDeaths)}
              total={prettyPrintStat(countryInfo.deaths)} />
            <InfoBox onClick={e => setCasesType('vaccine')} active={casesType === "vaccine"}
              title="Vaccinated" cases={prettyPrintStat(vaccine.todayVaccine)}
              total={prettyPrintStat(vaccine.totalVaccine)} />
          </div>
          <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom} />
        </div>
        <Card className="app__right">
          <CardContent>
            <h3>Live Cases by Countries</h3>
            <Table countries={tableData} />
            <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
            <LineGraph className="app__graph" casesType={casesType} />
          </CardContent>
        </Card>

      </div>

      <div className="app__down">
        <h3 className="app__graphTitle">COVID-19 Stats</h3>
        <GraphContent country={country} className="app__content" />
      </div>
      <p class="app__footer">Made by Anvesh Karnati | Theme by Clever Programming  </p>
      <p class="app__footerCredits">Credits: Pallavi Reddy</p>
    </div>
  );
}

export default App;
