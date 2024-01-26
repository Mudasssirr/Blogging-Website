// ----- USER BLOG SETUP -----
import { auth, doc, addDoc, db, getDoc, getDocs, deleteDoc, query, where, orderBy, updateDoc, collection, serverTimestamp, storage, ref, getDownloadURL, uploadBytes, deleteObject } from './firebase.js'


// FOR SHOWING THE USER'S BLOGS

const usersBlogContainer = document.getElementById('users-blogs');
let blogLoader = document.getElementById('blog-loader');
let totalBlogsHTML = document.getElementById('total-blogs');

let currentPage = 1;

auth.onAuthStateChanged(async (user) => {
    renderUserBlogs(user, currentPage)
});

async function renderUserBlogs(user, currentPage) {
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    if (user) {

        // blog reference
        const blogRef = collection(db, 'write-wise-blogs');
        const userBlogsQuery = query(blogRef, where('userId', '==', user.uid), orderBy('timestamp'));

        const userBlogsSnapshot = await getDocs(userBlogsQuery);
        const totalBlogs = userBlogsSnapshot.docs.length;
        const totalPages = Math.ceil(totalBlogs / itemsPerPage);

        if (totalBlogsHTML) {
            totalBlogsHTML.innerHTML = `Total Blogs: ${totalBlogs}`;
        }

        // user reference
        const userRef = doc(db, "write-wise-users", user.uid);
        const userSnap = await getDoc(userRef);

        // for showing user's profile views
        let profileViewNum = document.getElementById('profile-views-num');
        let profileView = 0;
        if (userSnap.exists()) {
            let pfpviews = userSnap.data().profileViews || 0;
            profileView += pfpviews;
            if (profileView < 10 && profileView > 0) {
                profileViewNum.innerHTML = `0${profileView}`;
            } else {
                profileViewNum.innerHTML = profileView;
            }
        }

        if (userBlogsSnapshot.empty) {
            blogLoader.style.display = 'none';
            if (usersBlogContainer) {
                usersBlogContainer.innerHTML = `
            <div class="no-blogs-message">
                <div class="message-container">
                    <p class="no-blogs-heading">No Blogs yet</p>
                    <p class="no-blogs-subHeading">No blogs available currently. Start sharing your stories!</p>
                   <button class="create-blog-btn" onclick="createBlogs()">Create One</button>
                </div>
            </div>
            `;
            }
        } else {

            if (usersBlogContainer) {
                usersBlogContainer.innerHTML = '';

                let blogViewsNum = document.getElementById('blog-views-num');
                let totalBlogViews = 0;

                const reversedBlogs = userBlogsSnapshot.docs.reverse().slice(startIndex, endIndex); // Reverse the array to start with the most recent blog
                reversedBlogs.forEach((doc) => {
                    // console.log(doc.id, ' => ', doc.data());

                    // for showing user's blog views
                    const blogViews = doc.data().blogViews || 0;
                    totalBlogViews += blogViews;
                    if (totalBlogViews < 10 && totalBlogViews > 0) {
                        blogViewsNum.innerHTML = `0${totalBlogViews}`;
                    } else {
                        blogViewsNum.innerHTML = totalBlogViews;
                    }

                    if (blogLoader) {
                        blogLoader.style.display = 'none';
                    }

                    const maxLength = 40; // Maximum number of words to display

                    // Extracting and truncating the description to maxLength words
                    const description = doc.data().description;
                    const truncatedDescription = description.split(' ').slice(0, maxLength).join(' ');

                    const timestamp = doc.data().timestamp.toDate(); // Assuming timestamp is a Firebase Timestamp
                    const timeAgo = moment(timestamp).fromNow();

                    usersBlogContainer.innerHTML += `
                    <div class="card mt-3 mb-2">
                    <div class="row g-0">
                        <div class="col-md-4">
                            <img src="${doc.data().imageUrl}"
                                class="img-fluid rounded-start user-blogs-img" alt="...">
                        </div>
                        <div class="col-md-8">
                            <div class="dropdown">
                                <button class="dropdown-icon" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item edit-blog" data-blog-id="${doc.id}" data-user-id="${doc.data().userId}">Edit</a></li>
                                    <li><a class="dropdown-item delete-blog" data-id="${doc.id}" data-image="${doc.data().imageUrl}">Delete</a></li>
                                    <li><a class="dropdown-item copy-blog" data-id="${doc.id}">Copy Link</a></li>
                                </ul>
                            </div>
                            <div class="card-body">
                                <h5 class="card-title">${doc.data().title}</h5>
                                <p class="card-text">
                                 <small class="text-body-secondary">by <a href="profile.html">${doc.data().userName}</a></small>
                                 <small>, <span class="category-p">Category: </span> ${doc.data().category}</small>
                                </p>
                                <p class="card-text">${truncatedDescription}....</p>
                                <p class="card-text"><small class="text-body-secondary">Uploaded ${timeAgo}</small>
                                </p>
                                <a href="fullBlogs.html?blogId=${doc.id}"><button class="read-more-btn" href="fullBlogs.html?blogId=${doc.id}">Read More<i class="bi bi-arrow-right"></i></button></a>
                            </div>
                        </div>
                    </div>
                </div>
                `
                });
            }
        }

        // Pagination logic
        const pagination = document.querySelector('.pagination');
        if (pagination) {
            pagination.innerHTML = '';

            for (let i = 1; i <= totalPages; i++) {
                const li = document.createElement('li');
                li.classList.add('page-item');
                if (i === currentPage) {
                    li.classList.add('active');
                }

                const link = document.createElement('a');
                link.classList.add('page-link');
                link.textContent = i;
                link.href = '#';
                li.appendChild(link);

                pagination.appendChild(li);
            }
        }

        pagination && pagination.addEventListener('click', (event) => {
            if (event.target.tagName === 'A') {
                const selectedPage = parseInt(event.target.textContent);
                renderUserBlogs(user, selectedPage);
            }
        });


    } else {
        // console.log('User not logged in.');
    }

    usersBlogContainer && usersBlogContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-blog')) {
            const docID = event.target.getAttribute('data-id');
            const imageUrl = event.target.getAttribute('data-image');
            deleteBlog(docID, imageUrl);
        }
        if (event.target.classList.contains('edit-blog')) {
            const blogId = event.target.dataset.blogId;
            const userId = event.target.getAttribute('data-user-id');
            const docRef = doc(db, "write-wise-blogs", blogId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // console.log("Document data:", docSnap.data());
                editBlog(docSnap.data());
                performBlogUpdate(userId, blogId);

                blogUpdateBtn.setAttribute('data-blog-id', blogId);
                blogUpdateBtn.setAttribute('data-user-id', userId);
            } else {
                // console.log("No such document!");
            }
        }
        if (event.target.classList.contains('copy-blog')) {
            const docID = event.target.getAttribute('data-id');
            copyBlogLink(docID);
        }
    });
};

