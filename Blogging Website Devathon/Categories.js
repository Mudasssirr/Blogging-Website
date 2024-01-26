import { auth, db, getDocs, collection, query, where, orderBy } from './firebase.js'

// FOR SHOWING ALL THE TOP CATEGORIES

// for first category
const topCategoryBlogs = document.getElementById('top-blogs');
const topCategory = document.getElementById('top-category-heading');
let topBlogLoader = document.getElementById('top-blog-loader');
let viewMoreTop = document.getElementById('view-more-top');

// for second category
const topSecondCategoryBlogs = document.getElementById('top-second-blogs');
const topSecondCategory = document.getElementById('top-second-category-heading');
let topSecondBlogLoader = document.getElementById('top-second-blog-loader');
let viewMoreTopSecond = document.getElementById('view-more-second');

// for third category
const topThirdCategoryBlogs = document.getElementById('top-third-blogs');
const topThirdCategory = document.getElementById('top-third-category-heading');
let topThirdBlogLoader = document.getElementById('top-third-blog-loader');
let viewMoreTopThird = document.getElementById('view-more-third');

auth.onAuthStateChanged(async (user) => {
    if (user) {
        let currentUID = user.uid;
        findTopCategories(currentUID);
    } else {
        findTopCategories();
    }
});

// TO FIND THE TOP THREE CATEGORIES

async function findTopCategories(currentUID) {
    const blogRef = collection(db, 'write-wise-blogs');

    // Get the count of blogs for each category
    const categoryCounts = {};
    const blogsQuery = query(blogRef, orderBy('category'));
    const blogsSnapshot = await getDocs(blogsQuery);

    blogsSnapshot.forEach((doc) => {
        const category = doc.data().category;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    // Sort the categories by blog count in descending order
    const sortedCategories = Object.entries(categoryCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([category]) => category
    );

    // for top first category
    topCategory.innerHTML = sortedCategories[0];

    renderTopBlogs(currentUID, sortedCategories[0]);

    // for top second category
    topSecondCategory.innerHTML = sortedCategories[1];

    renderTopSecondBlogs(currentUID, sortedCategories[1]);
    
    // for top third category
    topThirdCategory.innerHTML = sortedCategories[2];

    renderTopThirdBlogs(currentUID, sortedCategories[2]);
}

// FOR RENDERING THE TOP FIRST BLOGS
async function renderTopBlogs(currentUID, topCategory) {

    const blogRef = collection(db, 'write-wise-blogs');
    const userBlogsQuery = query(blogRef, where('category', '==', topCategory), orderBy('timestamp'));
    const userBlogsSnapshot = await getDocs(userBlogsQuery);

    let blogCounter = 0;

    if (userBlogsSnapshot.empty) {
        topBlogLoader.style.display = 'none';
        topCategoryBlogs.innerHTML = `
        <div class="no-blogs-message">
           <div class="message-container">
              <p class="no-blogs-heading">No Trending Blogs</p>
              <p class="no-blogs-subHeading">Sorry, there are no trending blogs in this category right now. Be the first to set a trend!</p>
           </div>
        </div>   
            `;
    } else {
        userBlogsSnapshot.forEach((doc) => {
            // console.log(doc.id, ' => ', doc.data());
            if (blogCounter < 3) { // Display only the top 3 blogs
                if (topBlogLoader) {
                    topBlogLoader.style.display = 'none';
                }
                const maxLengthTitle = 6; // Maximum number of words to display
                const maxLengthDescription = 10; // Maximum number of words to display

                // Extracting and truncating the description to maxLength words
                const description = doc.data().description;
                const title = doc.data().title;
                const truncatedTitle = title.split(' ').slice(0, maxLengthTitle).join(' ');
                const truncatedDescription = description.split(' ').slice(0, maxLengthDescription).join(' ');

                if (topCategoryBlogs) {
                    topCategoryBlogs.innerHTML += `
                <div class="card">
                <img src="${doc.data().imageUrl}" class="card-img-top" alt="...">
                <div class="card-body">
                    <h5 class="card-title mt-4 mb-2">${truncatedTitle}....</h5>
                    <p class="user-link" data-uid="${doc.data().userId}">by <a href="">${doc.data().userName}</a> </p>
                    <p class="card-text mt-1">${truncatedDescription}.....</p>
                    <a href="fullBlogs.html?blogId=${doc.id}">
                        <button class="read-more-btn" href="fullBlogs.html?blogId=${doc.id}">Read More
                            <i class="bi bi-arrow-right"></i>
                        </button>
                    </a>
                </div>
            </div>
            `;
                }
                blogCounter++; // Increment the blog counter
            }

            // SENDING THE USER TO THE PROFILE PAGE OR THE BLOG USER'S PAGE
            const userLinks = document.querySelectorAll('.user-link');

            userLinks.forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();

                    const clickedUID = link.getAttribute('data-uid');
                    const currentUserUID = currentUID;

                    if (clickedUID === currentUserUID) {
                        location.href = 'profile.html';
                    } else {
                        location.href = `WWuser.html?UID=${clickedUID}`;
                    }
                });
            });

            // SENDING THE USER TO THE FULL TOP CATEGORY PAGE
            viewMoreTop.addEventListener('click', () => {
                location.href = `searchResult.html?SearchedFor=${topCategory}`;
            })
        });
    }
}

