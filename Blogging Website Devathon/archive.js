import { auth, db, getDocs, collection, query, where, orderBy, doc, deleteDoc } from './firebase.js'

// FOR SHOWING ALL THE BLOGS

const allBlogContainer = document.getElementById('all-blogs');
let blogLoader = document.getElementById('blog-loader');
let blogPagination = document.getElementById('blog-pagination');

let currentPage = 1;

auth.onAuthStateChanged(async (user) => {
    if (user) {
        let currentUID = user.uid;
        renderBlogs(currentPage, currentUID);
    } else {
        renderBlogs(currentPage);
    }
});

async function renderBlogs(currentPage, currentUID) {
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;


    const blogRef = collection(db, 'WW-User-archived-blogs');
    const userBlogsQuery = query(blogRef, where('currentUserID', '==', currentUID), orderBy('timestamp'));
    const userBlogsSnapshot = await getDocs(userBlogsQuery);
    const totalBlogs = userBlogsSnapshot.docs.length;
    const totalPages = Math.ceil(totalBlogs / itemsPerPage);

    const reversedBlogs = userBlogsSnapshot.docs.reverse().slice(startIndex, endIndex);

    if (userBlogsSnapshot.empty) {
        blogLoader.style.display = 'none';
        blogPagination.style.display = 'none';
        allBlogContainer.innerHTML = `
            <div class="no-blogs-message">
                <div class="message-container">
                    <p class="no-blogs-heading">No Blogs yet</p>
                    <p class="no-blogs-subHeading">No blogs currently available in your archive. Previously saved blogs might have been deleted by the author.</p>
                </div>
            </div>
            `;
    } else {
        allBlogContainer.innerHTML = '';

        reversedBlogs.forEach((doc) => {
            // console.log(doc.id, ' => ', doc.data());
            if (blogLoader) {
                blogLoader.style.display = 'none';
            }
            const maxLength = 50; // Maximum number of words to display

            // Extracting and truncating the description to maxLength words
            const description = doc.data().description;
            const truncatedDescription = description.split(' ').slice(0, maxLength).join(' ');

            const timestamp = doc.data().timestamp.toDate(); // Assuming timestamp is a Firebase Timestamp
            const timeAgo = moment(timestamp).fromNow();

            if (allBlogContainer) {
                allBlogContainer.innerHTML += `
                    <div class="card mt-3 mb-2">
                    <div class="row g-0">
                        <div class="col-md-4">
                            <img src="${doc.data().imageUrl}" class="img-fluid rounded-start user-blogs-img"
                                alt="...">
                        </div>
                        <div class="col-md-8">
                            <div class="dropdown">
                                <button class="dropdown-icon" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item remove-archive" data-blog-id="${doc.id}">Remove from Archive</a></li>
                                    <li><a class="dropdown-item copy-blog" data-blog-id="${doc.data().blogId}">Copy Link</a></li>
                                </ul>
                            </div>
                            <div class="card-body">
                                <h5 class="card-title">${doc.data().title}</h5>
                                <p class="card-text">
                                    <small class="text-body-secondary">by <a class="user-link" data-uid="${doc.data().userId}">${doc.data().userName}</a></small>
                                    <small>, <span class="category-p">Category: </span>${doc.data().category}</small>
                                    <small> <span class="updated-p" id="updated-p"></span></small>
                                </p>
                                <p class="card-text">${truncatedDescription}....</p>
                                <p class="card-text"><small class="text-body-secondary">Uploaded ${timeAgo}</small>
                                </p>
                                <a href="fullBlogs.html?blogId=${doc.data().blogId}"><button class="read-more-btn"
                                        href="fullBlogs.html?blogId=${doc.data().blogId}">Read More<i
                                            class="bi bi-arrow-right"></i></button></a>
                            </div>
                        </div>
                    </div>
                </div>
            `
            }

            let updatedPara = document.getElementById('updated-p');
            if(doc.data().updated == true){
                updatedPara.innerHTML = ', (Updated)';
            }else{
                updatedPara.innerHTML = '';
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
        });

        // Pagination logic
        const pagination = document.querySelector('.pagination');
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

        pagination.addEventListener('click', (event) => {
            if (event.target.tagName === 'A') {
                const selectedPage = parseInt(event.target.textContent);
                renderBlogs(selectedPage, currentUID);
            }
        });

        allBlogContainer && allBlogContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('copy-blog')) {
                const docID = event.target.getAttribute('data-blog-id');
                copyBlogLink(docID);
            }

            if (event.target.classList.contains('remove-archive')) {
                const docID = event.target.getAttribute('data-blog-id');
                removeBlog(docID);
            }
        });
    }
}


// FOR REMOVING THE BLOG IN ARCHIVE

async function removeBlog(docID) {
    swal({
        title: "Are you sure?",
        text: "Are you sure you want to remove this blog?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then(async (willDelete) => {
        if (willDelete) {
            await deleteDoc(doc(db, "WW-User-archived-blogs", docID));
            location.reload();
            localStorage.setItem('archived-blog-remove', 'true');
        } else {
        }
    });
}

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