// FOR DELETING THE USER'S BLOG

async function deleteBlog(docID, imageURL) {
    swal({
        title: "Are you sure?",
        text: "Are you sure you want to delete this blog?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then(async (willDelete) => {
        if (willDelete) {
            delLoader()
            const imageRef = ref(storage, `${imageURL}`);
            await deleteObject(imageRef);
            await deleteDoc(doc(db, "write-wise-blogs", docID));

            // Delete corresponding entry from WW-user-archived-blogs collection
            try {
                const archiveRef = collection(db, 'WW-User-archived-blogs');
                const querySnapshot = await getDocs(query(archiveRef, where('blogId', '==', docID)));

                querySnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                    // console.log(`Archived blog with ID ${docID} deleted.`);
                });
            } catch (error) {
                // console.error(`Error deleting archived blog with ID ${docID}: ${error}`);
            }

            location.reload();
            localStorage.setItem('blog-deleted', 'true');
        } else {
        }
    });
}

let delBlogLoader = document.getElementById("delete-blog-loader")
function delLoader() {
    delBlogLoader.style.display = 'flex';
    usersBlogContainer.style.display = 'none';
}

// FOR EDITING THE USER'S BLOG

const updateBlogs = document.getElementById('update-blogs-div');
const blogUpdateBtn = document.getElementById('blog-update-btn');
const blogTitleUpdateInput = document.getElementById('blog-title-input-update');
const blogDescUpdateTextarea = document.getElementById('blog-desc-textarea-update');
const blogUpdateImageInput = document.getElementById('update-blog-select');
const blogCategoryUpdate = document.getElementById('category-dropdown-update');
const blogUpdateLoader = document.getElementById('blog-update-loader');
let blogPagination = document.getElementById('blog-pagination');
let viewAnalyticsBtn = document.getElementById('view-analytics-btn');

