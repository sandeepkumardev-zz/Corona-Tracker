import React from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
} from "@material-ui/core";
import "./App.css";
import Infobox from "./components/Infobox";
import Table from "./components/Table";
import Map from "./components/Map";
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./components/LineGraph";
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = React.useState([]);
  const [country, setCountry] = React.useState("worldwide");
  const [countryInfo, setCountryInfo] = React.useState([]);
  const [tableData, setTableData] = React.useState([]);

  const [mapCenter, setMapCenter] = React.useState({
    lat: 23.80746,
    lng: 80.4796,
  });
  const [mapZoom, setMapZoom] = React.useState(3);

  const [mapCountries, setMapCountries] = React.useState([]);

  const [casesType, setCasesType] = React.useState("cases");

  // get country name ............................
  React.useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((res) => res.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));

          // sort data using util.js file
          const sortedData = sortData(data);
          setTableData(sortedData);

          setCountries(countries);

          setMapCountries(data);
        });
    };
    getCountriesData();
  }, []);

  // for worldwide data ...........................
  React.useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((res) => res.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  // onchange data of input .......................
  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // update the country code
        setCountry(countryCode);

        // store the all data
        setCountryInfo(data);

        try {
          setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
          setMapZoom(4);
        } catch (error) {
          setMapCenter({
            lat: 23.80746,
            lng: 80.4796,
          });
          setMapZoom(3);
        }
      });
  };

  return (
    <div className="App">
      <div className="app__left">
        <div className="app__header">
          <h1> Covid-19 Tracker</h1>
          <FormControl className="app_dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {/* loop all the country */}
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <Infobox
            isRed
            active={casesType === "cases"}
            title="Infected"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={countryInfo.cases}
            onClick={(e) => setCasesType("cases")}
          />
          <Infobox
            active={casesType === "recovered"}
            title="Recovered"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={countryInfo.recovered}
            onClick={(e) => setCasesType("recovered")}
          />
          <Infobox
            isRed
            active={casesType === "deaths"}
            title="Deaths"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={countryInfo.deaths}
            onClick={(e) => setCasesType("deaths")}
          />
        </div>

        <Map
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
          casesType={casesType}
        />
      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live cases by country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