// FOR RENDERING THE TOP SECOND BLOGS
async function renderTopSecondBlogs(currentUID, topSecondCategory) {

    const blogRef = collection(db, 'write-wise-blogs');
    const userBlogsQuery = query(blogRef, where('category', '==', topSecondCategory), orderBy('timestamp'));
    const userBlogsSnapshot = await getDocs(userBlogsQuery);

    let blogCounter = 0;

    if (userBlogsSnapshot.empty) {
        topSecondBlogLoader.style.display = 'none';
        topSecondCategoryBlogs.innerHTML = `
        <div class="no-blogs-message">
           <div class="message-container">
              <p class="no-blogs-heading">No Trending Blogs</p>
              <p class="no-blogs-subHeading">Sorry, there are no trending blogs in this category right now. Be the first to set a trend!</p>
           </div>
        </div>
            `;
    } else {
        userBlogsSnapshot.forEach((doc) => {
            // console.log(doc.id, ' => ', doc.data());
            if (blogCounter < 3) { // Display only the top 3 blogs
                if (topSecondBlogLoader) {
                    topSecondBlogLoader.style.display = 'none';
                }
                const maxLengthTitle = 6; // Maximum number of words to display
                const maxLengthDescription = 10; // Maximum number of words to display

                // Extracting and truncating the description to maxLength words
                const description = doc.data().description;
                const title = doc.data().title;
                const truncatedTitle = title.split(' ').slice(0, maxLengthTitle).join(' ');
                const truncatedDescription = description.split(' ').slice(0, maxLengthDescription).join(' ');

                if (topSecondCategoryBlogs) {
                    topSecondCategoryBlogs.innerHTML += `
                <div class="card">
                <img src="${doc.data().imageUrl}" class="card-img-top" alt="...">
                <div class="card-body">
                    <h5 class="card-title mt-4 mb-2">${truncatedTitle}....</h5>
                    <p class="user-link" data-uid="${doc.data().userId}">by <a href="">${doc.data().userName}</a> </p>
                    <p class="card-text mt-1">${truncatedDescription}.....</p>
                    <a href="fullBlogs.html?blogId=${doc.id}">
                        <button class="read-more-btn" href="fullBlogs.html?blogId=${doc.id}">Read More
                            <i class="bi bi-arrow-right"></i>
                        </button>
                    </a>
                </div>
            </div>
            `;
                }
                blogCounter++; // Increment the blog counter
            }

            // SENDING THE USER TO THE PROFILE PAGE OR THE BLOG USER'S PAGE
            const userLinks = document.querySelectorAll('.user-link');

            userLinks.forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();

                    const clickedUID = link.getAttribute('data-uid');
                    const currentUserUID = currentUID;

                    if (clickedUID === currentUserUID) {
                        location.href = 'profile.html';
                    } else {
                        location.href = `WWuser.html?UID=${clickedUID}`;
                    }
                });
            });

            // SENDING THE USER TO THE FULL TOP SECOND CATEGORY PAGE
            viewMoreTopSecond.addEventListener('click', () => {
                location.href = `searchResult.html?SearchedFor=${topSecondCategory}`;
            })
        });
    }
}

