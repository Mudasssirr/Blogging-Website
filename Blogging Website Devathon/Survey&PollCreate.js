import { auth, doc, addDoc, db, setDoc, getDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy, collection, increment } from './firebase.js'

// FOR SHOWING THE CARDS OF POLL AND SURVEY
const allBlogContainer = document.getElementById('surveysNpolls');
let blogLoader = document.getElementById('blog-loader');
let blogPagination = document.getElementById('blog-pagination');

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

let reversedBlogs;
let optionsContainerId;

async function renderBlogs(currentPage, currentUID) {
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const blogRef = collection(db, 'write-wise-survey-polls');
    const userBlogsQuery = query(blogRef, orderBy('Votes'));
    const userBlogsSnapshot = await getDocs(userBlogsQuery);
    const totalBlogs = userBlogsSnapshot.docs.length;
    const totalPages = Math.ceil(totalBlogs / itemsPerPage);

    reversedBlogs = userBlogsSnapshot.docs.reverse().slice(startIndex, endIndex);

    if (userBlogsSnapshot.empty) {
        blogLoader.style.display = 'none';
        blogPagination.style.display = 'none';
        allBlogContainer.innerHTML = `
            <div class="no-blogs-message">
                <div class="message-container">
                    <p class="no-blogs-heading">No Surveys or Polls yet</p>
                    <p class="no-blogs-subHeading">No Surveys or Polls available currently. Create your own!</p>
                </div>
            </div>
        `;
    } else {
        allBlogContainer.innerHTML = '';
        reversedBlogs.forEach(async (blogDoc) => {
            if (blogLoader) {
                blogLoader.style.display = 'none';
            }

            const timestamp = blogDoc.data().timestamp.toDate();
            const timeAgo = moment(timestamp).fromNow();

            if (allBlogContainer) {
                allBlogContainer.innerHTML += renderBlogHTML(blogDoc, timeAgo, currentUID);
            }
        });

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
    }

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

    pagination.addEventListener('click', async (event) => {
        if (event.target.tagName === 'A') {
            const selectedPage = parseInt(event.target.textContent);
            await renderBlogs(selectedPage, currentUID);

            reversedBlogs.forEach(async (blogDoc) => {
                const blogId = blogDoc.id;
                // Retrieve and set the checked status to show the checked status of every Poll/Survey
                const userVoteRef = doc(db, 'User-Survey-Poll-Votes', `${currentUID}_${blogId}`);
                const userVoteSnapshot = await getDoc(userVoteRef);
                if (userVoteSnapshot.exists()) {
                    const selectedOption = userVoteSnapshot.data().selectedOption;
                    const radioInput = document.querySelector(`input[value="${selectedOption}"]`);
                    const optionsContainer = document.getElementById(`options_${blogId}`);
                    if (radioInput && optionsContainer) {
                        radioInput.checked = true;
                        updateVotePercentages(optionsContainer, blogDoc.data(), blogId);
                    }
                }
            });
        }
    });

    allBlogContainer && allBlogContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('report-blog')) {
            currentDocID = event.target.getAttribute('data-blog-id');
        }
        if (event.target.classList.contains('edit-blog')) {
            const blogId = event.target.dataset.blogId;
            const userId = event.target.getAttribute('data-user-id');
            const docRef = doc(db, "write-wise-survey-polls", blogId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // console.log("Document data:", docSnap.data());
                editQuestionare(docSnap.data());

                editQuestionareBtn.setAttribute('data-blog-id', blogId);
                editQuestionareBtn.setAttribute('data-user-id', userId);
            } else {
                // console.log("No such document!");
            }
        }
        if (event.target.classList.contains('delete-blog')) {
            const docID = event.target.getAttribute('data-id');
            deleteQuestionare(docID);
        }
    });
}

