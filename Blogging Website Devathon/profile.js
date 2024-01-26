// ------ USER PROFILE SETUP -----

// FOR EDITING THE USER INFO

let editUserInfo = document.getElementById('edit-user-info');
let userCurrentInfo = document.getElementById('user-current-info');
let pfpUpdateCamIcon = document.getElementById('pfp-update-cam-icon');
let deletepfpIcon = document.getElementById('delete-pfp-icon');

function updateUserInfo() {
    userCurrentInfo.style.display = 'none';
    editUserInfo.style.display = 'block';
    pfpUpdateCamIcon.style.display = 'flex';
}

function cancelupdate() {
    userCurrentInfo.style.display = 'block';
    editUserInfo.style.display = 'none';
    pfpUpdateCamIcon.style.display = 'none';
}

let resEditUserInfo = document.getElementById('res-user-edit-info');
let resCurrentUserInfo = document.getElementById('res-user-current-info');
let resPfpUpdateCamIcon = document.getElementById('res-pfp-update-cam-icon');

// IN RESPONSIVE

function resUpdateUserInfo() {
    resCurrentUserInfo.style.display = 'none';
    resEditUserInfo.style.display = 'flex';
    resPfpUpdateCamIcon.style.display = 'block';
}

function resCancelUpdate() {
    resCurrentUserInfo.style.display = 'block';
    resEditUserInfo.style.display = 'none';
    resPfpUpdateCamIcon.style.display = 'none';
}

// SHOWING THE USER ERROR FOR NOT PROVIDING THE NAME

