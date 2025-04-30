import React, { useState, useEffect, useRef } from "react";
import "./Weather.css";
import humidity from "../assets/humidity.png";
import windspeed from "../assets/windspeed.png";
import nextbtn from "../assets/nextbtn.png";
import backbtn from "../assets/backbtn.png";
import searchicon from "../assets/searchicon.png";

const API_KEY = import.meta.env.VITE_APP_ID;
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [error, setError] = useState("");
  const [photographer, setPhotographer] = useState("");
  const [forecastData, setForecastData] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  const inputRef = useRef();

  const fetchBackgroundImage = async (weatherCondition) => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${weatherCondition}&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      const data = await response.json();
      setBackgroundImage(data.urls.regular);
      setPhotographer({ name: data.user.name, url: data.user.links.html });
    } catch (error) {
      console.error("Error fetching background image:", error);
    }
  };

  const search = async (city) => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }
    setError("");

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      const icon = data.weather[0].icon;
      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temp: Math.floor(data.main.temp),
        location: `${data.name}, ${data.sys.country}`,
        icon: `https://openweathermap.org/img/wn/${icon}@2x.png`,
      });
      fetchBackgroundImage(`${data.name} ${data.weather[0].main} weather`);

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
      );
      const forecastData = await forecastResponse.json();

      if (forecastResponse.ok) {
        const uniqueDays = [];
        const dailyForecast = forecastData.list.filter((entry) => {
          const date = new Date(entry.dt * 1000).toDateString();
          if (!uniqueDays.includes(date)) {
            uniqueDays.push(date);
            return true;
          }
          return false;
        });
        setForecastData(dailyForecast);
      }
    } catch (error) {
      console.error("Error in searching data:", error);
      setWeatherData(null);
    }
  };

  const next = () => {
    if (startIndex < forecastData.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const prev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  useEffect(() => {
    if (forecastData.length > 0) {
      const currentWeatherCondition = forecastData[startIndex].weather[0].main;
      fetchBackgroundImage(`${currentWeatherCondition} weather`);
    }
  }, [startIndex, forecastData]);

  useEffect(() => {
    search("Lagos");
  }, []);

  return (
    <div
      className="weather"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <form
        className="searchbar"
        onSubmit={(e) => {
          e.preventDefault();
          search(inputRef.current.value);
          inputRef.current.blur();
        }}
      >
        <div className="searchbar">
          <input ref={inputRef} type="text" placeholder="Search" />
          <span onClick={() => search(inputRef.current.value)}>
            <img src={searchicon} />
          </span>
        </div>
      </form>
      {error && <p className="error">{error}</p>}
      {weatherData && (
        <>
          {forecastData.length > 0 && (
            <div className="forecast-section">
              <div className="forecast-container">
                <button onClick={prev} disabled={startIndex === 0}>
                  <img src={backbtn} title="Previous day" />
                </button>
                {forecastData
                  .slice(startIndex, startIndex + 1)
                  .map((day, index) => (
                    <div key={index} className="forecast-day">
                      <p>{new Date(day.dt * 1000).toDateString()}</p>
                      <img
                        src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                        alt={day.weather[0].description}
                      />
                      <p className="temperature">
                        {Math.floor(day.main.temp)}°C
                      </p>
                      <p className="description">
                        {day.weather[0].description}
                      </p>
                    </div>
                  ))}
                <button
                  onClick={next}
                  disabled={startIndex + 1 >= forecastData.length}
                >
                  <img src={nextbtn} title="Next day" />
                </button>
              </div>
            </div>
          )}
          <div className="weatherdata">
            <div className="col">
              <img src={humidity} alt="" />
              <div className="humidity">
                <p>{weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>
            <p className="location">{weatherData.location}</p>
            <div className="col">
              <img src={windspeed} alt="" />
              <div className="windspeed">
                <p>{weatherData.windSpeed} km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
          <div className="footer">
            {photographer && (
              <p className="unsplash-credit">
                Background photo by{" "}
                <a
                  href={photographer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {photographer.name}
                </a>{" "}
                on Unsplash
              </p>
            )}
            <p>
              Powered by{" "}
              <a
                href="https://openweathermap.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenWeather
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Weather;
