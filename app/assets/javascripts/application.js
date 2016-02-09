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
    
    //establish API access parameters
    var token = "hFeKdC6shdP9ZVVnczcNOqP6sgMetFendPqNrPPPeAs";
    var username = "mattl22";
    var userAndToken = username + ":" + token;
    var encodedToken = window.btoa(userAndToken);
    var encodedRequest = "Basic " + encodedToken;
    
    //============== FUNCTION DEFINITIONS =============== //
    function getStations(deployment){
        $.ajax({
            url: 'https://reports.understoryweather.com/api/v1/metadata/deployment/summary/'+deployment,
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
                            .append(data2[i].deployment)
                        )
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
    function getStationId(deployment){
        var deploymentId=[];
        $.ajax({
            url: 'https://reports.understoryweather.com/api/v1/metadata/deployment/summary/'+deployment,
            type: 'GET',
            dataType: 'json',
            headers: {
                'Authorization': encodedRequest
            }
        }).done(function(data) {
            var depId = data[0].stationId;
            deploymentId[0] = depId;
        });
        return deploymentId;
    }
    function getWeatherData(deployment,deploymentId){
        var tempArray = [];
        var timeArray = [];
        $.ajax({
            url: 'https://reports.understoryweather.com/api/v1/data/base/current?deployment='+deployment,
            type: 'GET',
            dataType: 'json',
            headers: {
                'Authorization': encodedRequest
            }
        }).done(function(data) {
            
            var tempData = data;
            var stnId = deploymentId; // one of the 4 stations for somerville
            console.log("get data working stationid"+stnId);
            var len=tempData[stnId].length;
            for (var i=0; i<len; i++){
                tempArray[i] = tempData[stnId][i].val*1.8 + 32;
                timeArray[i] = timeConversion(tempData[stnId][i].timestamp);
            }
        }).fail(function(){
            console.log("The first AJAX is not working!");
        });
        return [tempArray,timeArray];
    }
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
    function plotData(weatherData){
        //plotly takes 3 arugments: the DOM element plot to, plot data & attributes "traces", layout
        var weatherPlot = document.getElementById('weather_plot');
        
        var data = [{
            x: weatherData[1],
            y: weatherData[0]
        }];
        var layout = {
            autoscale: true,
            title: " Temperature in Last 30 Minutes",
            xaxis: {
                title: 'Time (HH:MM:SS)'
            },
            yaxis: {
                title: 'Temperature \u00b0F'
            },
            margin: {
                
            },
                hovermode: 'closest'
        };
    	Plotly.plot( weatherPlot, data, layout);
    }
    function updatePlotAxes(){ 
        document.querySelector('[data-title="Autoscale"]').click();
        console.log("Updating the plot axes now!");
        
    }
    function updatePlots(){
        Plotly.deleteTraces(document.getElementById('weather_plot'), [0,1]);
        var updatedSomervilleData = getWeatherData('somerville','6ceceb681a5c');
        var updatedDallasData = getWeatherData('dallas','6ceceb6634e8');
        
        plotData(updatedSomervilleData);
        plotData(updatedDallasData);
        setTimeout(updatePlotAxes,400);
        console.log('updating plot data and axes');
    }
    
    //============== FUNCTION CALLS =============//
    //-- call initial stations and weather data for Somerville & Dallas
    getStations('somerville');
    getStations('dallas');
    
    
    
    // var somervilleStationId = getStationId('somerville');
    
    var somervilleWeatherData = getWeatherData('somerville','6ceceb681a5c');
    
    var dallasWeatherData = getWeatherData('dallas', '6ceceb6634e8');
    //-- plot initial somerville data
    plotData(somervilleWeatherData);
    plotData(dallasWeatherData);
    
    //-- update axes to fit initial dataset
    setTimeout(updatePlotAxes,400);
    //-- update with fresh data and update chart every 30 seconds
    window.setInterval(updatePlots, 30000);
    
    
});

 