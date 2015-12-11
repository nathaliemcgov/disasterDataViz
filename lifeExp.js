// Making graph
var regions = {"UDEV":"Underdeveloped","DEVING":"Developing","DEV":"Developed"}
	,w=925,h=550,margin=30,startYear=1960,endYear=2013,startValue=0,endValue=45,y=d3.scale.linear().domain([endValue,startValue]).range
	([0+ margin,h- margin]),x=d3.scale.linear().domain([1991,2013]).range([0+ margin-5,w]),years=d3.range(startYear,endYear);
	
var vis = d3.select("#vis").append("svg:svg").attr("width",w).attr("height",h).append("svg:g");

var line = d3.svg.line().x(function(d,i) {
	return x(d.x);
}).y(function(d) {
	return y(d.y);
});

// Separating countries into development segments
var udevCountries = [];
var devCountries = [];
var devingCountries = [];
d3.text('CountrySegmentationCLEAN.csv','text/csv', function(text) {
	// parses rows of country segmentation csv file
	var segments=d3.csv.parseRows(text);
	// Adds country code to arrays based on dev level
	for (i = 1; i < segments.length; i++) {
		if (segments[i][1] == 'Underdeveloped') {
			udevCountries.push(segments[i][2]);
		} else if (segments[i][1] == 'Developing') {
			devingCountries.push(segments[i][2]);
		} else if (segments[i][1] == 'Developed') {
			devCountries.push(segments[i][2]);
		}
	}
});

// Parsing through World Bank data
var startEnd = {};
var countryName = [];
var nameAndValues = {};
var names = {};
d3.text('unemploymentCLEAN.csv','text/csv', function(text) {
	var countryData = d3.csv.parseRows(text);
	for(i = 1; i < countryData.length; i++) {
		// Gets unemployment values of current row
		var values = countryData[i].slice(2, countryData[i.length]);
		var currData = [];
		var unemploymentValues = [];

		var countryCode = countryData[i][1];
		countryName.push(countryData[i][0]);

		var started = false;
		// Loops through unemployment values of row
		//console.log(countryCode + values)
		for(j = values.length-1; j >= 0; j--) {
			if(values[j]=='') {
				values = values.slice(0,j-1)
			} else {
				break;
			}
		}
		names[countryCode] = countryData[i][0];
		nameAndValues[countryCode] = {};
		for(j = 0; j < values.length; j++) {
			nameAndValues[countryCode][years[j]] = values[j]
			if (values[j] != '') {
				// Unemployment values
				unemploymentValues[j] = values[j];

				currData.push({x : years[j], y : values[j]});
				if(!started) {
					startEnd[countryData[i][1]]={'startYear':years[j],'startVal':values[j]};
					started = true;
				} 
				if (j==values.length-1) {
					startEnd[countryData[i][1]]['endYear']=years[j];
					startEnd[countryData[i][1]]['endVal']=values[j];
					//console.log(startEnd[countryData[i][1]])
				}
			}
		}
		// Object to be used to get unemployment rates for each country "Country Code : Array of unemployment values"
		//nameAndValues[countryCode] = unemploymentValues;

		vis.append("path").data([currData]).attr("country", countryData[i][0]).attr("class", () => {
			// Gets correct className based on development level
			var className;
			if (udevCountries.indexOf(countryCode) > -1) {
				className = 'UDEV';
			} else if (devingCountries.indexOf(countryCode) > -1) {
				className = 'DEVING';
			} else if (devCountries.indexOf(countryCode) > -1) {
				className = 'DEV';
			}
			return className;
		}).attr("id", countryCode).attr("d",line).on("mouseover",onmouseover).on("mouseout",onmouseout);

		// vis.append("svg:circle").data([currData]).attr("country", countryData[i][0]).attr("class", () => {
		// 	// Gets correct className based on development level
		// 	var className;
		// 	if (udevCountries.indexOf(countryCode) > -1) {
		// 		className = 'UDEV';
		// 	} else if (devingCountries.indexOf(countryCode) > -1) {
		// 		className = 'DEVING';
		// 	} else if (devCountries.indexOf(countryCode) > -1) {
		// 		className = 'DEV';
		// 	}
		// 	return className;
		// }).attr("id", countryCode).attr("d",circ).on("mouseover",onmouseover).on("mouseout",onmouseout);
	}
});


