import { auth, doc, addDoc, db, setDoc, getDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, query, where, collection, increment } from './firebase.js'

// FOR SEARCHING A QUESTIONARE

const allSearchedPollsContainer = document.getElementById('search-surveyNpolls');
let PollLoader = document.getElementById('delete-questionare-loader');
let blogPagination = document.getElementById('blog-pagination');

const allSurveyPollsContainer = document.getElementById('surveysNpolls');

let currentPage = 1;
let currentDocID;
let currentUID;
let optionsContainerId;

let searchQuestionareInput = document.getElementById('search-questionare-input')
let searchQuestionareBtn = document.getElementById('search-questionare-btn')

searchQuestionareBtn && searchQuestionareBtn.addEventListener('click', async () => {
    let searchedValue = searchQuestionareInput.value.trim();

    if (searchedValue !== '') {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                PollLoader.style.display = 'flex';
                allSurveyPollsContainer.style.display = 'none';
                blogPagination.style.display = 'none';
                allSearchedPollsContainer.innerHTML = '';


                currentUID = user.uid;
                const blogsRef = collection(db, 'write-wise-survey-polls');
                try {
                    // Fetch all the blogs
                    const querySnapshot = await getDocs(blogsRef);
                    const matchingBlogs = [];

                    querySnapshot.forEach((pollDoc) => {
                        const blogId = pollDoc.id;
                        const blogData = pollDoc.data();
                        const question = blogData.question || '';
                        const questionType = blogData.questionType || '';
                        const userName = blogData.userName || '';
                        const Option1 = blogData.options.option1.text || '';
                        const Option2 = blogData.options.option2.text || '';
                        const Option3 = blogData.options.option3.text || '';
                        const Option4 = blogData.options.option4.text || '';

                        // Check for matches in both cases
                        if (
                            `${question} ${questionType} ${userName} ${Option1} ${Option2} ${Option3} ${Option4}`
                                .toLowerCase()
                                .includes(searchedValue.toLowerCase())
                        ) {
                            blogData.docId = pollDoc.id;
                            matchingBlogs.push({ docId: blogId, ...blogData });

                        }
                    });

                    if (matchingBlogs.length === 0) {
                        PollLoader.style.display = 'none';
                        allSearchedPollsContainer.innerHTML = `
                            <div class="no-blogs-message">
                                <div class="message-container">
                                    <p class="no-blogs-heading">No Surveys or Polls found</p>
                                    <p class="no-blogs-subHeading">No Surveys or Polls found. Try refining your search</p>
                                </div>
                            </div>
                        `;
                    } else {

                        PollLoader.style.display = 'none';

                        // console.log('Matching Questionare:', matchingBlogs);
                        matchingBlogs.forEach((PollData) => {
                            optionsContainerId = `options_${PollData.docId}`;

                            const timestamp = PollData.timestamp.toDate();
                            const timeAgo = moment(timestamp).fromNow();

                            const isCurrentUserOwner = PollData.userId === currentUID;

                            let dropdownOptions = '';

                            if (isCurrentUserOwner) {
                                dropdownOptions = `
                                    <li><a class="dropdown-item edit-blog" data-blog-id="${PollData.docId}" data-user-id="${PollData.userId}">Edit</a></li>
                                    <li><a class="dropdown-item delete-blog" data-id="${PollData.docId}">Delete</a></li>
                                    `;
                            } else {
                                dropdownOptions = `
                                    <li><a class="dropdown-item report-blog" data-blog-id="${PollData.docId}" data-bs-toggle="modal" data-bs-target="#exampleModal">Report</a></li>
                                    `;
                            }
                            allSearchedPollsContainer.innerHTML += `
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
                                        <h5 class="card-title mb-3">Q: ${PollData.question}</h5>
                                    </div>
                                    <div class="mb-3">
                                        <small class="text-body-secondary">${PollData.questionType} by
                                            <a class="user-link" data-uid="${PollData.userId}">
                                                ${PollData.userName}
                                            </a>
                                        </small>
                                    </div>
                                    <div id="${optionsContainerId}">
                                        ${renderOptions(PollData.docId, PollData)}
                                        <div>
                                            <p class="no-of-votes">${PollData.Votes} Votes</p>
                                            <p class="card-text"><small class="text-body-secondary">Uploaded ${timeAgo}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            `;
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

                    querySnapshot.forEach(async (blogDoc) => {
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

                    allSearchedPollsContainer && allSearchedPollsContainer.addEventListener('click', async (event) => {
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
                } catch (error) {
                    // console.error('Error querying blogs:', error);
                }
            }
        });
    } else {
        // console.log('Search value is empty. Not fetching blogs.');
    }
});

function renderOptions(blogId, blogData) {
    const optionsContainerId = `options_${blogId}`;
    const optionKeys = Object.keys(blogData.options).sort();

    return optionKeys.map((optionKey) => {
        const optionText = blogData.options[optionKey].text;
        return `
            <div class="form-check mb-3">
                <input class="form-check-input" type="radio" name="${optionsContainerId}" id="radio${optionKey}_${blogId}" value="${optionKey}_${blogId}">
                <label class="form-check-label" for="radio${optionKey}_${blogId}">
                    ${optionText}
                </label>
                <span class="vote-percent ${optionKey}_${blogId}"></span>
            </div>
        `;
    }).join('');
}

// Event listener to check which option got selected and save it
allSearchedPollsContainer && allSearchedPollsContainer.addEventListener('change', async (event) => {
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


// ---------- DONE SECOND TIME FOR THE SAME PAGE BUT FOR DIFFERENT PURPOSE --------

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
    allSearchedPollsContainer.style.display = 'none';
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
    allSearchedPollsContainer.style.display = 'none';
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