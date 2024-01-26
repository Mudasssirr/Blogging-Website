import { auth, query, collection, where, orderBy, doc, db, getDocs, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, increment } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userID = urlParams.get('UID');

    // console.log(userID);

    // USER PAGE DETAILS


    let userProfilePic = document.getElementById('WWuser-profile-picture');
    let resUserProfilePic = document.getElementById('res-WWuser-profile-img');
    let UserProfilePicSpinner = document.getElementById('profile-pic-spinner');
    let resUserProfilePicSpinner = document.getElementById('res-profile-pic-spinner');

    let userName = document.getElementById('user-name-pfp');
    let resUserName = document.getElementById('res-user-name-pfp');
    let totalBlogsHTML = document.getElementById('total-blogs');

    let UserInfoLoader = document.getElementById('user-saved-info-loader');
    let resUserInfoLoader = document.getElementById('res-user-saved-info-loader');

    let UserBio = document.getElementById('user-bio-pfp');
    let resUserBio = document.getElementById('res-user-bio-pfp');

    let blogHeading = document.getElementById('blog-heading');

    let userBlogs = document.getElementById('users-blogs');
    let blogLoader = document.getElementById('blog-loader');

    //

    let currentPage = 1;
    let currentDocID;

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            let currentUID = user.uid;
            renderBlogs(currentPage, currentUID);
        } else {
            renderBlogs(currentPage);
        }
    });


    async function renderBlogs(currentPage, currentUID) {

        // checking If the user's UID matches the third user's Id

        if (userID === currentUID) {
            location.href = 'profile.html';
        }
        //

        const itemsPerPage = 10;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        const blogRef = collection(db, 'write-wise-blogs');
        const userBlogsQuery = query(blogRef, where('userId', '==', userID), orderBy('timestamp'));

        const userBlogsSnapshot = await getDocs(userBlogsQuery);
        const totalBlogs = userBlogsSnapshot.docs.length;
        const totalPages = Math.ceil(totalBlogs / itemsPerPage);

        const reversedBlogs = userBlogsSnapshot.docs.reverse().slice(startIndex, endIndex);

        const userRef = doc(db, 'write-wise-users', userID);

        try {
            const userBlogsSnapshot = await getDocs(userBlogsQuery);
            const userSnapshot = await getDoc(userRef);

            if (!userSnapshot.exists()) {
                // console.log('User document does not exist');

                UserInfoLoader.style.display = 'none';
                resUserInfoLoader.style.display = 'none';

                UserProfilePicSpinner.style.display = 'none';
                resUserProfilePicSpinner.style.display = 'none';

                blogLoader.style.display = 'none';

                userBlogs.innerHTML = `
            <div class="no-blogs-message">
                <div class="message-container">
                    <p class="no-blogs-heading">User Not Found</p>
                    <p class="no-blogs-subHeading">Sorry, the user you are looking for does not exist.</p>
                </div>
            </div>
        `
                return;
            } else {
                // console.log('User data:', userSnapshot.data());
                
                // incrementing the user's profile views
                await updateDoc(userRef, {
                    profileViews: increment(1)
                });
                UserInfoLoader.style.display = 'none';
                resUserInfoLoader.style.display = 'none';

                userName.innerHTML = userSnapshot.data().fullname;
                resUserName.innerHTML = userSnapshot.data().fullname;
                totalBlogsHTML.innerHTML = `Total Blogs: ${totalBlogs}`;

                if (userSnapshot.data().userbio) {
                    UserBio.innerHTML = userSnapshot.data().userbio;
                    resUserBio.innerHTML = userSnapshot.data().userbio;
                } else {
                    UserBio.innerHTML = 'No Bio';
                    resUserBio.innerHTML = 'No Bio';
                }

                blogHeading.innerHTML = `${userSnapshot.data().firstname}'s Blogs`;

                const userProfilePicDB = userSnapshot.data().profilePicture;
                if (userProfilePicDB !== "") {
                    UserProfilePicSpinner.style.display = 'none';
                    resUserProfilePicSpinner.style.display = 'none';

                    userProfilePic.src = userProfilePicDB;
                    resUserProfilePic.src = userProfilePicDB;
                } else {
                    UserProfilePicSpinner.style.display = 'none';
                    resUserProfilePicSpinner.style.display = 'none';
                }
            }

            if (!userBlogsSnapshot.empty) {

                userBlogs.innerHTML = '';

                reversedBlogs.forEach((doc) => {
                    // console.log('Blog data:', doc.data());

                    blogLoader.style.display = 'none';

                    const maxLength = 40; // Maximum number of words to display

                    // Extracting and truncating the description to maxLength words
                    const description = doc.data().description;
                    const truncatedDescription = description.split(' ').slice(0, maxLength).join(' ');

                    const timestamp = doc.data().timestamp.toDate(); // Assuming timestamp is a Firebase Timestamp
                    const timeAgo = moment(timestamp).fromNow();


                    userBlogs.innerHTML += `
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
                                <li><a class="dropdown-item report-blog" data-blog-id="${doc.id}" data-bs-toggle="modal" data-bs-target="#exampleModal">Report</a></li>
                                <li><a class="dropdown-item archive-blog" data-blog-id="${doc.id}" data-user-id="${currentUID}">Add to Archive</a></li>
                                <li><a class="dropdown-item copy-blog" data-id="${doc.id}">Copy Link</a></li>
                                </ul>
                            </div>
                            <div class="card-body">
                                <h5 class="card-title">${doc.data().title}</h5>
                                <p class="card-text">
                                 <small class="text-body-secondary">by <a href="WWuser.html?UID=${doc.data().userId}">${doc.data().userName}</a></small>
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
            } else {
                console.log('No blogs found for this user');

                blogLoader.style.display = 'none';

                userBlogs.innerHTML = `
            <div class="no-blogs-message">
                <div class="message-container">
                    <p class="no-blogs-heading">No Blogs yet</p>
                    <p class="no-blogs-subHeading">No blogs available currently from this User</p>
                </div>
            </div>
            `
            }



            // Hiding the Add to Archive Option If user is not Logged In

            auth.onAuthStateChanged(async (user) => {
                let archiveBlogs = document.querySelectorAll('.archive-blog')
                if (user) {
                    archiveBlogs.forEach(blog => {
                        blog.style.display = 'block';
                        blog.addEventListener('click', addBlogToArchive);
                    });
                } else {
                    archiveBlogs.forEach(blog => {
                        blog.style.display = 'none';
                        blog.removeEventListener('click', addBlogToArchive);
                        blog.addEventListener('click', dontAddToArchiveFunction);
                    });
                }
            });

            // giving parameters from the blog options to the functions
            userBlogs && userBlogs.addEventListener('click', async (event) => {
                if (event.target.classList.contains('report-blog')) {
                    currentDocID = event.target.getAttribute('data-blog-id');
                }

                if (event.target.classList.contains('copy-blog')) {
                    const docID = event.target.getAttribute('data-id');
                    copyBlogLink(docID);
                }

                if (event.target.classList.contains('archive-blog')) {
                    const docID = event.target.getAttribute('data-blog-id');
                    const userID = event.target.getAttribute('data-user-id');
                    addBlogToArchive(docID, userID);
                }
            });

            // pagination logic
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
                    renderBlogs(selectedPage);
                }
            });

        } catch (error) {
            swal("Error fetching data:", error, "error");
            console.log(error);

            UserInfoLoader.style.display = 'none';
            resUserInfoLoader.style.display = 'none';

            UserProfilePicSpinner.style.display = 'none';
            resUserProfilePicSpinner.style.display = 'none';

            blogLoader.style.display = 'none';

            userBlogs.innerHTML = `
            <div class="no-blogs-message">
                <div class="message-container">
                    <p class="no-blogs-heading">Error</p>
                    <p class="no-blogs-subHeading">There was an error processing your request. Please try again later.</p>
                </div>
            </div>
        `
        }
    }

    // FOR REPORTING A BLOG

    // IF THE USER SELECTS OTHERS IN THE REPORTING MODAL

    const radioSomethingElse = document.getElementById('radioSomethingElse');
    const somethingElseReason = document.getElementById('somethingElseReason');

    // Function to handle the display of the textarea
    function toggleTextarea() {
        if (radioSomethingElse.checked) {
            somethingElseReason.style.display = 'block';
        } else {
            somethingElseReason.style.display = 'none';
        }
    }

    // Initial state check
    toggleTextarea();

    // Adding change event listeners to all radio buttons
    const reportReasons = document.querySelectorAll('input[name="reportReason"]');
    reportReasons.forEach(reason => {
        reason.addEventListener('change', toggleTextarea);
    });

    // FOR VALIDATING THE REPORT

    const reportBlogBtn = document.getElementById('report-blog-btn');
    const reporterEmail = document.getElementById('recipient-email');
    const reportReasonRadio = document.querySelectorAll('input[name="reportReason"]');
    const reportReasonTextarea = document.getElementById('reason-textarea');
    const reportBlogLoader = document.getElementById('report-blog-loader');

    // Function to check form validity
    function isReportValid() {
        let valid = true;

        const reportEmail = document.getElementById('report-email');
        const reportCheckbox = document.getElementById('report-checkbox');
        const reportTextarea = document.getElementById('report-reason-textearea');
        const radioSomethingElse = document.getElementById('radioSomethingElse');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Check if email is present
        if (!reporterEmail.value.trim()) {
            reportEmail.innerHTML = 'Please provide an email address.';
            valid = false;
        } else if (!emailRegex.test(reporterEmail.value.trim())) {
            reportEmail.innerHTML = 'Please provide a valid email address.';
            valid = false;
        } else {
            reportEmail.innerHTML = '';
        }

        // Check if a report reason is selected
        let reasonChecked = false;
        reportReasonRadio.forEach(radio => {
            if (radio.checked) {
                reasonChecked = true;
            }
        });

        if (!reasonChecked) {
            reportCheckbox.innerHTML = 'Please provide a reason to report.';
            valid = false;
        } else {
            reportCheckbox.innerHTML = '';
        }

        // Check if "Something else" reason is selected and the textarea is filled
        if (reasonChecked && radioSomethingElse.checked) {
            const textareaValue = reportReasonTextarea.value.trim();
            if (!textareaValue) {
                reportTextarea.innerHTML = 'Please specify a reason to report.';
                valid = false;
            } else {
                reportTextarea.innerHTML = '';
            }
        }

        if (valid === false) {
            reportBlogBtn.disabled = true;
            // console.log('button disabled')
        } else {
            // console.log('button enabled')
            reportBlogBtn.disabled = false;
        }

        return valid;
    }

    // // Event listeners for input validation
    reporterEmail && reporterEmail.addEventListener('input', isReportValid);
    reportReasonTextarea && reportReasonTextarea.addEventListener('input', isReportValid);
    reportReasonRadio && reportReasonRadio.forEach(radio => {
        radio.addEventListener('change', isReportValid);
    });

    // Dismiss the modal
    const ReportModal = new bootstrap.Modal(document.getElementById('exampleModal'));

    // Event listener for report button click
    reportBlogBtn && reportBlogBtn.addEventListener('click', async () => {
        if (isReportValid()) {
            showReportLoader();
            const blogDocRef = doc(db, 'write-wise-blogs', currentDocID);
            const blogDocSnap = await getDoc(blogDocRef);

            if (blogDocSnap.exists()) {
                const username = blogDocSnap.data().userName;
                const reportersEmail = reporterEmail.value.trim();
                const repotersReportReason = reportReasonTextarea.value.trim();

                let selectedReason = '';
                reportReasonRadio.forEach(radio => {
                    if (radio.checked) {
                        selectedReason = radio.value;
                    }
                });

                if (radioSomethingElse.checked) {
                    const blogRefRep = collection(db, 'write-wise-reports');
                    await addDoc(blogRefRep, {
                        blogId: currentDocID,
                        reportedUser: username,
                        reporterEmail: reportersEmail,
                        reportReason: selectedReason,
                        customReason: repotersReportReason,
                        timestamp: serverTimestamp()
                    });

                    const blogRef = doc(db, 'write-wise-blogs', currentDocID);
                    const currentReports = blogDocSnap.data().Reports;
                    if (currentReports >= 7) {
                        const reportsQuery = query(blogRefRep, where('blogId', '==', currentDocID));
                        const reportsSnapshot = await getDocs(reportsQuery);
                        reportsSnapshot.forEach(async (doc) => {
                            await deleteDoc(doc.ref);
                        });
                        await deleteDoc(blogRef);
                        location.reload();
                        localStorage.setItem('blog-reported-deleted', 'true');
                    } else {
                        await updateDoc(blogRef, {
                            Reports: increment(1)
                        });
                    }
                } else {
                    const blogRefRep = collection(db, 'write-wise-reports');
                    await addDoc(blogRefRep, {
                        blogId: currentDocID,
                        reportedUser: username,
                        reporterEmail: reportersEmail,
                        reportReason: selectedReason,
                        timestamp: serverTimestamp()
                    });
                    const blogRef = doc(db, 'write-wise-blogs', currentDocID);
                    const currentReports = blogDocSnap.data().Reports;
                    if (currentReports >= 7) {
                        const reportsQuery = query(blogRefRep, where('blogId', '==', currentDocID));
                        const reportsSnapshot = await getDocs(reportsQuery);
                        reportsSnapshot.forEach(async (doc) => {
                            await deleteDoc(doc.ref);
                        });
                        await deleteDoc(blogRef);
                        location.reload();
                        localStorage.setItem('blog-reported-deleted', 'true');
                    } else {
                        await updateDoc(blogRef, {
                            Reports: increment(1)
                        });
                    }
                }

                hideReportLoader();
                ReportModal.hide();
                swal("Success", "Blog reported successfully!", "success");

            }
        }
    });

    function showReportLoader() {
        reportBlogLoader.style.display = 'flex';
        reportBlogBtn.style.color = 'transparent';
    }

    function hideReportLoader() {
        reportBlogLoader.style.display = 'none';
        reportBlogBtn.style.color = 'white';
    }

    // FOR ADDING THE BLOG TO THE USER'S ARCHIVE

    async function addBlogToArchive(docID, userID) {
        let documentId = docID.toString();

        const blogRefAr = doc(db, 'write-wise-blogs', documentId);
        try {
            const userBlogsSnapshotAr = await getDoc(blogRefAr);
            if (userBlogsSnapshotAr.exists()) {
                const blogData = userBlogsSnapshotAr.data();
                if (blogData && userID !== "undefined") {
                    const blogId = docID;

                    // Check if the blog already exists in the user's archive
                    const archiveRef = collection(db, 'WW-User-archived-blogs');
                    const querySnapshot = await getDocs(
                        query(archiveRef, where('currentUserID', '==', userID), where('blogId', '==', blogId))
                    );

                    if (!querySnapshot.empty) {
                        showSnackbarFunction('Blog already exists in your archive!');
                        return; // Exit the function to avoid adding duplicates
                    }

                    // If the blog doesn't exist in the archive, add it
                    const blogRef = collection(db, 'WW-User-archived-blogs');
                    await addDoc(blogRef, {
                        currentUserID: userID,
                        blogId: blogId,
                        title: blogData.title,
                        description: blogData.description,
                        imageUrl: blogData.imageUrl,
                        category: blogData.category,
                        timestamp: blogData.timestamp,
                        userId: blogData.userId,
                        userName: blogData.userName,
                        updated: false
                    });

                    showSnackbarFunction('Blog saved in archive!');
                } else {
                    console.error('Blog data is undefined or user is not logged in');
                }
            }
        } catch (error) {
            swal('Error', `Error fetching document: ${error}`, 'error');
        }
    }

    // FOR SHOWING THE USER ERROR IF HE'S NOT LOGGED IN AND TRIES TO ADD A BLOG TO THE ARCHIVE

    function dontAddToArchiveFunction() {
        swal("Error", "Please Sign In to Access this feature.", "error");
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
});