d3.text('disasterYears.csv', 'text/csv', function(data) {
	var disYears = d3.csv.parseRows(data);

	for(i=4; i<disYears.length; i++) {
		var yearData = disYears[i].slice(1);
		var countryName = disYears[i][0]
		var countryValues = nameAndValues[countryName];
		console.log(countryValues)
		if(typeof countryValues !== 'undefined') {
			console.log("here: "+countryName)
			if(typeof countryName!== 'undefined') {
				vis.selectAll('.'+countryName)
					.data(yearData)
					.enter()
					.append('circle')
					.attr("cx", function(d) {
						value = x(d);
						yVal = y(countryValues[d]);
						if(value == 0 || isNaN(yVal) || yVal==0) {
							return null;
						} else {
							return value;
						}
					})
		 			.attr("cy", function(d) {
		 				value = y(countryValues[d]);
		 				if(!isNaN(value) && value!=0) {
		 					return value;
		 				} else {
		 					return null;
		 				}

		 			})
		 			.attr("r", .8)
		 			.attr("class",function(d) {return countryName;})
		 			//.style("fill", "black")
		 			.attr("country", names[countryName]).attr("class", () => {
						// Gets correct className based on development level
						var className;
						if (udevCountries.indexOf(countryName) > -1) {
							className = 'UDEV';
						} else if (devingCountries.indexOf(countryName) > -1) {
							className = 'DEVING';
						} else if (devCountries.indexOf(countryName) > -1) {
							className = 'DEV';
						}
						return className;
					}).attr("id", countryName).on("mouseover",onmouseover).on("mouseout",onmouseout);
		 	}
	 	}
	}
});

// var disasterYear;
// // Get the disaster data
// d3.text('disasterData.csv', 'text/csv', function(data) {
//     var disasterData = d3.csv.parseRows(data);
//     var disasterYear;
// 	for(i = 1; i < disasterData.length; i++) {
// 		var disasterValues = disasterData[i].slice(1, disasterData[i.length-1]);

// 		disasterYear = disasterData[i][10];		// Gets disaster year
// 		var disasterCountryCode = disasterData[i][2];	// Gets disaster country code

// 		// Gets all of the unemployment values of the disaster country
// 		var countryValues = nameAndValues[disasterCountryCode];

// 		// vis.append("svg:circle")
// 		// 	.data(disasterValues)
// 		// 	.attr("cx", function(d) {return d;})
// 		// 	.attr("cy", function(d) {return countryValues[2014-disasterYear];})
// 		// 	.attr("r", 2)
// 		// 	.style("fill", "black");


// 		if (countryValues.length > 0) {			// If there are unemployment values for the country
// 			var index = 2014 - disasterYear;	// Gets the index of the unemployment value we need at the correct year
// 			// var xCoordMultiplier = 45.380;

// 			var disasterUnempRate = countryValues[index];	// Unemployment rate of disaster
// 			console.log(disasterUnempRate);
// 			// X coordinate : Year of the disaster (disasterYear)
// 			// Y coordinate : Umemployment rate of country of year of disaster (disasterUnempRate)

// 			// vis.append("svg:circle")
// 			// 	.attr("cx", 25 + (disasterYear - 1990)*35.57)
// 			// 	.attr("cy", 520 - disasterUnempRate * 13.75)
// 			// 	.attr("r", 2)
// 			// 	.style("fill", "black");

// 			 // vis.append("svg:circle")
// 			 // 	.data(disasterUnempRate)
// 			 // 	.attr("cx", function(d) {return d;})
// 			 // 	.attr("cy", function(d) {return d;})
// 			 // 	.attr("r", 2)
// 			 // 	.style("fill", "black");