blogUpdateBtn && blogUpdateBtn.addEventListener('click', async () => {
    const fieldsValid = validateUpdateInputs();
    if (fieldsValid) {
        const blogId = blogUpdateBtn.dataset.blogId;
        const userId = blogUpdateBtn.dataset.userId;
        await performBlogUpdate(userId, blogId);
    }
});

async function performBlogUpdate(userId, blogId) {
    const blogTitle = blogTitleUpdateInput.value.trim();
    const blogDesc = blogDescUpdateTextarea.value.trim();
    const blogImage = blogUpdateImageInput.files[0]; // Access the first file selected
    const BlogCategoryValue = blogCategoryUpdate.value;

    if (blogImage) {
        showUpdateLoader();

        const timestamp = new Date().getTime();
        const imageName = `blog_${timestamp}_${blogImage.name}`;
        const storageRef = ref(storage, `BlogImages/${userId}/${imageName}`);
        const fileSnapshot = await uploadBytes(storageRef, blogImage);
        const imageUrl = await getDownloadURL(fileSnapshot.ref);

        const blogRef = doc(db, 'write-wise-blogs', blogId);
        const blogSnapshot = await getDoc(blogRef);
        const currentImageUrl = blogSnapshot.data().imageUrl;
        const imageRef = ref(storage, `${currentImageUrl}`);

        // Delete the old image if it exists
        if (imageRef) {
            await deleteObject(imageRef);
        }

        await updateDoc(blogRef, {
            title: blogTitle,
            description: blogDesc,
            imageUrl: imageUrl,
            category: BlogCategoryValue,
        });

        // Update the corresponding entry in the archive
        try {
            const archiveRef = collection(db, 'WW-User-archived-blogs');
            const querySnapshot = await getDocs(
                query(archiveRef, where('blogId', '==', blogId))
            );

            querySnapshot.forEach(async (doc) => {
                await updateDoc(doc.ref, {
                    title: blogTitle,
                    description: blogDesc,
                    imageUrl: imageUrl,
                    category: BlogCategoryValue,
                    updated: true
                });
                // console.log(`Archive entry for blog ID ${blogId} updated.`);
            });
        } catch (error) {
            // console.error(`Error updating archive entry for blog ID ${blogId}: ${error}`);
        }

        localStorage.setItem('Blog-Updated', 'true');
        hideUpdateLoader();
        location.reload()
    } else {
        hideUpdateLoader();
    }
}

