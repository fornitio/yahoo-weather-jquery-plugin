(function($, undefined) {
	'use strict';
	$.fn.jahooWeather = function(p1) {
		const fahrenheitToCelsius = (f) => Math.ceil((f-32)/1.8);
		const config = {
			method : 'GET',
		    mode : 'cors'
		}
		const defaults = {
			image : '',
			description : 'Waiting for forecast from Yahoo! Weather.',
			date : new Date(),
			tHigh : '',
			tLow : '',
			condition : '',
			temp : ''
		}
		const location = new Promise(function(res,rej){
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(res, rej);
			} else rej('Browser doesn\'t support Geolocation');
		});
		location
			.then((location)=>{
				const query = `select * from weather.forecast where woeid in (SELECT woeid FROM geo.places WHERE text="(${location.coords.latitude},${location.coords.longitude})")`;  
				const uri = `https://query.yahooapis.com/v1/public/yql?q=${query}&format=json`;
				fetch(uri, config)
					.then(res => res.json())
					.then(res => {
						defaults.image = res.query.results.channel.image.url;
						defaults.description = res.query.results.channel.description;
						defaults.date = res.query.results.channel.lastBuildDate;
						defaults.tHigh = fahrenheitToCelsius(res.query.results.channel.item.forecast[0].high);
						defaults.tLow = fahrenheitToCelsius(res.query.results.channel.item.forecast[0].low);
						defaults.condition = res.query.results.channel.item.condition.text;
						defaults.temp = fahrenheitToCelsius(res.query.results.channel.item.condition.temp);
						const template = `
							<div id='condition'>
								<img src="${defaults.image}">
								<br><span>
										${defaults.description} 
									</span>
								<br><span>
										${defaults.date} 
									</span>
								<br><span>
										&uparrow;t&deg;=${defaults.tHigh}&deg;C, 		
										&downarrow;t&deg;=${defaults.tLow}&deg;C 		
									</span>
								<br><span>
										${defaults.condition} 
									</span>
								<br><span>
										t&deg;=${defaults.temp}&deg;C
									</span>
							</div>
							`;
						this.append(template);
			});
		}).catch();
		return this;
	}
})(jQuery)