function renderBlogHTML(blogDoc, timeAgo, currentUID) {
    optionsContainerId = `options_${blogDoc.id}`;
    const isCurrentUserOwner = blogDoc.data().userId === currentUID;

    let dropdownOptions = '';

    if (isCurrentUserOwner) {
        dropdownOptions = `
        <li><a class="dropdown-item edit-blog" data-blog-id="${blogDoc.id}" data-user-id="${blogDoc.data().userId}">Edit</a></li>            
        <li><a class="dropdown-item delete-blog" data-id="${blogDoc.id}">Delete</a></li>
        `;
    } else {
        dropdownOptions = `
        <li><a class="dropdown-item report-blog" data-blog-id="${blogDoc.id}" data-bs-toggle="modal" data-bs-target="#exampleModal">Report</a></li>
        `;
    }
    return `
        <div class="card row g-0 mt-3">
            <div class="dropdown">
                <button class="dropdown-icon" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu">
                ${dropdownOptions}
                </ul>
            </div>
            <div class="card-body">
                <div>
                    <h5 class="card-title mb-3">Q: ${blogDoc.data().question}</h5>
                </div>
                <div class="mb-3">
                    <small class="text-body-secondary">${blogDoc.data().questionType} by 
                        <a class="user-link" data-uid="${blogDoc.data().userId}">
                            ${blogDoc.data().userName}
                        </a>
                    </small>
                </div>
                <div id="${optionsContainerId}">
                    ${renderOptions(blogDoc)}
                    <div>
                        <p class="no-of-votes">${blogDoc.data().Votes} Votes</p>
                        <p class="card-text"><small class="text-body-secondary">Uploaded ${timeAgo}</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderOptions(blogDoc) {
    const optionsContainerId = `options_${blogDoc.id}`;
    const optionKeys = Object.keys(blogDoc.data().options).sort();

    return optionKeys.map((optionKey) => {
        const optionText = blogDoc.data().options[optionKey].text;
        return `
            <div class="form-check mb-3">
                <input class="form-check-input" type="radio" name="${optionsContainerId}" id="radio${optionKey}_${blogDoc.id}" value="${optionKey}_${blogDoc.id}">
                <label class="form-check-label" for="radio${optionKey}_${blogDoc.id}">
                    ${optionText}
                </label>
                <span class="vote-percent ${optionKey}_${blogDoc.id}"></span>
            </div>
        `;
    }).join('');
}

// Event listener to check which option got selected and save it
allBlogContainer.addEventListener('change', async (event) => {
    const user = auth.currentUser;

    if (user && event.target.classList.contains('form-check-input')) {
        const selectedOption = event.target.value;
        const blogId = selectedOption.split('_')[1];
        const pollRef = doc(db, 'write-wise-survey-polls', blogId);
        const optionVotesPath = `options.${selectedOption.split('_')[0]}.votes`;

        const blogDocSnapshot = await getDoc(pollRef);
        const blogDoc = blogDocSnapshot.data();
        const userVoteRef = doc(db, 'User-Survey-Poll-Votes', `${user.uid}_${blogId}`);
        const userVoteSnapshot = await getDoc(userVoteRef);

        if (!userVoteSnapshot.exists()) {
            // User is voting for the first time
            const updateData = {
                [optionVotesPath]: blogDoc.options[selectedOption.split('_')[0]].votes + 1,
                Votes: blogDoc.Votes + 1,
            };

            await updateDoc(pollRef, updateData);
            await setDoc(userVoteRef, { selectedOption }, { merge: true });
        } else {
            // User is changing the selected option
            const prevSelectedOption = userVoteSnapshot.data().selectedOption;
            const prevOptionVotesPath = `options.${prevSelectedOption.split('_')[0]}.votes`;

            if (prevSelectedOption !== selectedOption) {
                const updateData = {
                    [prevOptionVotesPath]: blogDoc.options[prevSelectedOption.split('_')[0]].votes - 1,
                    [optionVotesPath]: blogDoc.options[selectedOption.split('_')[0]].votes + 1,
                };

                await updateDoc(pollRef, updateData);
                await setDoc(userVoteRef, { selectedOption }, { merge: true });
            } else {
                // console.log('Same option selected. No changes made.');
            }
        }

        // Update percentages
        const optionsContainer = document.getElementById(`options_${blogId}`);
        await updateVotePercentages(optionsContainer, blogDoc, blogId);

        // console.log('Vote successful');
    } else {
        // console.log('User not logged in. Cannot vote.');
        // Optionally, you can show a message to the user to log in.
    }
});

// Function to update vote percentages
async function updateVotePercentages(optionsContainer, blogDoc, blogId) {
    const totalVotes = blogDoc.Votes;

    // Calculate percentages
    for (const optionKey in blogDoc.options) {
        const optionVotes = blogDoc.options[optionKey].votes;
        // to show percentage in decimals
        // const optionPercent = ((optionVotes / totalVotes) * 100).toFixed(2);

        // to show percentage without decimals
        const optionPercent = (totalVotes > 0 || optionVotes > 0) ? ((optionVotes / (totalVotes > 0 ? totalVotes : 1)) * 100) : 0;
        const optionPercentSpan = optionsContainer.querySelector(`.${optionKey}_${blogId}`);

        // console.log("Percentage", optionPercent)
        // console.log("Option Key:", optionKey);
        // console.log("Blog ID:", blogId);
        // console.log("Selector:", `.${optionKey}_${blogId}`);

        if (optionPercentSpan) {
            optionPercentSpan.textContent = `${optionPercent}%`;
        }
    }
}

// Listen for changes in the authentication state
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Perform actions when the user is signed in
        await renderBlogs(currentPage, user.uid);
        reversedBlogs.forEach(async (blogDoc) => {
            const blogId = blogDoc.id;
            // Retrieve and set the checked status on page load
            const userVoteRef = doc(db, 'User-Survey-Poll-Votes', `${user.uid}_${blogId}`);
            const userVoteSnapshot = await getDoc(userVoteRef);
            if (userVoteSnapshot.exists()) {
                const selectedOption = userVoteSnapshot.data().selectedOption;
                const radioInput = document.querySelector(`input[value="${selectedOption}"]`);
                const optionsContainer = document.getElementById(`options_${blogId}`);
                if (radioInput && optionsContainer) {
                    radioInput.checked = true;
                    updateVotePercentages(optionsContainer, blogDoc.data(), blogId);
                }
            }
        });
    } else {
        // No user is signed in
        // console.log("No user is signed in.");
    }
});


// FOR REPORTING A POLL/SURVEY

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
        const blogDocRef = doc(db, 'write-wise-survey-polls', currentDocID);
        const blogDocSnap = await getDoc(blogDocRef);
        if (blogDocSnap.exists()) {
            const username = blogDocSnap.data().userName;
            const questionType = blogDocSnap.data().questionType;
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
                    pollId: currentDocID,
                    reportedUser: username,
                    QuestionType: questionType,
                    reporterEmail: reportersEmail,
                    reportReason: selectedReason,
                    customReason: repotersReportReason,
                    timestamp: serverTimestamp()
                });

                const blogRef = doc(db, 'write-wise-survey-polls', currentDocID);
                const currentReports = blogDocSnap.data().Reports;
                if (currentReports >= 7) {
                    const reportsQuery = query(blogRefRep, where('pollId', '==', currentDocID));
                    const reportsSnapshot = await getDocs(reportsQuery);
                    reportsSnapshot.forEach(async (doc) => {
                        await deleteDoc(doc.ref);
                    });
                    await deleteDoc(blogRef);
                    location.reload();
                    localStorage.setItem('questionare-reported-deleted', 'true');
                } else {
                    await updateDoc(blogRef, {
                        Reports: increment(1)
                    });
                }
            } else {
                const blogRefRep = collection(db, 'write-wise-reports');
                await addDoc(blogRefRep, {
                    pollId: currentDocID,
                    reportedUser: username,
                    QuestionType: questionType,
                    reporterEmail: reportersEmail,
                    reportReason: selectedReason,
                    timestamp: serverTimestamp()
                });
                const blogRef = doc(db, 'write-wise-survey-polls', currentDocID);
                const currentReports = blogDocSnap.data().Reports;
                if (currentReports >= 7) {
                    const reportsQuery = query(blogRefRep, where('pollId', '==', currentDocID));
                    const reportsSnapshot = await getDocs(reportsQuery);
                    reportsSnapshot.forEach(async (doc) => {
                        await deleteDoc(doc.ref);
                    });
                    await deleteDoc(blogRef);
                    location.reload();
                    localStorage.setItem('questionare-reported-deleted', 'true');
                } else {
                    await updateDoc(blogRef, {
                        Reports: increment(1)
                    });
                }
            }

            hideReportLoader();
            ReportModal.hide();
            swal("Success", "Reported successfully!", "success");

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

// FOR DELETING THE USER'S QUESTIONARE

let createActions = document.getElementById('create-actions');
let Cards = document.getElementById('surveysNpolls');
let CardsPagination = document.getElementById('blog-pagination');

async function deleteQuestionare(docID) {
    swal({
        title: "Are you sure?",
        text: "Are you sure you want to delete this blog?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then(async (willDelete) => {
        if (willDelete) {
            delLoader()
            await deleteDoc(doc(db, "write-wise-survey-polls", docID));
            location.reload();
            localStorage.setItem('questionare-deleted', 'true');
        }
    });
}

let delBlogLoader = document.getElementById("delete-questionare-loader")
function delLoader() {
    delBlogLoader.style.display = 'flex';
    Cards.style.display = 'none';
    CardsPagination.style.display = 'none';
}

// FOR EDITING A QUESTIONARE

let editQuestionareCard = document.getElementById('edit-questionare');
let editQuestionareInput = document.getElementById('edit-question');
let editOption1Input = document.getElementById('edit-option1');
let editOption2Input = document.getElementById('edit-option2');
let editOption3Input = document.getElementById('edit-option3');
let editOption4Input = document.getElementById('edit-option4');
let editQuestionareLoader = document.getElementById('edit-questionare-loader');
let editQuestionareBtn = document.getElementById('edit-questionare-btn');
let cancelQuestionareBtn = document.getElementById('cancel-questionare-btn');

editQuestionareBtn && editQuestionareBtn.addEventListener('click', async () => {
    const editValid = isEditValid();
    if (editValid) {
        const blogId = editQuestionareBtn.dataset.blogId;
        await performQuestionareUpdate(blogId);
    }
});

async function performQuestionareUpdate(currentDocID) {
    const QuestionValue = editQuestionareInput.value.trim();
    const Option1Value = editOption1Input.value.trim();
    const Option2Value = editOption2Input.value.trim();
    const Option3Value = editOption3Input.value.trim();
    const Option4Value = editOption4Input.value.trim();

    showUpdateLoader()
    const blogRef = doc(db, 'write-wise-survey-polls', currentDocID);
    await updateDoc(blogRef, {
        question: QuestionValue,
        options: {
            option1: { text: Option1Value },
            option2: { text: Option2Value },
            option3: { text: Option3Value },
            option4: { text: Option4Value },
        }
    });

    localStorage.setItem('Questionare-Updated', 'true');
    hideUpdateLoader();
    location.reload();
}

function isEditValid() {
    let valid = true;

    // error divs
    const editQuestionErrors = document.getElementById('edit-question-error');
    const editOption1Error = document.getElementById('edit-option1-error');
    const editOption2Error = document.getElementById('edit-option2-error');
    const editOption3Error = document.getElementById('edit-option3-error');
    const editOption4Error = document.getElementById('edit-option4-error');

    // Check if poll question is provided
    if (!editQuestionareInput.value.trim()) {
        editQuestionErrors.innerHTML = 'Please provide a Question';
        valid = false;
    } else {
        editQuestionErrors.innerHTML = '';
    }

    // Check if each poll option is provided
    const questionareOptionsArray = [editOption1Input, editOption2Input, editOption3Input, editOption4Input];
    const questionareOptionErrorsArray = [editOption1Error, editOption2Error, editOption3Error, editOption4Error];

    questionareOptionsArray.forEach((option, index) => {
        const optionValue = option.value.trim();
        const optionError = questionareOptionErrorsArray[index];

        if (!optionValue) {
            optionError.innerHTML = `Please provide an Option ${index + 1}`;
            valid = false;
        } else if (optionValue.split(' ').length > 10) {
            optionError.innerHTML = `Option ${index + 1} should be less than 10 words`;
            valid = false;
        } else {
            optionError.innerHTML = '';
        }
    });

    editQuestionareBtn.disabled = !valid;

    return valid;
}


function editQuestionare(currentDocID) {
    createActions.style.display = 'none';
    Cards.style.display = 'none';
    CardsPagination.style.display = 'none';
    editQuestionareCard.style.display = 'block';

    editQuestionareInput.value = currentDocID.question;
    editOption1Input.value = currentDocID.options.option1.text;
    editOption2Input.value = currentDocID.options.option2.text;
    editOption3Input.value = currentDocID.options.option3.text;
    editOption4Input.value = currentDocID.options.option4.text;
}

cancelQuestionareBtn && cancelQuestionareBtn.addEventListener('click', () => {
    createActions.style.display = 'flex';
    Cards.style.display = 'block';
    CardsPagination.style.display = 'flex';
    editQuestionareCard.style.display = 'none';
})

function showUpdateLoader() {
    editQuestionareLoader.style.display = 'block';
    editQuestionareBtn.style.color = 'transparent';
}

function hideUpdateLoader() {
    editQuestionareLoader.style.display = 'none';
    editQuestionareBtn.style.color = 'white';
}

// FOR POLLS

const createPollBtn = document.getElementById('create-poll-btn');
const createPollLoader = document.getElementById('create-poll-loader');
const pollQuestion = document.getElementById('poll-question');
const pollOption1 = document.getElementById('poll-option1');
const pollOption2 = document.getElementById('poll-option2');
const pollOption3 = document.getElementById('poll-option3');
const pollOption4 = document.getElementById('poll-option4');

// Function to check form validity
function isPollValid() {
    let valid = true;

    // error divs
    const pollQuestionErrors = document.getElementById('poll-question-error');
    const pollOption1Error = document.getElementById('poll-option1-error');
    const pollOption2Error = document.getElementById('poll-option2-error');
    const pollOption3Error = document.getElementById('poll-option3-error');
    const pollOption4Error = document.getElementById('poll-option4-error');

    // Check if poll question is provided
    if (!pollQuestion.value.trim()) {
        pollQuestionErrors.innerHTML = 'Please provide a Question';
        valid = false;
    } else {
        pollQuestionErrors.innerHTML = '';
    }

    // Check if each poll option is provided
    const pollOptionsArray = [pollOption1, pollOption2, pollOption3, pollOption4];
    const pollOptionErrorsArray = [pollOption1Error, pollOption2Error, pollOption3Error, pollOption4Error];

    pollOptionsArray.forEach((option, index) => {
        const optionValue = option.value.trim();
        const optionError = pollOptionErrorsArray[index];

        if (!optionValue) {
            optionError.innerHTML = `Please provide an Option ${index + 1}`;
            valid = false;
        } else if (optionValue.split(' ').length > 10) {
            optionError.innerHTML = `Option ${index + 1} should be less than 10 words`;
            valid = false;
        } else {
            optionError.innerHTML = '';
        }
    });

    createPollBtn.disabled = !valid;

    return valid;
}

// Event listeners for input validation
pollQuestion && pollQuestion.addEventListener('input', isPollValid);
pollOption1 && pollOption1.addEventListener('input', isPollValid);
pollOption2 && pollOption2.addEventListener('input', isPollValid);
pollOption3 && pollOption3.addEventListener('input', isPollValid);
pollOption4 && pollOption4.addEventListener('input', isPollValid);

// saving poll in database
createPollBtn && createPollBtn.addEventListener('click', async () => {
    if (isPollValid()) {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                showPollLoader();
                try {
                    const docRef = doc(db, 'write-wise-users', user.uid);
                    const docSnap = await getDoc(docRef);
                    const fullname = docSnap.data().fullname;

                    const pollsQuestion = pollQuestion.value.trim();
                    const pollsOption1 = pollOption1.value.trim();
                    const pollsOption2 = pollOption2.value.trim();
                    const pollsOption3 = pollOption3.value.trim();
                    const pollsOption4 = pollOption4.value.trim();

                    if (pollsQuestion &&
                        pollsOption1 &&
                        pollsOption2 &&
                        pollsOption3 &&
                        pollsOption4
                    ) {
                        // Save blog details to Firestore
                        const blogRef = collection(db, 'write-wise-survey-polls');
                        await addDoc(blogRef, {
                            question: pollsQuestion,
                            options: {
                                option1: { text: pollsOption1, votes: 0 },
                                option2: { text: pollsOption2, votes: 0 },
                                option3: { text: pollsOption3, votes: 0 },
                                option4: { text: pollsOption4, votes: 0 },
                            },
                            timestamp: serverTimestamp(),
                            userId: user.uid,
                            userName: fullname,
                            Reports: 0,
                            Votes: 0,
                            questionType: 'Poll'
                        });
                        hidePollLoader();
                        location.reload();
                        localStorage.setItem('Poll-Saved', 'true');
                    } else {
                        // console.log('Some poll details are missing or invalid.');
                    }
                } catch (error) {
                    // console.error('Error saving poll:', error);
                    hidePollLoader();
                }
            } else {
                // console.log('User not logged in.');
            }
        });
    }
});


function showPollLoader() {
    createPollLoader.style.display = 'block';
    createPollBtn.style.color = 'transparent';
}

function hidePollLoader() {
    createPollLoader.style.display = 'none';
    createPollBtn.style.color = 'white';
}

// FOR SURVEYS

const createSurveyBtn = document.getElementById('create-survey-btn');
const createSurveyLoader = document.getElementById('create-survey-loader');
const surveyQuestion = document.getElementById('survey-question');
const surveyOption1 = document.getElementById('survey-option1');
const surveyOption2 = document.getElementById('survey-option2');
const surveyOption3 = document.getElementById('survey-option3');
const surveyOption4 = document.getElementById('survey-option4');

// Function to check form validity
function isSurveyValid() {
    let valid = true;

    // error divs
    const surveyQuestionErrors = document.getElementById('survey-question-error');
    const surveyOption1Error = document.getElementById('survey-option1-error');
    const surveyOption2Error = document.getElementById('survey-option2-error');
    const surveyOption3Error = document.getElementById('survey-option3-error');
    const surveyOption4Error = document.getElementById('survey-option4-error');

    // Check if poll question is provided
    if (!surveyQuestion.value.trim()) {
        surveyQuestionErrors.innerHTML = 'Please provide a Question';
        valid = false;
    } else {
        surveyQuestionErrors.innerHTML = '';
    }

    // Check if each poll option is provided
    const surveyOptionsArray = [surveyOption1, surveyOption2, surveyOption3, surveyOption4];
    const surveyOptionErrorsArray = [surveyOption1Error, surveyOption2Error, surveyOption3Error, surveyOption4Error];

    surveyOptionsArray.forEach((option, index) => {
        const optionValue = option.value.trim();
        const optionError = surveyOptionErrorsArray[index];

        if (!optionValue) {
            optionError.innerHTML = `Please provide an Option ${index + 1}`;
            valid = false;
        } else if (optionValue.split(' ').length > 10) {
            optionError.innerHTML = `Option ${index + 1} should be less than 10 words`;
            valid = false;
        } else {
            optionError.innerHTML = '';
        }
    });

    createSurveyBtn.disabled = !valid;

    return valid;
}

// Event listeners for input validation
surveyQuestion && surveyQuestion.addEventListener('input', isSurveyValid);
surveyOption1 && surveyOption1.addEventListener('input', isSurveyValid);
surveyOption2 && surveyOption2.addEventListener('input', isSurveyValid);
surveyOption3 && surveyOption3.addEventListener('input', isSurveyValid);
surveyOption4 && surveyOption4.addEventListener('input', isSurveyValid);

// saving survey in database
createSurveyBtn && createSurveyBtn.addEventListener('click', async () => {
    if (isSurveyValid()) {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                showSurveyLoader();
                try {
                    const docRef = doc(db, 'write-wise-users', user.uid);
                    const docSnap = await getDoc(docRef);
                    const fullname = docSnap.data().fullname;

                    const surveysQuestion = surveyQuestion.value.trim();
                    const surveysOption1 = surveyOption1.value.trim();
                    const surveysOption2 = surveyOption2.value.trim();
                    const surveysOption3 = surveyOption3.value.trim();
                    const surveysOption4 = surveyOption4.value.trim();

                    if (surveysQuestion &&
                        surveysOption1 &&
                        surveysOption2 &&
                        surveysOption3 &&
                        surveysOption4
                    ) {
                        // Save blog details to Firestore
                        const blogRef = collection(db, 'write-wise-survey-polls');
                        await addDoc(blogRef, {
                            question: surveysQuestion,
                            options: {
                                option1: { text: surveysOption1, votes: 0 },
                                option2: { text: surveysOption2, votes: 0 },
                                option3: { text: surveysOption3, votes: 0 },
                                option4: { text: surveysOption4, votes: 0 },
                            },
                            timestamp: serverTimestamp(),
                            userId: user.uid,
                            userName: fullname,
                            Reports: 0,
                            Votes: 0,
                            questionType: 'Survey'
                        });
                        hideSurveyLoader();
                        location.reload();
                        localStorage.setItem('Survey-Saved', 'true');
                    } else {
                        // console.log('Some survey details are missing or invalid.');
                    }
                } catch (error) {
                    // console.error('Error saving survey:', error);
                    hideSurveyLoader();
                }
            } else {
                // console.log('User not logged in.');
            }
        });
    }
});


function showSurveyLoader() {
    createSurveyLoader.style.display = 'block';
    createSurveyBtn.style.color = 'transparent';
}

function hideSurveyLoader() {
    createSurveyLoader.style.display = 'none';
    createSurveyBtn.style.color = 'white';
}