function validateUpdateInputs() {
    const blogTitle = blogTitleUpdateInput.value.trim();
    const blogDesc = blogDescUpdateTextarea.value.trim();
    const blogImage = blogUpdateImageInput.files[0];

    const blogTitleError = document.getElementById('blog-title-update-err');
    const blogDescError = document.getElementById('blog-desc-update-err');
    const blogImgError = document.getElementById('blog-img-update-err');

    if (!blogTitle) {
        blogTitleError.innerHTML = 'Please add a blog title.';
    } else if (blogTitle.split(' ').length > 25) {
        blogTitleError.innerHTML = 'Title should not exceed 25 words';
    } else {
        blogTitleError.innerHTML = '';
    }

    if (!blogDesc) {
        blogDescError.innerHTML = 'Please add a blog description.';
    } else if (blogDesc.split(' ').length < 100) {
        blogDescError.innerHTML = 'Blog description should be at least 100 words.';
    } else {
        blogDescError.innerHTML = '';
    }

    if (!blogImage) {
        blogImgError.innerHTML = 'Please select a blog image.';
    } else {
        blogImgError.innerHTML = '';
    }

    // Enable or disable button based on field validation
    if (!blogTitle || !blogDesc || blogDesc.split(' ').length < 100 || !blogImage) {
        blogPublishBtn.disabled = true;
        return false; // Indicates fields are not valid
    } else {
        blogPublishBtn.disabled = false;
        return true; // Indicates fields are valid
    }
}


async function editBlog(blogData) {
    createBlogBtn.style.display = 'none';
    userBlogs.style.display = 'none';
    blogPagination.style.display = 'none';
    viewAnalyticsBtn.style.display = 'none';
    updateBlogs.style.display = 'flex';

    blogTitleUpdateInput.value = blogData.title;
    blogDescUpdateTextarea.value = blogData.description;
    blogCategoryUpdate.value = blogData.category;
}

function showUpdateLoader() {
    blogUpdateLoader.style.display = 'flex';
    blogUpdateBtn.style.color = 'transparent';
}
function hideUpdateLoader() {
    blogUpdateLoader.style.display = 'none';
    blogUpdateBtn.style.color = 'white';
}

// Event listeners for input validation
blogTitleUpdateInput && blogTitleUpdateInput.addEventListener('input', validateUpdateInputs);
blogDescUpdateTextarea && blogDescUpdateTextarea.addEventListener('input', validateUpdateInputs);
blogUpdateImageInput && blogUpdateImageInput.addEventListener('input', validateUpdateInputs);

// FOR COPYING THE BLOG'S LINK

function showSnackbarFunction(message) {
    const snackbar = document.getElementById("snackbar");
    snackbar.innerText = message;
    snackbar.style.right = "20px";
    snackbar.style.display = "block";

    setTimeout(function () {
        snackbar.style.right = "-300px";
    }, 3000);
}

function copyBlogLink(docID) {
    const blogId = docID;
    const blogURL = `https://write-wise.netlify.app/fullBlogs?blogId=${blogId}`;

    // Create a temporary textarea to copy the link
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = blogURL;

    // Append the textarea to the body
    document.body.appendChild(tempTextarea);

    // Select the URL text
    tempTextarea.select();
    tempTextarea.setSelectionRange(0, 99999); // For mobile devices

    // Copy the URL to the clipboard
    document.execCommand('copy');

    // Remove the temporary textarea
    document.body.removeChild(tempTextarea);

    // Show snackbar message
    showSnackbarFunction('Link copied to clipboard!');
}

// FOR ADDING A NEW BLOG

const blogPublishBtn = document.getElementById('blog-publish-btn');
const blogTitleInput = document.getElementById('blog-title-input');
const blogDescTextarea = document.getElementById('blog-desc-textarea');
const blogImageInput = document.getElementById('user-blog-select');
const blogCategory = document.getElementById('category-dropdown');
const blogPublishLoader = document.getElementById('blog-publish-loader');

// Function to check form validity
function isFormValid() {
    const blogTitle = blogTitleInput.value.trim();
    const blogDesc = blogDescTextarea.value.trim();
    const blogImage = blogImageInput.files[0];

    const blogTitleError = document.getElementById('blog-title-err');
    const blogDescError = document.getElementById('blog-desc-err');
    const blogImgError = document.getElementById('blog-img-err');

    let valid = true;

    if (!blogTitle) {
        blogTitleError.innerHTML = 'Please add a blog title.';
        valid = false;
    } else {
        blogTitleError.innerHTML = '';
    }

    if (!blogDesc) {
        blogDescError.innerHTML = 'Please add a blog description.';
        valid = false;
    } else if (blogDesc.split(' ').length < 100) {
        blogDescError.innerHTML = 'Blog description should be at least 100 words.';
        valid = false;
    } else {
        blogDescError.innerHTML = '';
    }

    if (!blogImage) {
        blogImgError.innerHTML = 'Please select a blog image.';
        valid = false;
    } else {
        blogImgError.innerHTML = '';
    }

    return valid;
}

