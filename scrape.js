const fs = require('fs');
const fetch = require('node-fetch');

const FETCH_OPTIONS = {
	headers: {
		'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; FSL 7.0.6.01001)'
	}
};


async function fetchListings(){
	const response = await fetch('http://www.9300realty.com/index.cfm?page=allRentals', FETCH_OPTIONS);
	const html = await response.text();

	const listings = [];
	for (const element of html.split('<div class="dspListings2Elements').slice(1)){
		const anchors = element.split('<a ').slice(1);
		const url = 'http://www.9300realty.com/' + anchors[1].split('href="')[1].split('"')[0].replace(/&amp;/, '&');
		const title = anchors[1].split('>')[1].split('</a')[0];
		const neighborhood = anchors[2].split('>')[1].split('</a')[0]

		listings.push({ url, title, neighborhood });
	}

	return listings;
}

async function fetchListingDetails(listing){
	const response = await fetch(listing.url, FETCH_OPTIONS);
	const html = await response.text();

	const photos = html.split('<div class="thumb">').slice(1).map(anchor => anchor.split('href="')[1].split('"')[0]);

	const title = html.split('<div class="dspPropertyTitle">')[1].split('<h1>')[1].split('</h1>')[0].trim();

	const details = html.split('<h2>Listing Details</h2>')[1].split('<p>')[1].split('</p>')[0].replace(/<br\s*\/?>/ig, '\n').trim();
	
	const essentials = html.split('Essentials</h2>')[1].split('<script>')[0].split('<div class="essentials">').slice(1).reduce((map, div) => {
		const key = div.split('<span>')[1].split('</span>')[0].trim().slice(0, -1).toLowerCase();
		const value = div.split('</')[1].split('>').slice(-1)[0].trim();

		map[key] = value;
		return map;
	}, {})

	const amenitites = html.split('Living Amenitites</h2>')[1].split('<div class="essentials"').slice(1).map(div => div.split('>')[1].split('<')[0].trim());

	const neighborhood = essentials.area;

	const info = {
		photos,
		title,
		details,
		essentials,
		amenitites
	};
	
	if (neighborhood) info.neighborhood = neighborhood;

  return Object.assign({}, listing, info);
}

(async function run(){
	const start = Date.now()
	
	const partialListings = await fetchListings();

	const listings = [];
  for (let i = 0; i < partialListings.length; i++){
    const partialListing = partialListings[i];

    console.log((i / partialListings.length * 100).toFixed(2) + '%');
    console.log(partialListing.title, ' -> ', partialListing.neighborhood, ' ::::::: ', partialListing.url);

//	await new Promise(resolve => setTimeout(resolve, 1000));
    const listing = await fetchListingDetails(partialListing);
		listings.push(listing);
	}

  fs.writeFileSync('data.json', JSON.stringify(listings, null, '  '));
	
  const end = Date.now();
  console.log('Completed in ' + ((end - start) / 1000) + ' seconds');
})().catch(console.error)
