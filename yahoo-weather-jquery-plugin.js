(function($, undefined) {
	'use strict';
	$.fn.jahooWeather = function(p1) {
		const fahrenheitToCelsius = (f) => Math.ceil((f-32)/1.8);
		const config = {
			method : 'GET',
			mode : 'cors'
		}
		const def = {}
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
						def.city = res.query.results.channel.location.city;
						def.country = res.query.results.channel.location.country;
						def.date = new Date(res.query.created);
						def.tHigh = fahrenheitToCelsius(res.query.results.channel.item.forecast[0].high);
						def.tLow = fahrenheitToCelsius(res.query.results.channel.item.forecast[0].low);
						def.condition = res.query.results.channel.item.condition.code;
						def.temp = fahrenheitToCelsius(res.query.results.channel.item.condition.temp);
						const template = `
							<div class="btn btn-default">
								<i class="wi wi-yahoo-${def.condition}">
									&nbsp;${def.temp}&deg;C  ${def.city}, ${def.country}
								</i>
								<div>
									${def.date.getDate()}/${def.date.getMonth()}, 
									${def.date.getHours()}:${
										(def.date.getMinutes()<10) ? '0' + def.date.getMinutes() : def.date.getMinutes()
									} 
								</div>
								<div>
									&downarrow;t&deg;=${def.tLow}&deg;C,&nbsp; 		
									&uparrow;t&deg;=${def.tHigh}&deg;C		
								</div>
								<a href="https://www.yahoo.com/?ilc=401" target="_blank"> <img src="https://poweredby.yahoo.com/purple.png" width="134" height="29"/> </a>
							</div>
							`;
						this.append(template);
			});
		}).catch((err)=>{console.log(err)});
		return this;
	}
})(jQuery)