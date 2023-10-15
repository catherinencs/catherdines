const gridContainer = document.querySelector('.grid');

// Fetch data from the JSON file and then execute the logic
fetch('data.json')
    .then(response => response.json())
    .then(grids => {
        let gridItemsHTML = "";

        grids.forEach(grid => {
            gridItemsHTML += `
                <div class="grid-item" data-country="${grid.country}" data-cuisine="${grid.cuisine}" data-rating="${grid.ratingNum}">
                    <h2>${grid.title}</h2>
                    <p>Rating: ${grid.rating}</p>
                    <img src="${grid.imgSrc}" alt="${grid.title}">
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
            const searchTerm = searchInput.value.toLowerCase();

            const gridItems = document.querySelectorAll('.grid-item');

            if (!country && !cuisine && !rating && !searchTerm) {
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
        searchInput.addEventListener('input', filterGridItems);

        // Call once to show all items initially
        filterGridItems();
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
    