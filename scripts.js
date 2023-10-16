const gridContainer = document.querySelector('.grid');

const countryCoordinates = {
    'USA': { left: '40%', top: '30%'},
    'Japan': { left: '88%', top: '39%'},
    'Indonesia': { left: '85%', top: '58%'},
    'Singapore': { left: '81.1%', top: '56.5%'},
    'UK': { left: '59.5%', top: '28%'}
};

/**
 * Fetches grid data from the JSON file and processes the data.
 */
function fetchGridData() {
    fetch('data.json')
        .then(response => response.json())
        
        .then(processGridData)
        .catch(error => {
            console.error("Failed to fetch data:", error);
        });
}


/**
 * Processes and renders grid data.
 * @param {Array} grids - Array of grid data objects.
 */
function processGridData(grids) {
    renderGridItems(grids);
    setupModalInteractions();
    setupMapMarkers(grids);
    setupFiltersAndSearch(grids);
    setupAvatarHoverEffect();

    // Update the review count and country count
    const reviewCount = grids.length;
    const countryCount = getUniqueValues(grids, 'country').length;

    // Animate the counts
    animateValue(document.getElementById('review-count'), 0, reviewCount, 500);
    animateValue(document.getElementById('country-count'), 0, countryCount, 500);
}

/**
 * Renders grid items.
 * @param {Array} grids - Array of grid data objects.
 */
function renderGridItems(grids) {
    const gridItemsHTML = grids.map(grid => `
    <div class="grid-item" 
    data-json='${JSON.stringify(grid)}' 
    data-country="${grid.country}" 
    data-cuisine="${grid.cuisine}" 
    data-rating="${grid.rating}" 
    data-price="${grid.price}">
    <h2>${grid.title}</h2>
    <img src="${grid.imgsrcs[0]}" alt="${grid.title}">
    <p><span class="stars">${grid.rating}</span><span class="dollars">${grid.price}</span></p>
    <p>${grid.cuisine} restaurant in ${grid.city}, ${grid.country}</p>
</div>
    `).join('');
    gridContainer.innerHTML = gridItemsHTML;
}


/**
 * Sets up modal interactions.
 */
function setupModalInteractions() {
    const modal = document.getElementById("myModal");
    const modalTitle = document.getElementById("modal-title");
    const modalSlideshow = document.querySelector(".modal-slideshow");
    const modalReview = document.getElementById("modal-review");
    const closeModalBtn = document.querySelector(".close");

    document.querySelectorAll(".grid-item").forEach(item => {
        item.addEventListener('click', function() {
            const gridData = JSON.parse(this.getAttribute('data-json'));
            modalTitle.textContent = gridData.title;
            modalReview.textContent = gridData.review;

            // Clear previous slideshow images
            modalSlideshow.innerHTML = '';
            gridData.imgsrcs.forEach(imgsrc => {
                const img = document.createElement('img');
                img.src = imgsrc;
                modalSlideshow.appendChild(img);
            });

            // Initialize or reinitialize Slick on the new images
            $(modalSlideshow).slick({
                dots: true,
                infinite: true,
                speed: 500,
                fade: true,
                cssEase: 'linear'
            });

            modal.style.display = "block";
        });
    });

    closeModalBtn.onclick = () => {
        modal.style.display = "none";
        $(modalSlideshow).slick('unslick');
    };
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
            $(modalSlideshow).slick('unslick');
        }
    };
}

/**
 * Sets up the map markers based on the provided grid data.
 * @param {Array} grids - Array of grid data objects.
 */
function setupMapMarkers(grids) {
    const mapContainer = document.querySelector('.map-container');
    const countryReviewCounts = getCountryReviewCounts(grids);

    for (const country in countryReviewCounts) {
        if (countryCoordinates[country]) {
            const marker = createMarker(country, countryReviewCounts[country]);
            mapContainer.appendChild(marker);
        }
    }
}

/**
 * Creates a marker element with tooltip for the given country and review count.
 * @param {string} country - Country name.
 * @param {number} count - Review count.
 * @returns {Element} - The marker element.
 */
function createMarker(country, count) {
    const marker = document.createElement('div');
    marker.classList.add('marker');
    marker.style.left = countryCoordinates[country].left;
    marker.style.top = countryCoordinates[country].top;

    const tooltip = createTooltip(country, count);
    marker.appendChild(tooltip);

    marker.addEventListener('mouseover', () => tooltip.style.display = 'block');
    marker.addEventListener('mouseout', () => tooltip.style.display = 'none');

    return marker;
}

/**
 * Creates a tooltip element for the given country and review count.
 * @param {string} country - Country name.
 * @param {number} count - Review count.
 * @returns {Element} - The tooltip element.
 */
function createTooltip(country, count) {
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    tooltip.style.display = 'none';
    tooltip.innerHTML = `<p id="tooltip">${country}</p><p id="tooltip">Reviews: ${count}</p>`;
    return tooltip;
}

/**
 * Generates a summary of reviews per country from the given grid data.
 * @param {Array} grids - Array of grid data objects.
 * @returns {Object} - An object containing review counts per country.
 */
function getCountryReviewCounts(grids) {
    const counts = {};
    grids.forEach(grid => {
        if (!counts[grid.country]) {
            counts[grid.country] = 0;
        }
        counts[grid.country]++;
    });
    return counts;
}

/**
 * Sets up filters and search functionality.
 * @param {Array} grids - Array of grid data objects.
 */