// 			// vis.append("svg:circle").data([currData]).attr("country", countryData[i][0]).vis.append("svg:circle").data([currData]).attr("country", countryData[i][0]).attr("class", () => {
// 			// 	// Gets correct className based on development level
// 			// 	var className;
// 			// 	if (udevCountries.indexOf(countryCode) > -1) {
// 			// 		className = 'UDEV';
// 			// 	} else if (devingCountries.indexOf(countryCode) > -1) {
// 			// 		className = 'DEVING';
// 			// 	} else if (devCountries.indexOf(countryCode) > -1) {
// 			// 		className = 'DEV';
// 			// 	}
// 			// 	return className;
// 			// }).attr("id", countryCode).attr("d",circ).on("mouseover",onmouseover).on("mouseout",onmouseout);.attr("id", countryCode).attr("d",line).on("mouseover",onmouseover).on("mouseout",onmouseout);


			
// 			// Trying to append points to graph
// 			// vis.select(graphDisplay).append("svg").data(disasterUnempRate).attr("country", disasterCountryCode).attr("class", () => {
// 			// 	// Gets correct className based on development level
// 	  //       	var disasterClass;
// 			// 	if (udevCountries.indexOf(disasterCountryCode) > -1) {
// 			// 		disasterClass = 'UDEV';
// 			// 	} else if (devCountries.indexOf(disasterCountryCode) > -1) {
// 			// 		disasterClass = 'DEV';
// 			// 	} else if (devingCountries.indexOf(disasterCountryCode) > -1) {
// 			// 		disasterClass = 'DEVING';
// 			// 	}
// 			// 	return disasterClass;
// 			// });
// 		}
// 	}
// });

// Makes x axis
vis.append("svg:line").attr("x1",x(1991)).attr("y1",y(startValue)).attr("x2",x(2012)).attr("y2",y(startValue)).attr("class","axis");
vis.append("text").style("text-anchor","middle").text("Year").attr("x",450).attr("y",540);

vis.append("svg:line").attr("x1",x(startYear)).attr("y1",y(startValue)).attr("x2",x(startYear)).attr("y2",y(endValue)).attr("class","axis")


vis.selectAll(".xLabel").data(x.ticks(5)).enter().append("svg:text").attr("class","xLabel").text(String).attr("x",function(d) {
	return x(d)
}).attr("y",h-10).attr("text-anchor","middle")

// Adds labels to y axis
vis.selectAll(".yLabel").data(y.ticks(4)).enter().append("svg:text").attr("class","yLabel").text(String).attr("x",0).attr("y",function(d) {
	return y(d)
}).attr("text-anchor","right").attr("dy",3)

vis.selectAll(".xTicks").data(x.ticks(5)).enter().append("svg:line").attr("class","xTicks").attr("x1",function(d) {
	return x(d);
}).attr("y1",y(startValue)).attr("x2",function(d) {
	return x(d);
}).attr("y2",y(startValue)+7)

vis.selectAll(".yTicks").data(y.ticks(4)).enter().append("svg:line").attr("class","yTicks").attr("y1",function(d){return y(d);
}).attr("x1",x(1959.5)).attr("y2",function(d){return y(d);}).attr("x2",x(1960))

function onclick(d,i) {
	var currClass = d3.select(this).attr("class");
	if (d3.select(this).classed('selected')) {
		d3.select(this).attr("class", currClass.substring(0,currClass.length-9));
	} else {
		d3.select(this).classed('selected', true);
	}
}

// Gets the total number of disasters that happened in each country
var disasterTotals = {};
d3.text('countryStatsForDisasters4andUp.csv', 'text/csv', function(data) {
    var disasterTotalData = d3.csv.parseRows(data);
	for(i = 1; i < disasterTotalData.length; i++) {
		disasterTotals[disasterTotalData[i][0]] = disasterTotalData[i][1];
	}
});

// Functionality of when user mouses over line
function onmouseover(d, i) {
	var currClass = d3.select(this).attr("class");
	d3.select(this).attr("class", currClass + " current");

	var country = $(this).attr("country");		// Gets the country hovered over
	var countryCode = $(this).attr("id");
	var countryVals = startEnd[countryCode];

	var countryDisasterTotal = disasterTotals[countryCode];
	
	var blurb= '<h2>' + countryName[countryName.indexOf(country)] + '</h2>';
	if (countryDisasterTotal) {	
		blurb += "<p>Experienced " + countryDisasterTotal + " disasters from 1991 through 2014.</p>";
	}

	$("#default-blurb").hide();
	$("#blurb-content").html(blurb);
}

function onmouseout(d,i) {
	var currClass=d3.select(this).attr("class");
	var prevClass=currClass.substring(0, currClass.length - 8);
	d3.select(this).attr("class", prevClass);
	$("#default-blurb").show();
	$("#blurb-content").html('');
}

function showRegion(countryDev) {
	var countries = d3.selectAll('path.' + countryDev);
	if(countries.classed('highlight')) {		// Add 'highlight' class to all lines that match development class
		countries.attr("class", countryDev);
	} else {
		countries.classed('highlight',true);
	}
}