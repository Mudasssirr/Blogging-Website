import { doc, db, getDoc, updateDoc, increment } from './firebase.js'

document.addEventListener('DOMContentLoaded', async () => {
    const blogContainer = document.getElementById('fullBlogContainer');
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('blogId');

    let blogLoader = document.getElementById('blog-loader');

        const blogRef = doc(db, 'write-wise-blogs', blogId);
        const currentTime = moment(); // Using momentJS for current time
        const twoWeeksAgo = moment().subtract(14, 'days'); // 14 days ago

        const userBlogsSnapshot = await getDoc(blogRef);
        if (userBlogsSnapshot.exists()) {
            const lastUpdated = moment(userBlogsSnapshot.data().LastPopularityUpdate.toDate());
            const currentPopularity = userBlogsSnapshot.data().Popularity;

            if (lastUpdated.isBefore(twoWeeksAgo) && currentPopularity > 0) {
                await updateDoc(blogRef, {
                    Popularity: 0,
                    LastPopularityUpdate: currentTime.toDate(), // Converting momentJS object to JavaScript Date object
                    blogViews: increment(1)
                });
            } else {
                // Increment the popularity if it's less than two weeks
                if (lastUpdated.isSameOrAfter(twoWeeksAgo)) {
                    await updateDoc(blogRef, {
                        Popularity: increment(1),
                        LastPopularityUpdate: currentTime.toDate(),
                        blogViews: increment(1)
                    });
                }
            }
            
            const blogData = userBlogsSnapshot.data();

            const formattedTime = moment(blogData.timestamp.toDate()).format('MMM D, YYYY, h:mm A [GMT]Z');

            if (blogLoader) {
                blogLoader.style.display = 'none';
            }
            if (blogContainer) {
                blogContainer.innerHTML += `
                    <div class="blog-details">
                        <p class="category-para">${blogData.category}</p>
                        <h3 class="blog-main-fb">${blogData.title}</h3>
                        <p class="blog-by-details">by <span class="blog-by-username">${blogData.userName}</span> , <span>${formattedTime}</span></p>
                    </div>
                    <div class="full-blog-img-container">
                        <img src="${blogData.imageUrl}" alt="" class="full-blog-img">
                    </div>
                    <div class="blog-details">
                        <p class="blog-main-fb">${blogData.description}</p>
                    </div>
                    `
            }
        } else {
            blogLoader.style.display = 'none';
            blogContainer.innerHTML = `
            <div class="no-blogs-message">
                <div class="message-container">
                    <p class="no-blogs-heading">Please select a correct blog to view.</p>
                   <a href="index.html"><button class="create-blog-btn">Explore</button></a>
                </div>
            </div>
            `
        }

});