function validateFields() {
    const editFirstNamePfp = document.getElementById('edit-firstname-input');
    const editLastNamePfp = document.getElementById('edit-lastname-input');
    const saveUserInfoBtn = document.getElementById('save-user-info');
    const firstName = editFirstNamePfp.value.trim();
    const lastName = editLastNamePfp.value.trim();

    const FirstnameErrorDiv = document.getElementById('name-err-div-FN');
    const FirstnameErrorP = document.querySelector('#name-err-div-FN .name-error-FN');
    const LastnameErrorDiv = document.getElementById('name-err-div-LN');
    const LastnameErrorP = document.querySelector('#name-err-div-LN .name-error-LN');

    const specialCharactersRegex = /[!@#$%^&*(),.?":{}|<>]/g;

    if (!firstName) {
        FirstnameErrorDiv.style.display = 'flex';
        FirstnameErrorP.textContent = 'First Name cannot be empty';
    } else if (specialCharactersRegex.test(firstName) || /^\d+$/.test(firstName)) {
        FirstnameErrorDiv.style.display = 'flex';
        FirstnameErrorP.textContent = 'No special characters or only numbers allowed';
    } else {
        FirstnameErrorDiv.style.display = 'none';
    }

    if (!lastName) {
        LastnameErrorDiv.style.display = 'flex';
        LastnameErrorP.textContent = 'Last Name cannot be empty';
    } else if (specialCharactersRegex.test(lastName) || /^\d+$/.test(lastName)) {
        LastnameErrorDiv.style.display = 'flex';
        LastnameErrorP.textContent = 'No special characters or only numbers allowed';
    } else {
        LastnameErrorDiv.style.display = 'none';
    }

    saveUserInfoBtn.disabled = !firstName || !lastName ||
        specialCharactersRegex.test(firstName) || specialCharactersRegex.test(lastName) ||
        /^\d+$/.test(firstName) || /^\d+$/.test(lastName);
}

document.getElementById('edit-firstname-input').addEventListener('input', validateFields);
document.getElementById('edit-lastname-input').addEventListener('input', validateFields);

// FOR THE REMAINING CHARACTERS IN THE BIO

const editUserBioInput = document.getElementById('edit-userbio-input');
const bioCharCount = document.getElementById('bio-char-count');

const maxCharacters = 500;

editUserBioInput.addEventListener('input', () => {
    let bioContent = editUserBioInput.value;
    if (bioContent.length > maxCharacters) {
        bioContent = bioContent.substring(0, maxCharacters);
        editUserBioInput.value = bioContent;
    }

    const bioLength = bioContent.length;
    const remainingChars = maxCharacters - bioLength;

    bioCharCount.textContent = `Characters remaining: ${remainingChars}`;
});

// SHOWING THE USER ERROR FOR NOT PROVIDING THE NAME IN RESPONSIVE

function validateFieldsRes() {
    const editFirstNamePfp = document.getElementById('res-user-firstName-input');
    const editLastNamePfp = document.getElementById('res-user-lastName-input');
    const saveUserInfoBtn = document.getElementById('res-save-user-info');
    const firstName = editFirstNamePfp.value.trim();
    const lastName = editLastNamePfp.value.trim();

    const FirstnameErrorDiv = document.getElementById('res-FN-Error_div');
    const FirstnameErrorP = document.querySelector('#res-FN-Error_div #res-FN-err');
    const LastnameErrorDiv = document.getElementById('res-LN-Error_div');
    const LastnameErrorP = document.querySelector('#res-LN-Error_div #res-LN-err');

    const specialCharactersRegex = /[!@#$%^&*(),.?":{}|<>]/g;

    if (!firstName) {
        FirstnameErrorDiv.style.display = 'flex';
        FirstnameErrorP.textContent = 'First Name cannot be empty';
    } else if (specialCharactersRegex.test(firstName) || /^\d+$/.test(firstName)) {
        FirstnameErrorDiv.style.display = 'flex';
        FirstnameErrorP.textContent = 'No special characters or only numbers allowed';
    } else {
        FirstnameErrorDiv.style.display = 'none';
    }

    if (!lastName) {
        LastnameErrorDiv.style.display = 'flex';
        LastnameErrorP.textContent = 'Last Name cannot be empty';
    } else if (specialCharactersRegex.test(lastName) || /^\d+$/.test(lastName)) {
        LastnameErrorDiv.style.display = 'flex';
        LastnameErrorP.textContent = 'No special characters or only numbers allowed';
    } else {
        LastnameErrorDiv.style.display = 'none';
    }

    saveUserInfoBtn.disabled = !firstName || !lastName ||
        specialCharactersRegex.test(firstName) || specialCharactersRegex.test(lastName) ||
        /^\d+$/.test(firstName) || /^\d+$/.test(lastName);
}

document.getElementById('res-user-firstName-input').addEventListener('input', validateFieldsRes);
document.getElementById('res-user-lastName-input').addEventListener('input', validateFieldsRes);

// FOR THE REMAINING CHARACTERS IN THE BIO IN RESPONSIVE

const resEditUserBioInput = document.getElementById('res-edit-userbio-input');
const resBioCharCount = document.getElementById('res-chars-rem-in-bio');


resEditUserBioInput.addEventListener('input', () => {
    let bioContent = resEditUserBioInput.value;
    if (bioContent.length > maxCharacters) {
        bioContent = bioContent.substring(0, maxCharacters);
        resEditUserBioInput.value = bioContent;
    }

    const bioLength = bioContent.length;
    const remainingChars = maxCharacters - bioLength;

    resBioCharCount.textContent = `Characters remaining: ${remainingChars}`;
});


// ----- USER BLOG SETUP -----

// FOR CREATING OR CANCELING BLOGS

let createBlogBtn = document.getElementById('add-blogs-btn');
let viewAnalyticsBtn = document.getElementById('view-analytics-btn');
let userBlogs = document.getElementById('users-blogs');
let addBlogs = document.getElementById('add-blogs-div');
const updateBlogs = document.getElementById('update-blogs-div');
let blogPagination = document.getElementById('blog-pagination');
let totalBlogsHTML = document.getElementById('total-blogs-container');

function createBlogs() {
    createBlogBtn.style.display = 'none';
    viewAnalyticsBtn.style.display = 'none';
    userBlogs.style.display = 'none';
    blogPagination.style.display = 'none';
    totalBlogsHTML.style.display = 'none';
    addBlogs.style.display = 'flex';
}

function cancelPublishBlog() {
    createBlogBtn.style.display = 'flex';
    viewAnalyticsBtn.style.display = 'flex';
    blogPagination.style.display = 'flex';
    totalBlogsHTML.style.display = 'flex';
    userBlogs.style.display = 'block';
    addBlogs.style.display = 'none';
    updateBlogs.style.display = 'none';
}

// FOR SHOWING ANAYLYTICS

let analyticsCard = document.getElementById('user-analytics');

function showAnalytics(){
    analyticsCard.style.display = 'block';
    createBlogBtn.style.display = 'none';
    viewAnalyticsBtn.style.display = 'none';
    blogPagination.style.display = 'none';
    totalBlogsHTML.style.display = 'none';
    userBlogs.style.display = 'none';
}

function closeAnalytics(){
    analyticsCard.style.display = 'none';
    createBlogBtn.style.display = 'flex';
    viewAnalyticsBtn.style.display = 'flex';
    blogPagination.style.display = 'flex';
    totalBlogsHTML.style.display = 'flex';
    userBlogs.style.display = 'block';
}

// FOR CHANGING THE DEFAULT BLOG IMAGE

let userBlogInput = document.getElementById("user-blog-select");
let userBlogPic = document.getElementById("blog-img");
let selectedFile = null;

userBlogInput && userBlogInput.addEventListener('change', () => {
    const file = userBlogInput.files[0];
    const fileType = file.type;
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (validImageTypes.includes(fileType)) {
        userBlogPic.src = URL.createObjectURL(file);
        selectedFile = file;
    } else {
        swal("Error!", 'Invalid file type. Please upload a JPG, PNG or WEBP Image.', "error");
        userBlogInput.value = "";
        selectedFile = null;
    }
})

// FOR CHANGING THE DEFAULT UPDATE BLOG IMAGE

let userBlogUpdateInput = document.getElementById("update-blog-select");
let userUpdatedBlogPic = document.getElementById("updated-blog-img");
let UpdatedselectedFile = null;

userBlogUpdateInput && userBlogUpdateInput.addEventListener('change', () => {
    const file = userBlogUpdateInput.files[0];
    const fileType = file.type;
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (validImageTypes.includes(fileType)) {
        userUpdatedBlogPic.src = URL.createObjectURL(file);
        UpdatedselectedFile = file;
    } else {
        swal("Error!", 'Invalid file type. Please upload a JPG, PNG or WEBP Image.', "error");
        userBlogUpdateInput.value = "";
        UpdatedselectedFile = null;
    }
})