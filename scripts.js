const grids = [
    { title: "Title 1", rating: "★★★★★", imgSrc: "test.jpeg", city: "New York", country: "USA", cuisine: "Italian", ratingNum: "5" },
    { title: "Title 2", rating: "★★★★☆", imgSrc: "path_to_image_2", city: "Paris", country: "France", cuisine: "Chinese", ratingNum: "4" },
    { title: "Hehe Hi", rating: "★★★☆☆", imgSrc: "path_to_image_2", city: "Jakarta", country: "Indonesia", cuisine: "Chinese", ratingNum: "3" },
];

const gridContainer = document.querySelector('.grid');

grids.forEach(grid => {
gridContainer.innerHTML += `
    <div class="grid-item" data-country="${grid.country}" data-cuisine="${grid.cuisine}" data-rating="${grid.ratingNum}">
        <h2>${grid.title}</h2>
        <p>Rating: ${grid.rating}</p>
        <img src="${grid.imgSrc}" alt="${grid.title}">
        <p>Location: ${grid.city}, ${grid.country}</p>
        <p>Cuisine: ${grid.cuisine}</p>
    </div>
`;
});

function generatePriceSymbols(price) {
    const priceSymbols = Array(price).fill('$').join('');
    return priceSymbols;
}

function getUniqueValues(attribute) {
    const values = grids.map(grid => grid[attribute]);
    return [...new Set(values)];  // This removes duplicates and returns only unique values
}

document.addEventListener('DOMContentLoaded', function() {
    const countryFilter = document.getElementById('country-filter');
    const cuisineFilter = document.getElementById('cuisine-filter');
    const ratingFilter = document.getElementById('rating-filter');

    const uniqueCountries = getUniqueValues('country');
    const uniqueCuisines = getUniqueValues('cuisine');
    const uniqueRatings = getUniqueValues('ratingNum');

    function populateOptions(filterElement, valuesArray) {
        valuesArray.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            filterElement.appendChild(option);
        });
    }

    populateOptions(countryFilter, uniqueCountries);
    populateOptions(cuisineFilter, uniqueCuisines);
    populateOptions(ratingFilter, uniqueRatings);

    const searchInput = document.getElementById('search');

    function filterGridItems() {
        const country = countryFilter.value;
        const cuisine = cuisineFilter.value;
        const rating = ratingFilter.value;
        const searchTerm = searchInput.value.toLowerCase();

        const gridItems = document.querySelectorAll('.grid-item');

        // If no filters or search is applied, show all items
        if (!country && !cuisine && !rating && !searchTerm) {
            gridItems.forEach(item => {
                item.classList.add('active');
            });
            return;  // Exit from function
        }
        
        gridItems.forEach(item => {
            const itemCountry = item.getAttribute('data-country');
            const itemCuisine = item.getAttribute('data-cuisine');
            const itemRating = item.getAttribute('data-rating');
            const itemTitle = item.querySelector('h2').textContent.toLowerCase();

            // Check if item matches all the criteria
            const matchesCountry = !country || itemCountry === country;
            const matchesCuisine = !cuisine || itemCuisine === cuisine;
            const matchesRating = !rating || itemRating === rating;
            const matchesSearch = !searchTerm || itemTitle.includes(searchTerm);

            if (matchesCountry && matchesCuisine && matchesRating && matchesSearch) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

   // Count the number of grid items
   const gridItemCount = document.querySelectorAll('.grid-item').length;

   // Count the number of country options (subtract 1 for the default "Filter by Country" option)
   const countryOptionCount = countryFilter.querySelectorAll('option').length - 1;

   // Update the text right above the search bar
   const reviewText = document.querySelector('.search-filter-container').previousElementSibling.querySelector('p');
   reviewText.textContent = `${gridItemCount} reviews across ${countryOptionCount} countries`;

   // Attach event listeners to filters and search input
   countryFilter.addEventListener('change', filterGridItems);
   cuisineFilter.addEventListener('change', filterGridItems);
   ratingFilter.addEventListener('change', filterGridItems);
   searchInput.addEventListener('input', filterGridItems);

   // Call once to show all items initially
   filterGridItems();

});