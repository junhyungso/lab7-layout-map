Promise.all([ // load multiple files
	d3.josn('airports.json'),
	d3.json('world-110m.json')
]).then(data=>{ // or use destructuring :([airports, wordmap])=>{ ... 
	let airports = data[0]; // data1.csv
	let wordmap = data[1]; // data2.json

})