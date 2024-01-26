document.querySelector('.navbar-toggler-icon-res').addEventListener('click', function () {
    const navbarToggler = this;
    navbarToggler.classList.toggle('active');

    const icon = navbarToggler.querySelector('.icon');
    const closeIcon = document.querySelector('.close-icon-navbar');
    const searchBox = document.querySelector('.search-box');
    const navLinks = document.querySelector('.nav-links');
    
    if (navbarToggler.classList.contains('active')) {
        closeIcon.style.display = 'block';
        searchBox.classList.remove('active');
        navLinks.style.left = '0';
    } else {
        closeIcon.style.display = 'none';
        searchBox.classList.remove('active');
        navLinks.style.left = '-300px';
    }
    
    icon.classList.toggle('open');
});

document.querySelector('.close-icon-navbar').addEventListener('click', function () {
    const navbarToggler = document.querySelector('.navbar-toggler-icon-res');
    const icon = navbarToggler.querySelector('.icon');
    const closeIcon = this;
    const searchBox = document.querySelector('.search-box');
    const navLinks = document.querySelector('.nav-links');
    
    navbarToggler.classList.remove('active');
    closeIcon.style.display = 'none';
    searchBox.classList.remove('active');
    navLinks.style.left = '-300px';
    icon.classList.remove('open');
});

document.querySelector('.search-icon').addEventListener('click', function () {
    const searchBox = document.querySelector('.search-box');
    searchBox.classList.toggle('active');
});