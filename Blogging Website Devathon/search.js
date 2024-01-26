// Get the search button and input field
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

// Add a click event listener to the search button
searchBtn.addEventListener('click', function() {
    // Get the value from the search input field
    const searchTerm = searchInput.value.trim();

    // Check if the search term is not empty
    if (searchTerm !== '') {
        // Redirect to the searchResult.html page with the search query as a parameter
        window.location.href = `searchResult.html?SearchedFor=${encodeURIComponent(searchTerm)}`;
    }
});