function updateClock() {
  const now = new Date();
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    numberingSystem: "latn",
  };
  const timeString = now.toLocaleTimeString("en-US", options);
  document.getElementById("clock").innerText = timeString;
}

setInterval(updateClock, 1000);
updateClock();

function updateDates() {
  const now = new Date();
  document.getElementById("gregorian-date").innerText = now.toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const hijriDate = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);
  document.getElementById("hijri-date").innerText = hijriDate;
}

setInterval(updateClock, 1000);
updateClock();
updateDates();

const urlParams = new URLSearchParams(window.location.search);
const city = urlParams.get("city") || "مدينتك";
document.getElementById("city-name").innerText = city;

async function updatePrayerTimes() {
  const city = document.getElementById("city-name").value || "London";
  const prayerBox = document.querySelector(".prayers");
  prayerBox.classList.add("loading");

  try {
    const { countryCode, timezone } = await getCityInfo(city);

    const today = new Date()
      .toISOString()
      .split("T")[0]
      .split("-")
      .reverse()
      .join("-"); // DD-MM-YYYY

    const url = `https://api.aladhan.com/v1/timingsByCity/${today}?city=${encodeURIComponent(
      city
    )}&country=${countryCode}&state=${encodeURIComponent(
      city
    )}&method=2&shafaq=general&midnightMode=1&timezonestring=${timezone}&calendarMethod=UAQ`;

    const response = await fetch(url);
    const data = await response.json();
    const timings = data.data.timings;

    document.getElementById("fajr-time").innerText = convertTo12Hour(
      timings.Fajr
    );
    document.getElementById("sunrise-time").innerText = convertTo12Hour(
      timings.Sunrise
    );
    document.getElementById("dhuhr-time").innerText = convertTo12Hour(
      timings.Dhuhr
    );
    document.getElementById("asr-time").innerText = convertTo12Hour(
      timings.Asr
    );
    document.getElementById("maghrib-time").innerText = convertTo12Hour(
      timings.Maghrib
    );
    document.getElementById("isha-time").innerText = convertTo12Hour(
      timings.Isha
    );
    document.getElementById("midnight-time").innerText = convertTo12Hour(
      timings.Midnight
    );
    document.getElementById("last-third-time").innerText = convertTo12Hour(
      timings.Lastthird || "N/A"
    );
  } catch (error) {
    console.error("خطأ في جلب مواقيت الصلاة:", error);
  } finally {
    setTimeout(() => {
      prayerBox.classList.remove("loading");
    }, 500);
  }
}

function convertTo12Hour(time24) {
  const [hours, minutes] = time24.split(":");
  const date = new Date();
  date.setHours(+hours, +minutes);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getCityInfo(city) {
  const apiKey = "4b6deb40d4ba42068b75ef1d7780b8e2";
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    city
  )}&key=${apiKey}&language=en`;

  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const result = data.results[0];
      const countryCode = result.components["ISO_3166-1_alpha-2"];
      const timezone = result.annotations.timezone.name;

      return { countryCode, timezone }; // <--   هنا أرجع الاتنين عشان الإستجابة ترجع مرة واحدة بس ليهم الاتنين
    });
}
