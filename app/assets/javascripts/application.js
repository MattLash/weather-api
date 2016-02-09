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
    //create DOM element for Plot
    var weatherPlot = document.getElementById('weather_plot');
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
        return [tempArray,timeArray,deployment];
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
        
        var data = [{
            
            x: weatherData[1],
            y: weatherData[0],
            name: capitalizeFirstLetter(weatherData[2])
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
    	setTimeout(function(){document.querySelector('[data-title="Autoscale"]').click();},400);
    	setTimeout(function(){document.querySelector('[data-title="Autoscale"]').click();},1000);
    }
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
   
    //============== FUNCTION CALLS =============//
    //-- Populate table with station data for Somerville & Dallas
    getStations('somerville');
    getStations('dallas');
    
    //cache frequent variables
    var $SB =  $('#somerville-button');
    var $DB = $('#dallas-button');
    var $autoscale = document.querySelector('[data-title="Autoscale"]');
    
    //-- User Buttons
    $SB.click(function(){
        
        if( $SB.hasClass('active') && $DB.hasClass('active') ){
            Plotly.deleteTraces(weatherPlot, [-2,-1]);
            var dallasWeatherData = getWeatherData('dallas', '6ceceb6634e8');
            plotData(dallasWeatherData);
            $SB.removeClass('active');
        }else if($SB.hasClass('active')){
            Plotly.deleteTraces(weatherPlot, 0);
            $SB.removeClass('active');
        }else{
            var somervilleWeatherData = getWeatherData('somerville','6ceceb681a5c');
            plotData(somervilleWeatherData);
            $SB.addClass('active');
        }
    });
    
    $DB.click(function(){
        if( $SB.hasClass('active') && $DB.hasClass('active') ){
            Plotly.deleteTraces(weatherPlot, [-2,-1]);
           var somervilleWeatherData = getWeatherData('somerville','6ceceb681a5c');
            plotData(somervilleWeatherData);
            $DB.removeClass('active');
        }else if( $DB.hasClass('active')){
            Plotly.deleteTraces(weatherPlot, 0);
            $DB.removeClass('active');
        }else{
            var dallasWeatherData = getWeatherData('dallas', '6ceceb6634e8');
            plotData(dallasWeatherData);
            $DB.addClass('active');
        }
    });
     
    // function to refresh active plots
    function updatePlots(){
        
        if( $SB.hasClass('active') && $DB.hasClass('active') ){
            //if both are active, then refresh both
            Plotly.deleteTraces(weatherPlot, [-2,-1]);
            var updatedSomervilleData = getWeatherData('somerville','6ceceb681a5c');
            var updatedDallasData = getWeatherData('dallas','6ceceb6634e8');
            plotData(updatedSomervilleData);
            plotData(updatedDallasData);
            setTimeout(function(){$autoscale.click();},400);
        }else if( $DB.hasClass('active')){
            //if only dallas is active, refresh dallas
            Plotly.deleteTraces(weatherPlot, 0);
            var updatedDallasData = getWeatherData('dallas','6ceceb6634e8');
            setTimeout(function(){$autoscale.click();},400);
            plotData(updatedDallasData);
        }else if($SB.hasClass('active')){
            //refresh somerville if active
            Plotly.deleteTraces(weatherPlot, 0);
            var updatedSomervilleData = getWeatherData('somerville','6ceceb681a5c');
            plotData(updatedSomervilleData);
            setTimeout(function(){$autoscale.click();},400);
        }else{
            
        }
      
    }

    window.setInterval(updatePlots, 30000);
    
});

 