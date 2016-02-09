// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require bootstrap-sprockets
//= require_tree .


$(document).ready(function(){
    
    //establish parameters
    var token = "hFeKdC6shdP9ZVVnczcNOqP6sgMetFendPqNrPPPeAs";
    var username = "mattl22";
    var userAndToken = username + ":" + token;
    var encodedToken = window.btoa(userAndToken);
    var encodedRequest = "Basic " + encodedToken;
    
    function getWeatherData(){
        var tempArray = [];
        var timeArray = [];
        $.ajax({
            url: 'https://reports.understoryweather.com/api/v1/data/base/current?deployment=somerville',
            type: 'GET',
            dataType: 'json',
            headers: {
                'Authorization': encodedRequest
            }
        }).done(function(data) {
            console.log("get data working");
            var tempData = data;
            var stnId = "6ceceb681a5c"; // one of the 4 stations for somerville
            var len=tempData[stnId].length;
            for (var i=0; i<len; i++){
                tempArray[i] = tempData[stnId][i].val;
                timeArray[i] = timeConversion(tempData[stnId][i].timestamp);
            }
        }).fail(function(){
            console.log("The first AJAX is not working!");
        });
        return [tempArray,timeArray];
    }
    
    function getStations(){
        $.ajax({
            url: 'https://reports.understoryweather.com/api/v1/metadata/deployment/summary/somerville',
            type: 'GET',
            dataType: 'text',
            headers: {
                'Authorization': encodedRequest
            }
        }).done(function(data) {
            var data2 = JSON.parse(data);
            for(var i=0, l=data2.length; i<l; i++){
                $("#weather_table").find('tbody')
                    .append($('<tr>')
                        .append($('<td>')
                            .append(data2[i].siteName)
                        )
                        .append($('<td>')
                            .append(data2[i].siteId)
                        )
                        .append($('<td>')
                            .append(data2[i].stationName)
                        )
                        .append($('<td>')
                            .append(data2[i].stationId)
                        )
                    );
            }
        }).fail(function(){
            console.log("The 2nd AJAX is not working!");
        });
    }
    
    var TESTER = document.getElementById('tester');
// 	Plotly.plot( TESTER, [{
// 	x: [1, 2, 3, 4, 5],
// 	y: [1, 2, 4, 8, 16] }], {
// 	margin: { t: 0 } } );
	
	
    getStations();
    weatherData = getWeatherData(); 
    
    function timeConversion(millisec) {
        // Create a new JavaScript Date object based on the timestamp
        // multiplied by 1000 so that the argument is in milliseconds, not seconds.
        var date = new Date(millisec);
        // Hours part from the timestamp
        var hours = date.getHours();
        // Minutes part from the timestamp
        var minutes = "0" + date.getMinutes();
        // Seconds part from the timestamp
        var seconds = "0" + date.getSeconds();
        // Will display time in 10:30:23 format
        var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        
        return formattedTime; 
    }
    timeTest = timeConversion(1455024780000);
    
    function plotData(weatherData){
        //plotly takes 3 arugments: the DOM element plot to, plot data & attributes "traces", layout
        var weatherPlot = document.getElementById('weather_plot');
        var data = [{
            x: weatherData[1],
            y: weatherData[0]
        }];
        var layout = {
            autoscale: true,
            title: "Somerville Temperature in Last 30 Minutes",
            xaxis: {
                title: 'Time (HH:MM:SS)',
                range: ["9:00:00","11:00:00"]
            },
            yaxis: {
                title: 'Temperature C',
                range: 'auto',
            },
            margin: {
                
            },
                hovermode: 'closest'
        };
        
    	Plotly.plot( weatherPlot, data, layout);
    }
    
    plotData(weatherData);
});