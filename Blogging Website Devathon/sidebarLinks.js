import { auth } from "./firebase.js";

// GOING TO THE TRENDING BLOGS PAGE THROUGH JS

let trendingLink = document.getElementById('trending-link');

trendingLink.addEventListener('click', () => {
    location.href = 'trendingBlogs.html';
})

// GOING TO THE BLOG CATEGORIES PAGE THROUGH JS

let categoriesLink = document.getElementById('categories-link');

categoriesLink.addEventListener('click', () => {
    location.href = 'Categories.html';
})

// GOING TO THE SURVEYS PAGE THROUGH JS

let surveysLink = document.getElementById('survey-link');

surveysLink.addEventListener('click', () => {
    location.href = 'Survey&Polls.html';
})

// GOING TO THE ARCHIVE PAGE THROUGH JS

let archiveLink = document.getElementById('archive-link');

archiveLink.addEventListener('click', () => {
    location.href = 'archive.html';
})

// RESPONSIVE NAVLINKS
let resSurveyLink = document.getElementById('survey&Polls-res-link');
let resArchiveLink = document.getElementById('archive-res-link');

// SHOWING/HIDING USER LINKS BASED ON USER'S LOGIN STATUS

auth.onAuthStateChanged(async (user) => {
    if (user) {
        archiveLink.style.display = 'block';
        surveysLink.style.display = 'block';
        resSurveyLink.style.display = 'block';
        resArchiveLink.style.display = 'block';
    } else {
        archiveLink.style.display = 'none';
        surveysLink.style.display = 'none';
        resSurveyLink.style.display = 'none';
        resArchiveLink.style.display = 'none';
    }
});