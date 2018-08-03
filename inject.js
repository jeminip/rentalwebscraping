const fs = require('fs');

const listings = JSON.parse(fs.readFileSync('data.json').toString());

const html = fs.readFileSync('search_template.html').toString()
	.replace('{%LISTINGS%}', JSON.stringify(listings))
	.replace('{%CACHE%}', fs.existsSync('images').toString());
	
fs.writeFileSync('search.html', html);
