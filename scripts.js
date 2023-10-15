const gridContainer = document.querySelector('.grid');

const countryCoordinates = {
    'USA': { left: '40%', top: '30%' },
    'Japan': { left: '88%', top: '39%' },
    'Indonesia': { left: '83%', top: '58%' }
};

// Fetch data from the JSON file and then execute the logic
fetch('data.json')
    .then(response => response.json())
    .then(grids => { 
        let gridItemsHTML = "";

        grids.forEach(grid => {
            gridItemsHTML += `
            <div class="grid-item" data-country="${grid.country}" data-cuisine="${grid.cuisine}" data-rating="${grid.ratingNum}" data-price="${grid.price}">

                    <h2>${grid.title}</h2>
                    <img src="${grid.imgSrc}" alt="${grid.title}">
                    <p>${grid.rating} | ${grid.price}</p>
                    <p>Location: ${grid.city}, ${grid.country}</p>
                    <p>Cuisine: ${grid.cuisine}</p>
                </div>
            `;
        });

        gridContainer.innerHTML = gridItemsHTML;

        function animateValue(element, start, end, duration) {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                element.textContent = Math.floor(progress * (end - start) + start);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }
        
        function matchesFilter(item, attribute, value) {
            if (!value) return true;
            return item.getAttribute(`data-${attribute}`) === value;
        }

        function filterGridItems() {
            const country = countryFilter.value;
            const cuisine = cuisineFilter.value;
            const rating = ratingFilter.value;
            const price = priceFilter.value;
            const searchTerm = searchInput.value.toLowerCase();

            const gridItems = document.querySelectorAll('.grid-item');

            if (!country && !cuisine && !rating && !price && !searchTerm) {
                gridItems.forEach(item => {
                    item.classList.add('active');
                });
                return;
            }

            gridItems.forEach(item => {
                const itemTitle = item.querySelector('h2').textContent.toLowerCase();
                const matchesSearch = !searchTerm || itemTitle.includes(searchTerm);

                if (matchesFilter(item, 'country', country) && 
                    matchesFilter(item, 'cuisine', cuisine) && 
                    matchesFilter(item, 'rating', rating) && 
                    matchesFilter(item, 'price', price) &&
                    matchesSearch) {
                        item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }

        const countryFilter = document.getElementById('country-filter');
        const cuisineFilter = document.getElementById('cuisine-filter');
        const ratingFilter = document.getElementById('rating-filter');
        const priceFilter = document.getElementById('price-filter');

        const uniqueCountries = getUniqueValues('country');
        const uniqueCuisines = getUniqueValues('cuisine');
        const uniqueRatings = getUniqueValues('ratingNum');
        const uniquePrices = getUniqueValues('price');

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
        populateOptions(priceFilter, uniquePrices);

        function getUniqueValues(attribute) {
            const values = grids.map(grid => grid[attribute]);
            return [...new Set(values)];
        }

        const searchInput = document.getElementById('search');

        // Count the number of grid items
        const gridItemCount = document.querySelectorAll('.grid-item').length;

        // Count the number of country options (subtract 1 for the default "Filter by Country" option)
        const countryOptionCount = countryFilter.querySelectorAll('option').length - 1;

        // Update the text right above the search bar
        const reviewCountElement = document.getElementById('review-count');
        const countryCountElement = document.getElementById('country-count');
        
        reviewCountElement.textContent = gridItemCount;
        countryCountElement.textContent = countryOptionCount;
        
         // Animate numbers
         animateValue(reviewCountElement, 0, gridItemCount, 500); 
         animateValue(countryCountElement, 0, countryOptionCount, 500);
 

        // Attach event listeners to filters and search input
        countryFilter.addEventListener('change', filterGridItems);
        cuisineFilter.addEventListener('change', filterGridItems);
        ratingFilter.addEventListener('change', filterGridItems);
        priceFilter.addEventListener('change', filterGridItems);
        searchInput.addEventListener('input', filterGridItems);

        // Call once to show all items initially
        filterGridItems();
        const mapContainer = document.querySelector('.map-container');
        
        // Create an object to hold counts of reviews per country
        const countryReviewCounts = {};

        grids.forEach(grid => {
            if (!countryReviewCounts[grid.country]) {
                countryReviewCounts[grid.country] = 0;
            }
            countryReviewCounts[grid.country]++;
        });

        // For each unique country, create a marker
        for (const country in countryReviewCounts) {
            if (countryCoordinates[country]) {
                const marker = document.createElement('div');
                marker.classList.add('marker');
                marker.style.left = countryCoordinates[country].left;
                marker.style.top = countryCoordinates[country].top;
                
                const tooltip = document.createElement('div');
                tooltip.classList.add('tooltip');
                tooltip.style.display = 'none';
                tooltip.innerHTML = `<p id="tooltip">${country}</p><p id="tooltip">Reviews: ${countryReviewCounts[country]}</p>`;
                
                marker.appendChild(tooltip);
                mapContainer.appendChild(marker);
                
                marker.addEventListener('mouseover', function() {
                    tooltip.style.display = 'block';
                });
                marker.addEventListener('mouseout', function() {
                    tooltip.style.display = 'none';
                });
            }
        }
    })
    .catch(error => {
        console.error("Failed to fetch data:", error);
    });

    document.getElementById('avatar').addEventListener('mouseover', function() {
        this.setAttribute('fill', 'url(#img2)');
    });
    
    document.getElementById('avatar').addEventListener('mouseout', function() {
        this.setAttribute('fill', 'url(#img1)');
    });

    document.querySelectorAll('.marker').forEach(marker => {
        marker.addEventListener('mouseover', function() {
            // Show tooltip on mouseover
            let tooltip = this.querySelector('.tooltip');
            tooltip.style.display = 'block';
        });
    
        marker.addEventListener('mouseout', function() {
            // Hide tooltip on mouseout
            let tooltip = this.querySelector('.tooltip');
            tooltip.style.display = 'none';
        });
    });
    
 