// FOR RENDERING THE TOP THIRD BLOGS
async function renderTopThirdBlogs(currentUID, topThirdCategory) {

    const blogRef = collection(db, 'write-wise-blogs');
    const userBlogsQuery = query(blogRef, where('category', '==', topThirdCategory), orderBy('timestamp'));
    const userBlogsSnapshot = await getDocs(userBlogsQuery);

    let blogCounter = 0;

    if (userBlogsSnapshot.empty) {
        topThirdBlogLoader.style.display = 'none';
        topThirdCategoryBlogs.innerHTML = `
        <div class="no-blogs-message">
           <div class="message-container">
              <p class="no-blogs-heading">No Trending Blogs</p>
              <p class="no-blogs-subHeading">Sorry, there are no trending blogs in this category right now. Be the first to set a trend!</p>
           </div>
        </div>
            `;
    } else {
        userBlogsSnapshot.forEach((doc) => {
            // console.log(doc.id, ' => ', doc.data());
            if (blogCounter < 3) { // Display only the top 3 blogs
                if (topThirdBlogLoader) {
                    topThirdBlogLoader.style.display = 'none';
                }
                const maxLengthTitle = 6; // Maximum number of words to display
                const maxLengthDescription = 10; // Maximum number of words to display

                // Extracting and truncating the description to maxLength words
                const description = doc.data().description;
                const title = doc.data().title;
                const truncatedTitle = title.split(' ').slice(0, maxLengthTitle).join(' ');
                const truncatedDescription = description.split(' ').slice(0, maxLengthDescription).join(' ');

                if (topThirdCategoryBlogs) {
                    topThirdCategoryBlogs.innerHTML += `
                <div class="card">
                <img src="${doc.data().imageUrl}" class="card-img-top" alt="...">
                <div class="card-body">
                    <h5 class="card-title mt-4 mb-2">${truncatedTitle}....</h5>
                    <p class="user-link" data-uid="${doc.data().userId}">by <a href="">${doc.data().userName}</a> </p>
                    <p class="card-text mt-1">${truncatedDescription}.....</p>
                    <a href="fullBlogs.html?blogId=${doc.id}">
                        <button class="read-more-btn" href="fullBlogs.html?blogId=${doc.id}">Read More
                            <i class="bi bi-arrow-right"></i>
                        </button>
                    </a>
                </div>
            </div>
            `;
                }
                blogCounter++; // Increment the blog counter
            }

            // SENDING THE USER TO THE PROFILE PAGE OR THE BLOG USER'S PAGE
            const userLinks = document.querySelectorAll('.user-link');

            userLinks.forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();

                    const clickedUID = link.getAttribute('data-uid');
                    const currentUserUID = currentUID;

                    if (clickedUID === currentUserUID) {
                        location.href = 'profile.html';
                    } else {
                        location.href = `WWuser.html?UID=${clickedUID}`;
                    }
                });
            });

            // SENDING THE USER TO THE FULL TOP THIRD CATEGORY PAGE
            viewMoreTopThird.addEventListener('click', () => {
                location.href = `searchResult.html?SearchedFor=${topThirdCategory}`;
            })
        });
    }
}