// Function to validate the inputs
function validateInputs() {
    const blogTitle = blogTitleInput.value.trim();
    const blogDesc = blogDescTextarea.value.trim();
    const blogImage = blogImageInput.value.trim();

    const blogTitleError = document.getElementById('blog-title-err');
    const blogDescError = document.getElementById('blog-desc-err');
    const blogImgError = document.getElementById('blog-img-err');

    if (!blogTitle) {
        blogTitleError.innerHTML = 'Please add a blog title.';
    } else if (blogTitle.split(' ').length > 25) {
        blogTitleError.innerHTML = 'Title should not exceed 25 words';
    } else {
        blogTitleError.innerHTML = '';
    }

    if (!blogDesc) {
        blogDescError.innerHTML = 'Please add a blog description.';
    } else if (blogDesc.split(' ').length < 100) {
        blogDescError.innerHTML = 'Blog description should be at least 100 words.';
    } else {
        blogDescError.innerHTML = '';
    }

    if (!blogImage) {
        blogImgError.innerHTML = 'Please select a blog image.';
    } else {
        blogImgError.innerHTML = '';
    }

    // Enable or disable button based on field validation
    if (!blogTitle || !blogDesc || blogDesc.split(' ').length < 100 || !blogImage) {
        blogPublishBtn.disabled = true;
    } else {
        blogPublishBtn.disabled = false;
    }
}

blogPublishBtn && blogPublishBtn.addEventListener('click', async () => {
    if (isFormValid()) {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                showLoader();
                const docRef = doc(db, 'write-wise-users', user.uid);
                const docSnap = await getDoc(docRef);
                const fullname = docSnap.data().fullname;

                const blogTitle = blogTitleInput.value.trim();
                const blogDesc = blogDescTextarea.value.trim();
                const blogImage = blogImageInput.files[0];
                const BlogCategoryValue = blogCategory.value;

                if (blogTitle && blogDesc && blogDesc.split(' ').length >= 100 && blogImage) {
                    const timestamp = new Date().getTime();
                    const imageName = `blog_${timestamp}_${blogImage.name}`;

                    const storageRef = ref(storage, `BlogImages/${user.uid}/${imageName}`);
                    const fileSnapshot = await uploadBytes(storageRef, selectedFile);
                    const imageUrl = await getDownloadURL(fileSnapshot.ref);

                    // Save blog details to Firestore
                    const blogRef = collection(db, 'write-wise-blogs');
                    await addDoc(blogRef, {
                        title: blogTitle,
                        description: blogDesc,
                        imageUrl: imageUrl,
                        category: BlogCategoryValue,
                        timestamp: serverTimestamp(),
                        userId: user.uid,
                        userName: fullname,
                        Reports: 0,
                        Popularity: 0,
                        blogViews: 0,
                        LastPopularityUpdate: serverTimestamp()
                    });
                    hideLoader();
                    location.reload();
                    localStorage.setItem('Blog-Saved', 'true');
                }
            } else {
                // console.log('User not logged in.');
            }
        });
    }
});


// Event listeners for input validation
blogTitleInput && blogTitleInput.addEventListener('input', validateInputs);
blogDescTextarea && blogDescTextarea.addEventListener('input', validateInputs);
blogImageInput && blogImageInput.addEventListener('input', validateInputs);

function showLoader() {
    blogPublishLoader.style.display = 'block';
    blogPublishBtn.style.color = 'transparent';
}

function hideLoader() {
    blogPublishLoader.style.display = 'none';
    blogPublishBtn.style.color = 'white';
}