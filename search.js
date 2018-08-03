document.forms[0].addEventListener('submit', event => {
	event.preventDefault();

	const data = {}
	for (const entry of new FormData(event.target)){
		data[entry[0]] = entry[1];
	}

	const priceRange = [data.priceMin.replace(',', ''), data.priceMax.replace(',', '')].map(Number);
	if (priceRange[1] === 0) priceRange[1] = Number.MAX_SAFE_INTEGER;
	
	const bedRange = [
		!isNaN(Number(data.bedsMin)) ? Number(data.bedsMin) : 0,
		!isNaN(Number(data.bedsMax)) ? Number(data.bedsMax) : 0
	];
	if (bedRange[1] === 0 && data.bedsMax !== 'Studio') bedRange[1] = Number.MAX_SAFE_INTEGER;
	
	const bathRange = [data.bathsMin, data.bathsMax].map(Number);
	if (bathRange[1] === 0) bathRange[1] = Number.MAX_SAFE_INTEGER;

	console.log(data, priceRange, bedRange, bathRange);

	const matchingListings = LISTINGS.filter(listing => {
		if (data.neighborhood && data.neighborhood !== listing.neighborhood) return false;

		const price = Number(listing.essentials.price.replace('$', '').replace(',', ''))
		if (priceRange[0] > price) return false;
		if (priceRange[1] < price) return false;

		const bedrooms = Number(listing.essentials.bedrooms)
		if (bedRange[0] > bedrooms) return false;
		if (bedRange[1] < bedrooms) return false;

		const bathrooms = Number(listing.essentials.bathrooms)
		if (bathRange[0] > bathrooms) return false;
		if (bathRange[1] < bathrooms) return false;

		return true;
	});

	console.log('total', matchingListings.length);

	const listings = document.getElementById('listings');
	listings.innerHTML = '';
	for (const listing of matchingListings){
		const li = document.createElement('li');

		const anchor = document.createElement('a');
		anchor.href = listing.url;
		anchor.textContent = listing.title;
		li.appendChild(anchor);

		const imgs = listing.photos.reduce((fragment, url) => {
			const img = document.createElement('img');
			if (CACHE){
				img.src = 'images/' + url.split('/').splice(-1)[0];
			}
			else{
				img.src = url;
			}
			img.className = 'listing-image';

			fragment.appendChild(img);
			return fragment
		}, document.createDocumentFragment());

		const imgContainer = document.createElement('div');
		imgContainer.appendChild(imgs);
		li.appendChild(imgContainer);

		const details = document.createElement('p');
		details.textContent = listing.details
		li.appendChild(details);

		const table = document.createElement('table')
		for (const key in listing.essentials){
			const value = listing.essentials[key];

			const tr = document.createElement('tr');

			const keyTd = document.createElement('td');
			keyTd.textContent = key;
			tr.appendChild(keyTd)

			const valueTd = document.createElement('td');
			valueTd.textContent = value;
			tr.appendChild(valueTd)

			table.appendChild(tr);
		}
		li.appendChild(table);

		const amenitites = listing.amenitites || listing.ammenities

		const amentitiesElement = document.createElement('p');
		amentitiesElement.textContent = amenitites.join(', ');
		li.appendChild(amentitiesElement);

		listings.appendChild(li)
	}
});

function setImages(urls){

}