$(document).ready(function () {


	/*  Global Variables  */

	// Weather URL
	console.log("-- || OpenWeatherMap || --");
	// &units=imperial is used in url for metric to imperial conversion
	var imperialUnits = "&units=imperial";
	// Weather API
	var apiOpenWeatherMap = "&appid=38f55767a0c60100721a848c0be8deb5";
	console.log("API:", apiOpenWeatherMap);

	/*  Todays Weather Forecast  */

	function searchWeather(searchValue) {
		console.log("--  Start seachWeather function  --");
		$.ajax({
			type: "GET",
			url:
				"https://api.openweathermap.org/data/2.5/weather?q=" +
				searchValue +
				imperialUnits +
				apiOpenWeatherMap,
			dataType: "json",
			success: function (data) {
				console.log("--  Open Weather Map Data  --");
				console.log("City Name:", data.name);
				console.log("Time of data calculation, unix, UTC:", data.dt);
				console.log("Weather Icon:", data.weather[0].icon);
				console.log("Temperature:", data.main.temp, "F");
				console.log("Humidity:", data.main.humidity, "%");
				console.log("Wind Speed:", data.wind.speed, "MPH");
				// create history link for this search
				if (history.indexOf(searchValue) === -1) {
					history.push(searchValue);
					window.localStorage.setItem("history", JSON.stringify(history));
					console.log("if History:", history);
					makeRow(searchValue);
				}
				// clear any old content
				$("#today").empty();
				$("#forecast").empty();

				// Time Conversion
				console.log("--  Time Conversion  --");
				var sec = data.dt;
				var forecastdate = new Date(sec * 1000);
				var timestr = forecastdate.toLocaleTimeString();
				var datestr = forecastdate.toLocaleDateString();
				// Day of the week conversion
				var daystr = forecastdate.getUTCDay();
				var weekday = new Array(7);
				weekday[0] = "Sunday";
				weekday[1] = "Monday";
				weekday[2] = "Tuesday";
				weekday[3] = "Wednesday";
				weekday[4] = "Thursday";
				weekday[5] = "Friday";
				weekday[6] = "Saturday";
				var weekdaystr = weekday[daystr];
				console.log("All Time Data", forecastdate);
				console.log("Local Time:", timestr);
				console.log("Local Date:", datestr);
				console.log("Day of the Week:", weekdaystr);

				// create html content for current weather
				var forecastUl = $("<div>", { id: "forecast-container" });

				var liName = $("<div>", { id: "name-div" });
				liName.text(data.name + " (" + datestr + ") ");

				var liImg = $("<div>", { id: "img-div" });
				// Render Icon � Tim A.
				var iconImg = $("<img>");
				iconImg.attr(
					"src",
					"https://openweathermap.org/img/w/" + data.weather[0].icon + ".png",
				);
				liImg.append(iconImg);

				var liTemp = $("<div>", { id: "temp-div" });
				liTemp.text("Temperature: " + Math.round(data.main.temp) + " \xB0F");

				var liHumidity = $("<div>", { id: "humid-div" });
				liHumidity.text("Humidity: " + data.main.humidity + "%");

				var liWindSpeed = $("<div>", { id: "speed-div" });
				liWindSpeed.text("Wind Speed: " + data.wind.speed + " MPH");

				var liUVIndex = $("<div>", { id: "index-div" });

				forecastUl.append(
					liName,
					liImg,
					liTemp,
					liHumidity,
					liWindSpeed,
					liUVIndex,
				);

				// merge and add to page
				$("#today").append(forecastUl);

				// call follow-up api endpoints
				getForecast(searchValue);
				console.log("getForecast:", searchValue);
				getUVIndex(data.coord.lat, data.coord.lon);
				console.log(
					"getUVIndex",
					"Lat Coord Data:",
					data.coord.lat,
					"Lon Coord Data:",
					data.coord.lon,
				);
			},
			error: function (xhr, status, error) {
				alert(
					"Result: " +
						status +
						" " +
						error +
						" " +
						xhr.status +
						" " +
						xhr.statusText,
				);
			},
		});
	}

	/* || Search Bar || */

	// when search btn is clicked use the data that is entered
	$("#search-button").on("click", function () {
		event.preventDefault();
		var searchValue = $("#search-value").val();
		// clear input box =after hitting search
		$("#search-value").val("");
		// clear input box when clicking inside box
		$("input:text").click(function () {
			$(this).val("");
			// clear today's forecast
			$("#today").empty();
			// clear five day forecast
			$("#forecast").empty();
		});
		searchWeather(searchValue);
		console.log("var searchValue =", searchValue);
	});

	/*  Search History  */

	// History
	$(".history").on("click", "li", function () {
		searchWeather($(this).text());
		console.log("History (this):", this);
	});

	// Search History List
	function makeRow(text) {
		console.log("-- || Start makeRow function || --");
		var li = $("<li>")
			// add class & name
			.addClass("list-group-item list-group-item-action")
			// add text
			.text(text);
		// append
		$(".history").append(li);
	}


	/*  Five Day Weather Forecast  */

	function getForecast(searchValue) {
		console.log("-- || Start getForecast function || --");
		$.ajax({
			type: "GET",
			// https:api.openweathermap.org/data/2.5/forecast?q=[City]&units=imperial&appid=78c8bb055391228975fd9d7974ac9137
			url:
				"https://api.openweathermap.org/data/2.5/forecast?q=" +
				searchValue +
				imperialUnits +
				apiOpenWeatherMap,
			dataType: "json",
			success: function (data) {
				// log forecast
				console.log("getForecast data:", data.list);
				// overwrite any existing content with title and empty row
				$("#forecast").empty();

				// create title "5-Day Forecast:"
				var futureTitle = $("<div>", {
					id: "future-title",
				});
				futureTitle.text("5-Day Forecast:");

				// Forecast card container
				var futureContent = $("<div>", {
					class: "card-container",
					id: "future-content",
				});

				// loop over all forecasts (by 3-hour increments)
				console.log("-- || Start Forecast for loop || --");
				// var i = 0 makes forecast start on current day
				for (var i = 0; i < data.list.length; i++) {
					// only look at forecasts around 3:00pm
					if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
						// create html elements for a bootstrap card
						var futureCard = $("<div>", {
							class: "card",
							id: "future-card",
						});
						console.log("Card:", futureCard);

						// Forecast Time Conversion
						console.log("-- || Forecast Time Loop Conversion || --");
						var futuresec = data.list[i].dt;
						var futureforecastdate = new Date(futuresec * 1000);
						var futuredatestr = futureforecastdate.toLocaleDateString();
						// Day of the week conversion
						var futuredaystr = futureforecastdate.getUTCDay();
						var futureweekday = new Array(7);
						futureweekday[0] = "Sunday";
						futureweekday[1] = "Monday";
						futureweekday[2] = "Tuesday";
						futureweekday[3] = "Wednesday";
						futureweekday[4] = "Thursday";
						futureweekday[5] = "Friday";
						futureweekday[6] = "Saturday";
						var futureweekdaystr = futureweekday[futuredaystr];

						// Date
						var futureDay = $("<h4>", {
							class: "card-title",
							id: "future-day",
						});
						futureDay.text(futureweekdaystr);
						console.log("5-Day Day of the Week", futureweekdaystr);

						var futureDate = $("<h5>", {
							class: "card-title",
							id: "future-date",
						});
						futureDate.text(futuredatestr);
						console.log("5-Date:", futuredatestr);

						// IMG Icon
						var futureImg = $("<p>", {
							class: "card-body",
							id: "future-img",
						});
						// Render Icon
						var futureIconImg = $("<img>");
						futureIconImg.attr(
							"src",
							"https://openweathermap.org/img/w/" +
								data.list[i].weather[0].icon +
								".png",
						);
						futureImg.append(futureIconImg);
						console.log("5-Icon:", data.list[i].weather[0].icon);

						// Temp
						var futureTemp = $("<p>", {
							class: "card-body",
							id: "future-temp",
						});
						futureTemp.text("Temperature: " + Math.round(data.list[i].main.temp) + " \xB0F");
						console.log("5-Temp", data.list[i].main.temp);

						//Humidity
						var futureHumidity = $("<p>", {
							class: "card-body",
							id: "future-humid",
						});
						futureHumidity.text("Humidity: " + data.list[i].main.humidity + "%");
						console.log("5-Humid:", data.list[i].main.humidity);

						// the next 5 lines are where my problem is...
						futureCard.append(
							futureDay,
							futureDate,
							futureIconImg,
							futureTemp,
							futureHumidity,
						);

						// merge together and put on page
						$("#forecast .card-container").append(futureCard);

						// render cards in container
						futureContent.append(futureCard);

						console.log("-- || End Loop #", i, " || --");
					}
				}
				// Append Forecast Title and Container
				$("#forecast").append(futureTitle, futureContent);
			},
			error: function (xhr, status, error) {
				alert(
					"Result: " +
						status +
						" " +
						error +
						" " +
						xhr.status +
						" " +
						xhr.statusText,
				);
			},
		});
	}

	/* || UV INDEX || */

	function getUVIndex(lat, lon) {
		console.log("-- || Start getUVIndex || --");
		console.log("Lattitude:", lat, "Longitude", lon);
		$.ajax({
			type: "GET",
			url:
				"https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" +
				lat +
				"&lon=" +
				lon +
				apiOpenWeatherMap,
			dataType: "json",
			success: function (data) {
				console.log("UV Data", data);
				// Find UV Index
				var uv = data[0].value;
				// uv text ro replace placeholder
				var uvText = $("<p>").text("UV Index: ");
				// Make UV btn
				var btn = $("<span>").addClass("btn btn-sm").text(data[0].value);
				console.log("UV:", uv);
				// change color depending on uv value
				if (uv > 0 && uv <= 2.99) {
					btn.addClass("low-uv");
					btn.css("color", "white");
					btn.css("background-color", "lightblue");
				} else if (uv >= 3 && uv <= 5.99) {
					btn.addClass("moderate-uv");
					btn.css("color", "white");
					btn.css("background-color", "green");
				} else if (uv >= 6 && uv <= 7.99) {
					btn.addClass("high-uv");
					btn.css("color", "white");
					btn.css("background-color", "orange");
				} else if (uv >= 8 && uv <= 10.99) {
					btn.addClass("vhigh-uv");
					btn.css("color", "white");
					btn.css("background-color", "red");
				} else {
					btn.addClass("extreme-uv");
					btn.css("color", "white");
					btn.css("background-color", "darkred");
				}
				console.log("Lo:0-2.99, Mo:3-5.99, Hi:6-7.99, vH:8-10.99, Ex:11+");
				console.log("New btn Name", btn);
				// need to append btn and add to #index-div
				$("#today #index-div").append(uvText.append(btn));
			},
			error: function (xhr, status, error) {
				alert(
					"Result: " +
						status +
						" " +
						error +
						" " +
						xhr.status +
						" " +
						xhr.statusText,
				);
			},
		});
	}

	// get current history, if any
	var history = JSON.parse(window.localStorage.getItem("history")) || [];
	console.log("-- || localStorage History Array || --");
	console.log("Current History:", history);
	console.log("History's Length:", history.length);

	if (history.length > 0) {
		searchWeather(history[history.length - 1]);
	}
	console.log("History's Length:", history.length, "if > 0 searchWeather");

	for (var i = 0; i < history.length; i++) {
		makeRow(history[i]);
	}
	console.log(
		"History's Length:",
		history.length,
		"for",
		i,
		"= 0",
		i,
		"<",
		history.length,
		"makeRow",
	);
});

$("#clear-button").on("click", function () {
	console.clear();
	// clear
	localStorage.clear();
	// reload list
	window.location.reload();
});