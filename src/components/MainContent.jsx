import { Divider } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Prayer from './Prayer';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import axios from 'axios';
import { useState, useEffect } from 'react';
import moment from 'moment';
import "moment/dist/locale/ar-dz";

export default function MainContent() {

  // STATES
  const [nextPrayerIndex, setNextPrayerIndex] = useState(0);
  const [selectedCity, setSelectedCity] = useState({
    displayName: "المدينة المنورة",
    apiName: "Medina"
  });

  const avilableCities = [
    {
      displayName: "المدينة المنورة",
      apiName: "Medina"
    },
    {
      displayName: "مكة",
      apiName: "MedMakkah al Mukarramahina"
    },
    {
      displayName: "الرياض",
      apiName: "Riyadh"
    }
  ];

  const prayersArray = [
    { key: "Fajr", displayName: "الفجر" },
    { key: "Dhuhr", displayName: "الظهر" },
    { key: "Asr", displayName: "العصر" },
    { key: "Maghrib", displayName: "المغرب" },
    { key: "Isha", displayName: "العشاء" },

  ]

  // State for prayer time 
  const [timings, setTimings] = useState({
    Fajr: "04:51",
    Dhuhr: "12:15",
    Asr: "15:42",
    Maghrib: "18:20",
    Isha: "19:50"
  });

  const [today, setToday] = useState("");

  const [remainingTime, setRemainingTime] = useState();

  // To get time from api
  const getTimings = async () => {
    const response = await axios.get(`https://api.aladhan.com/v1/timingsByCity?city=${selectedCity.apiName}&country=SA&method=4`);
    setTimings(response.data.data.timings);
    console.log("api")
  }

  // To update timeing of city
  useEffect(() => {
    getTimings();
  }, [selectedCity])

  useEffect(() => {
    let interval = setInterval(() => {
      setupCountDownTimer();
    }, 1000);

    const t = moment().locale("ar-dz");
    setToday(t.format('MMM Do YYYY | H:mm'))

    return () => {
      clearInterval(interval);
    }
  }, [timings]);

  const setupCountDownTimer = () => {
    const momentNow = moment();

    let prayerIndex = null;

    if (momentNow.isAfter(moment(timings["Fajr"], "hh:mm")) &&
      momentNow.isBefore(moment(timings["Dhuhr"], "hh:mm"))) {
      prayerIndex = 1;
      console.log("next prayer is Dhuhr");

    } else if (momentNow.isAfter(moment(timings["Dhuhr"], "hh:mm")) &&
      momentNow.isBefore(moment(timings["Asr"], "hh:mm"))) {
      prayerIndex = 2;
      console.log("next prayer is Asr");

    } else if (momentNow.isAfter(moment(timings["Asr"], "hh:mm")) &&
      momentNow.isBefore(moment(timings["Maghrib"], "hh:mm"))) {
      prayerIndex = 3;
      console.log("next prayer is Maghrib");

    } else if (momentNow.isAfter(moment(timings["Maghrib"], "hh:mm")) &&
      momentNow.isBefore(moment(timings["Isha"], "hh:mm"))) {
      prayerIndex = 4
      console.log("next prayer is Isha");

    } else {
      prayerIndex = 0
      console.log("next prayer is Fajr");
    }
    setNextPrayerIndex(prayerIndex);

    // now after knowing what the next prayer is, we can setup the timer by getiing the prayers time
    const nextPrayerObject = prayersArray[prayerIndex];
    const nextPrayerTime = timings[nextPrayerObject.key];
    const nextPrayerTimeMoment = moment(nextPrayerTime, "hh:mm");

    let remainingTime = moment(nextPrayerTime, "hh:mm").diff(momentNow);
    if (remainingTime < 0) {
      const midnightDiff = moment("23:59:59", "hh:mm:ss").diff(momentNow);
      const fajrToMidNightDiff = nextPrayerTimeMoment.diff(moment("00:00:00", "hh:mm:ss"));
      const totalDiffernce = midnightDiff + fajrToMidNightDiff;
      remainingTime = totalDiffernce;
      console.log(fajrToMidNightDiff)
    }

    const durationRemainingTime = moment.duration(remainingTime);
    console.log("aaaa", durationRemainingTime.hours(), ":", durationRemainingTime.minutes(), ":", durationRemainingTime.seconds());
    setRemainingTime(`${durationRemainingTime.seconds()} : ${durationRemainingTime.minutes()} : ${durationRemainingTime.hours()}`);


  }

  const handleCityChange = (event) => {
    const cityObject = avilableCities.find((city) => {
      return city.apiName == event.target.value;
    })
    setSelectedCity(cityObject);
    // console.log(event);
  };

  return (
    <>
      {/* Top Row */}
      <Grid container>
        <Grid xs={6}>
          <div>
            <h2>
              {today}
            </h2>
            <h1>{selectedCity.displayName}</h1>
          </div>
        </Grid>
        <Grid xs={6}>
          <div>
            <h2>
              متبقي حتى صلاة {prayersArray[nextPrayerIndex].displayName}
            </h2>
            <h1 >{remainingTime}</h1>
          </div>
        </Grid>
      </Grid>
      {/* Top Row */}
      <Divider style={{ borderColor: "white", opacity: "0.1" }} />

      {/* Prayers Card */}
      <Stack direction="row" justifyContent="space-around" style={{ marginTop: "50px" }}>
        <Prayer name="الفجر" time={timings.Fajr} img="src/assets/img/fajr-prayer.png" />
        <Prayer name="الظهر" time={timings.Dhuhr} img="src/assets/img/dhhr-prayer-mosque.png" />
        <Prayer name="العصر" time={timings.Asr} img="src/assets/img/asr-prayer-mosque.png" />
        <Prayer name="المغرب" time={timings.Maghrib} img="src/assets/img/sunset-prayer-mosque.png" />
        <Prayer name="العشاء" time={timings.Isha} img="src/assets/img/night-prayer-mosque.png" />
      </Stack>
      {/* Prayers Card */}

      {/* SELECT CITY */}
      <Stack direction="row" justifyContent="center" style={{ marginTop: "40px" }}>
        <FormControl style={{ width: "20%" }}>
          <InputLabel id="demo-simple-select-label">
            <span style={{ color: "white" }}>المدينة</span>
          </InputLabel>
          <Select
            style={{ color: "white" }}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Age"
            // value={selectedCity.displayName}
            onChange={handleCityChange}
          >
            {avilableCities.map((city) => {
              return (
                <MenuItem value={city.apiName} key={city.apiName} >{city.displayName}</MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Stack>
      {/* SELECT CITY */}

    </>
  );
}