function setupFiltersAndSearch(grids) {
    const countryFilter = document.getElementById('country-filter');
    const cuisineFilter = document.getElementById('cuisine-filter');
    const ratingFilter = document.getElementById('rating-filter');
    const priceFilter = document.getElementById('price-filter');
    const searchInput = document.getElementById('search');
    const searchButton = document.getElementById('search-btn');

    populateOptions(countryFilter, getUniqueValues(grids, 'country'));
    populateOptions(cuisineFilter, getUniqueValues(grids, 'cuisine'));
    populateOptions(ratingFilter, getUniqueValues(grids, 'rating'));
    populateOptions(priceFilter, getUniqueValues(grids, 'price'));

    const eventListeners = ['change', 'keydown', 'click'];
    [countryFilter, cuisineFilter, ratingFilter, priceFilter, searchInput, searchButton].forEach((element, index) => {
        element.addEventListener(eventListeners[index < 5 ? 0 : index - 4], filterGridItems);
    });

    document.getElementById('clear-filters').addEventListener('click', function() {
        countryFilter.selectedIndex = 0;
        cuisineFilter.selectedIndex = 0;
        ratingFilter.selectedIndex = 0;
        priceFilter.selectedIndex = 0;
        filterGridItems();
    });

    filterGridItems();  // Call once to show all items initially
}

/**
 * Populates the given filter element with the provided values.
 * @param {Element} filterElement - The filter dropdown element.
 * @param {Array} valuesArray - Array of values to populate the filter with.
 */
function populateOptions(filterElement, valuesArray) {
    valuesArray.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        filterElement.appendChild(option);
    });
}

/**
 * Retrieves unique values for the given attribute from the grid data.
 * @param {Array} grids - Array of grid data objects.
 * @param {string} attribute - The attribute to retrieve unique values for.
 * @returns {Array} - Array of unique values.
 */
function getUniqueValues(grids, attribute) {
    const values = grids.map(grid => grid[attribute]);
    return [...new Set(values)];
}

/**
 * Animates a numeric value of an element from the start value to the end value over a given duration.
 * @param {Element} element - The DOM element whose value needs to be animated.
 * @param {number} start - The start value.
 * @param {number} end - The end value.
 * @param {number} duration - The duration of the animation in milliseconds.
 */
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

/**
 * Checks if a grid item matches the given filter criteria.
 * @param {Element} item - The grid item element.
 * @param {string} attribute - The data attribute to check.
 * @param {string} value - The filter value to match against.
 * @returns {boolean} - True if the item matches the filter, false otherwise.
 */
function matchesFilter(item, attribute, value) {
    if (!value) return true;
    return item.getAttribute(`data-${attribute}`) === value;
}

/**
 * Filters the grid items based on the selected filter values and search term.
 */
function filterGridItems() {
    const country = document.getElementById('country-filter').value;
    const cuisine = document.getElementById('cuisine-filter').value;
    const rating = document.getElementById('rating-filter').value;
    const price = document.getElementById('price-filter').value;
    const searchTerm = document.getElementById('search').value.toLowerCase();

    const gridItems = document.querySelectorAll('.grid-item');
    let hasActiveItems = false;

    gridItems.forEach(item => {
        const itemTitle = item.querySelector('h2').textContent.toLowerCase();
        const matchesSearch = !searchTerm || itemTitle.includes(searchTerm);

        if (matchesFilter(item, 'country', country) && 
            matchesFilter(item, 'cuisine', cuisine) && 
            matchesFilter(item, 'rating', rating) && 
            matchesFilter(item, 'price', price) &&
            matchesSearch) {
                item.classList.add('active');
                hasActiveItems = true;
        } else {
            item.classList.remove('active');
        }
    });

    toggleNoResultsMessage(hasActiveItems);
}

/**
 * Toggles the display of the "No Results" message based on whether there are active grid items.
 * @param {boolean} hasActiveItems - True if there are active grid items, false otherwise.
 */
function toggleNoResultsMessage(hasActiveItems) {
    const noResultsMessage = document.querySelector('.no-results');
    noResultsMessage.style.display = hasActiveItems ? "none" : "block";
}

/**
 * Sets up hover effect for the avatar.
 */
function setupAvatarHoverEffect() {
    const avatar = document.getElementById('avatar');
    avatar.addEventListener('mouseover', function() {
        this.setAttribute('fill', 'url(#img2)');
    });
    avatar.addEventListener('mouseout', function() {
        this.setAttribute('fill', 'url(#img1)');
    });
}

function showModal(review) {
    const slideshow = document.querySelector('.modal-slideshow');
    slideshow.innerHTML = '';  // Clear any previous images

    // Assuming each review in your JSON has a property "images" that is an array of image URLs
    review.images.forEach(imgsrc => {
        const img = document.createElement('img');
        img.src = imgsrc;
        slideshow.appendChild(img);
    });

    // Initialize Slick on the slideshow
    $(slideshow).slick({
        dots: true,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        adaptiveHeight: true
    });
}

// Grabbing the necessary elements
const sendButton = document.getElementById('send-suggestion');
const suggestionInput = document.getElementById('user-suggestion');
const thankYouMessage = document.getElementById('thank-you-message');

// Add the event listener to the send button
sendButton.addEventListener('click', function() {
    // Hide the input and the send button
    suggestionInput.style.display = 'none';
    sendButton.style.display = 'none';

    // Display the thank you message
    thankYouMessage.style.display = 'block';
});

document.addEventListener('DOMContentLoaded', function() {
    const pixelArts = document.querySelectorAll('.pixel-art-circle');

    pixelArts.forEach(circle => {
        circle.addEventListener('mouseover', function() {
            this.setAttribute('data-original-fill', this.getAttribute('fill'));
            this.setAttribute('fill', this.getAttribute('data-hover-fill'));
        });

        circle.addEventListener('mouseout', function() {
            this.setAttribute('fill', this.getAttribute('data-original-fill'));
        });
    });
});

// Call the main function to start the process.
fetchGridData();
