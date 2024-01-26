import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, db, getDoc, updateDoc, storage, ref, getDownloadURL, uploadBytes, deleteObject } from './firebase.js'

// GETTING CURRENT USER

const getCurrentUser = async (uid) => {
  const docRef = doc(db, "write-wise-users", uid);
  let userNamePfp = document.getElementById('user-name');
  let resUserNamePfp = document.getElementById('res-user-name');
  let editFirstNamePfp = document.getElementById('edit-firstname-input');
  let resUserEditFirstNamePfp = document.getElementById('res-user-firstName-input');
  let editLastNamePfp = document.getElementById('edit-lastname-input');
  let resUserEditLastNamePfp = document.getElementById('res-user-lastName-input');
  let edituserBioPfp = document.getElementById('edit-userbio-input');
  let editBioPfp = document.getElementById('user-bio');
  let resUserBioPfp = document.getElementById('res-user-bio');
  let resEdituserBioPfp = document.getElementById('res-edit-userbio-input');
  let userProfilePicRef = document.getElementById('user-profile-picture');
  let resUserProfilePicRef = document.getElementById('res-user-profile-img');
  let userNavbarProfilePic = document.getElementById('user-navbar-img');
  let userSavedInfoLoader = document.getElementById('user-saved-info-loader');
  let profilePicSpinner = document.getElementById('profile-pic-spinner');
  let resProfilePicSpinner = document.getElementById('res-profile-pic-spinner');
  let resUserSavedInfoLoader = document.getElementById('res-user-saved-info-loader');
  let deleteUserPfpBtn = document.getElementById('delete-pfp-icon');
  let resDeleteUserPfpBtn = document.getElementById('res-pfp-delete-icon');

  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // console.log("Document data:", docSnap.data());

    // Check if fullname exists in the document
    const fullname = docSnap.data().fullname;
    const firstname = docSnap.data().firstname;
    const lastname = docSnap.data().lastname;
    if (fullname !== undefined && fullname !== null && fullname !== "" && firstname !== undefined && firstname !== null && firstname !== "" && lastname !== undefined && lastname !== null && lastname !== "") {
      if (userNamePfp) {
        userNamePfp.innerHTML = fullname;
      }
      if (resUserNamePfp) {
        resUserNamePfp.innerHTML = fullname;
      }
      if (editFirstNamePfp) {
        editFirstNamePfp.value = firstname;
      }
      if (resUserEditFirstNamePfp) {
        resUserEditFirstNamePfp.value = firstname;
      }
      if (editLastNamePfp) {
        editLastNamePfp.value = lastname;
      }
      if (resUserEditLastNamePfp) {
        resUserEditLastNamePfp.value = lastname;
      }
    } else {
      userNamePfp.innerHTML = "User";
      swal("Error!", "Fullname not defined in the document!", "error");
    }

    // Check if userbio exists in the document
    const userBio = docSnap.data().userbio;
    if (userBio !== undefined && userBio !== null && userBio !== "") {
      if (editBioPfp) {
        editBioPfp.innerHTML = userBio;
      }
      if (resUserBioPfp) {
        resUserBioPfp.innerHTML = userBio;
      }
      if (edituserBioPfp) {
        edituserBioPfp.value = userBio;
      }
      if (resEdituserBioPfp) {
        resEdituserBioPfp.value = userBio;
      }
    } else {
      if (edituserBioPfp) {
      editBioPfp.innerHTML = 'No Bio';
      }
      if (resEdituserBioPfp) {
      resUserBioPfp.innerHTML = 'No Bio';
      }
    }

    //Check if userprofilepic exists in the document
    const userProfilePic = docSnap.data().profilePicture;
    if (userProfilePic !== "") {
      if (userProfilePicRef) {
        userProfilePicRef.src = userProfilePic;
      }
      if (resUserProfilePicRef) {
        resUserProfilePicRef.src = userProfilePic;
      }
      if (userNavbarProfilePic) {
        userNavbarProfilePic.src = userProfilePic;
      }
      if (profilePicSpinner) {
        profilePicSpinner.style.display = 'none'
      }
      if (resProfilePicSpinner) {
        resProfilePicSpinner.style.display = 'none'
      }
      if (deleteUserPfpBtn) {
        deleteUserPfpBtn.style.display = 'block';
      }
      if (resDeleteUserPfpBtn) {
        resDeleteUserPfpBtn.style.display = 'block';
      }
    }else{
      if (deleteUserPfpBtn) {
        deleteUserPfpBtn.style.display = 'none';
      }
      if (resDeleteUserPfpBtn) {
        resDeleteUserPfpBtn.style.display = 'none';
      }
    }
    if (profilePicSpinner) {
      profilePicSpinner.style.display = 'none'
    }
    if (resProfilePicSpinner) {
      resProfilePicSpinner.style.display = 'none'
    }

  } else {
    // docSnap.data() will be undefined in this case
    // console.log("No such document!");
  }
  if (userSavedInfoLoader) {
    userSavedInfoLoader.style.display = 'none';
  }
  if (resUserSavedInfoLoader) {
    resUserSavedInfoLoader.style.display = 'none';
  }
}

// CHANGING THE USER'S PROFILE PICTURE

// Variables for user profile picture handling
let userProfilePicInput = document.getElementById("userpfpinput");
let userProfPic = document.getElementById("user-profile-picture");
let selectedFile = null;

// Event listener for file input change
userProfilePicInput && userProfilePicInput.addEventListener('change', () => {
  const file = userProfilePicInput.files[0];
  const fileType = file.type;
  const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (validImageTypes.includes(fileType)) {
    userProfPic.src = URL.createObjectURL(file);
    selectedFile = file;
  } else {
    swal("Error!", 'Invalid file type. Please upload a JPG or PNG Image.', "error");
    userProfilePicInput.value = "";
    selectedFile = null;
  }
});



// CHANGING THE USER'S PROFILE PICTURE IN RESPONSIVE

// Variables for user profile picture handling
let resUserProfilePicInput = document.getElementById("res-userpfpinput");
let resUserProfPic = document.getElementById("res-user-profile-img");

// Event listener for file input change
resUserProfilePicInput && resUserProfilePicInput.addEventListener('change', () => {
  const file = resUserProfilePicInput.files[0];
  const fileType = file.type;
  const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (validImageTypes.includes(fileType)) {
    resUserProfPic.src = URL.createObjectURL(file);
    selectedFile = file;
  } else {
    swal("Error!", 'Invalid file type. Please upload a JPG or PNG Image.', "error");
    resUserProfilePicInput.value = "";
    selectedFile = null;
  }
});


//UPDATING THE USER INFO

let updateUserInfoBtn = document.getElementById('save-user-info');
let editFirstNamePfp = document.getElementById('edit-firstname-input');
let editLastNamePfp = document.getElementById('edit-lastname-input');
let editBioPfp = document.getElementById('edit-userbio-input');
let userInfoLoader = document.getElementById('user-info-loader');

updateUserInfoBtn && updateUserInfoBtn.addEventListener('click', async (event) => {
  event.preventDefault();

  // Get the new name and bio from the input fields
  const newFirstName = editFirstNamePfp.value.trim();
  const newLastName = editLastNamePfp.value.trim();
  const userBio = editBioPfp.value;

  // Use the user ID from the authentication state to update the user document
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    if (selectedFile) {
      showLoader();
      const storageRef = ref(storage, 'profilePictures/' + userId);
      const fileSnapshot = await uploadBytes(storageRef, selectedFile);
      const imageUrl = await getDownloadURL(fileSnapshot.ref);

      const userRef = doc(db, "write-wise-users", userId);
      try {
        await updateDoc(userRef, {
          profilePicture: imageUrl
        });
        // console.log('User profile picture updated successfully!');
        hideLoader();
      } catch (error) {
        swal("Error!", `Error updating user data: ${error.message}`, "error");
        hideLoader();
      }
    }

    // Update user data (name and bio) in Firestore
    updateUserData(userId, newFirstName, newLastName);
    addingUserBio(userId, userBio);

  } else {
    // console.error('User not authenticated');
  }
});

async function updateUserData(userId, newFirstName, newLastName) {
  const userRef = doc(db, "write-wise-users", userId);

  try {
    showLoader();
    // Update the user document with the new name and bio
    await updateDoc(userRef, {
      firstname: newFirstName,
      lastname: newLastName,
      fullname: newFirstName + ' ' + newLastName
    });

    // console.log('User data updated successfully!');
    hideLoader();
    location.reload();
    localStorage.setItem('showSnackbar', 'true');
  } catch (error) {
    swal("Error!", `Error updating user data: ${error.message}`, "error");
    hideLoader();
  }
}

async function addingUserBio(userId, userBio) {
  const userRef = doc(db, "write-wise-users", userId);

  try {
    showLoader();
    // Use updateDoc instead of setDoc
    await updateDoc(userRef, {
      userbio: userBio
    });

    // console.log('User bio updated successfully!');
    hideLoader();
    location.reload();
    localStorage.setItem('showSnackbar', 'true');
  } catch (error) {
    swal("Error!", `Error updating user data: ${error.message}`, "error");
    hideLoader();
  }
}


//UPDATING THE USER INFO IN RESPONSIVE

let resUpdateUserInfoBtn = document.getElementById('res-save-user-info');
let resEditFirstNamePfp = document.getElementById('res-user-firstName-input');
let resEditLastNamePfp = document.getElementById('res-user-lastName-input');
let resEditBioPfp = document.getElementById('res-edit-userbio-input');
let resUserInfoLoader = document.getElementById('res-user-info-loader');

resUpdateUserInfoBtn && resUpdateUserInfoBtn.addEventListener('click', async (event) => {
  event.preventDefault();

  // Get the new name and bio from the input fields
  const newFirstName = resEditFirstNamePfp.value.trim();
  const newLastName = resEditLastNamePfp.value.trim();
  const userBio = resEditBioPfp.value;

  // Use the user ID from the authentication state to update the user document
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    if (selectedFile) {
      showResLoader();
      const storageRef = ref(storage, 'profilePictures/' + userId);
      const fileSnapshot = await uploadBytes(storageRef, selectedFile);
      const imageUrl = await getDownloadURL(fileSnapshot.ref);

      const userRef = doc(db, "write-wise-users", userId);
      try {
        await updateDoc(userRef, {
          profilePicture: imageUrl
        });
        // console.log('User profile picture updated successfully!');
        hideResLoader();
      } catch (error) {
        swal("Error!", `Error updating user data: ${error.message}`, "error");
        hideResLoader();
      }
    }

    // Update user data (name and bio) in Firestore
    updateUserDataInRes(userId, newFirstName, newLastName);
    addingUserBioInRes(userId, userBio);

  } else {
    // console.error('User not authenticated');
  }
});

async function updateUserDataInRes(userId, newFirstName, newLastName) {
  const userRef = doc(db, "write-wise-users", userId);

  try {
    showResLoader();
    // Update the user document with the new name and bio
    await updateDoc(userRef, {
      firstname: newFirstName,
      lastname: newLastName,
      fullname: newFirstName + ' ' + newLastName
    });

    // console.log('User data updated successfully!');
    hideResLoader();
    location.reload();
    localStorage.setItem('showSnackbar', 'true');
  } catch (error) {
    swal("Error!", `Error updating user data: ${error.message}`, "error");
    hideResLoader();
  }
}

async function addingUserBioInRes(userId, userBio) {
  const userRef = doc(db, "write-wise-users", userId);

  try {
    showResLoader();
    // Use updateDoc instead of setDoc
    await updateDoc(userRef, {
      userbio: userBio
    });

    // console.log('User bio updated successfully!');
    hideResLoader();
    location.reload();
    localStorage.setItem('showSnackbar', 'true');
  } catch (error) {
    swal("Error!", `Error updating user data: ${error.message}`, "error");
    hideResLoader();
  }
}


function showLoader() {
  userInfoLoader.style.display = 'inline-block';
  updateUserInfoBtn.style.color = 'transparent';
}

function showResLoader() {
  resUserInfoLoader.style.display = 'block';
  resUpdateUserInfoBtn.style.color = 'transparent';
}

function hideLoader() {
  userInfoLoader.style.display = 'none';
  updateUserInfoBtn.style.color = 'white';
}

function hideResLoader() {
  resUserInfoLoader.style.display = 'none';
  resUpdateUserInfoBtn.style.color = 'white';
}

// TO DELETE THE USER'S PROFILE PICTURE

const deletePfpBtn = document.getElementById('delete-pfp-icon');
let profilePicSpinner = document.getElementById('profile-pic-spinner');

deletePfpBtn && deletePfpBtn.addEventListener('click', () => {

  swal({
    title: "Are you sure?",
    text: "Are you sure you want to delete your profile picture?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then(async (willDelete) => {
    if (willDelete) {
      const user = auth.currentUser;
      const userId = user ? user.uid : null;
      profilePicSpinner.style.display = 'flex';

      if (userId) {
        const storageRef = ref(storage, `profilePictures/${userId}`);

        try {
          await deleteObject(storageRef);
          const userRef = doc(db, "write-wise-users", userId);
          try {
            await updateDoc(userRef, {
              profilePicture: ""
            });
            profilePicSpinner.style.display = 'none';
            // console.log('User profile picture deleted successfully!');
            location.reload();
            hideLoader();
            localStorage.setItem('showSnackbar', 'true');
          } catch (error) {
            swal("Error!", `Error updating user data: ${error.message}`, "error");
            hideLoader();
          }

        } catch (error) {
          swal("Error!", error.message, "error");
        }
      } else {
        swal("Error!", "User not authenticated", "error");
      }
    }
  });
});



// TO DELETE THE USER'S PROFILE PICTURE IN RESPONSIVE

const resDeletePfpBtn = document.getElementById('res-pfp-delete-icon');
let resProfilePicSpinner = document.getElementById('res-profile-pic-spinner');

resDeletePfpBtn && resDeletePfpBtn.addEventListener('click', () => {

  swal({
    title: "Are you sure?",
    text: "Are you sure you want to delete your profile picture?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then(async (willDelete) => {
    if (willDelete) {
      const user = auth.currentUser;
      const userId = user ? user.uid : null;
      resProfilePicSpinner.style.display = 'flex';

      if (userId) {
        const storageRef = ref(storage, `profilePictures/${userId}`);

        try {
          await deleteObject(storageRef);
          const userRef = doc(db, "write-wise-users", userId);
          try {
            await updateDoc(userRef, {
              profilePicture: ""
            });
            resProfilePicSpinner.style.display = 'none';
            // console.log('User profile picture deleted successfully!');
            location.reload();
            localStorage.setItem('showSnackbar', 'true');
          } catch (error) {
            swal("Error!", `Error updating user data: ${error.message}`, "error");
          }

        } catch (error) {
          swal("Error!", error.message, "error");
        }
      } else {
        swal("Error!", "User not authenticated", "error");
      }
    }
  });
});


// TO SHOW THE SNACKBAR AFTER INFO IS SAVED AND PAGE IS RELOADED
document.addEventListener('DOMContentLoaded', () => {
  // FOR SNACKBAR
  function showSnackbarFunction(message) {
    const snackbar = document.getElementById("snackbar");
    snackbar.innerText = message;
    snackbar.style.right = "20px";
    snackbar.style.display = "block";

    setTimeout(function () {
      snackbar.style.right = "-300px";
    }, 3000);
  }

  // FOR SHOWING SNACKBAR
  const showSnackbar = localStorage.getItem('showSnackbar');
  const blogSaved = localStorage.getItem('Blog-Saved');
  const blogDeleted = localStorage.getItem('blog-deleted');
  const blogUpdated = localStorage.getItem('Blog-Updated');
  const blogReportedDeleted = localStorage.getItem('blog-reported-deleted');
  const archiveBlogRemove = localStorage.getItem('archived-blog-remove');
  const pollSaved = localStorage.getItem('Poll-Saved');
  const surveySaved = localStorage.getItem('Survey-Saved');
  const questionareReportedDeleted = localStorage.getItem('questionare-reported-deleted');
  const questionareUpdated = localStorage.getItem('Questionare-Updated');
  const questionareDeleted = localStorage.getItem('questionare-deleted');
  if (showSnackbar) {
    showSnackbarFunction("User Info Updated!");
    localStorage.removeItem('showSnackbar');
  }
  else if (blogSaved) {
    showSnackbarFunction("Blog published successfully!");
    localStorage.removeItem('Blog-Saved');
  }
  else if (blogDeleted) {
    showSnackbarFunction("Blog deleted successfully!");
    localStorage.removeItem('blog-deleted');
  }
  else if (blogUpdated) {
    showSnackbarFunction("Blog updated successfully!");
    localStorage.removeItem('Blog-Updated');
  }
  else if (blogReportedDeleted) {
    showSnackbarFunction("Blog has been permanently removed");
    localStorage.removeItem('blog-reported-deleted');
  }
  else if (archiveBlogRemove) {
    showSnackbarFunction("Blog removed from archive");
    localStorage.removeItem('archived-blog-remove');
  }
  else if (pollSaved) {
    showSnackbarFunction("Poll Published successfully!");
    localStorage.removeItem('Poll-Saved');
  }
  else if (surveySaved) {
    showSnackbarFunction("Survey Published successfully!");
    localStorage.removeItem('Survey-Saved');
  }
  else if (questionareReportedDeleted) {
    showSnackbarFunction("Questionare has been permanently removed");
    localStorage.removeItem('questionare-reported-deleted');
  }
  else if (questionareUpdated) {
    showSnackbarFunction("Questionare updated successfully!");
    localStorage.removeItem('Questionare-Updated');
  }
  else if (questionareDeleted) {
    showSnackbarFunction("Questionare deleted successfully!");
    localStorage.removeItem('questionare-deleted');
  }
});


//FOR CHECKING IF USER IS LOGGED IN

onAuthStateChanged(auth, (user) => {
  if (user) {
    getCurrentUser(user.uid)
    let signOutBtn = document.getElementById('signout-btn');
    let userProfileImg = document.getElementById('user-img-container');
    let pfpLoginBtn = document.getElementById('login-btn');
    let pfpSignupBtn = document.getElementById('signup-btn');
    const uid = user.uid;
    if (pfpLoginBtn) {
      pfpLoginBtn.style.display = 'none';
    }
    if (pfpSignupBtn) {
      pfpSignupBtn.style.display = 'none';
    }
    if (signOutBtn) {
      signOutBtn.style.display = 'initial';
    }
    if (userProfileImg) {
      userProfileImg.style.display = 'initial';
    }
  } else {

    if (window.location.pathname.includes('profile')) {
      window.location.href = 'index.html';
    }
    else if (window.location.pathname.includes('archive')) {
      window.location.href = 'index.html';
    }
    else if (window.location.pathname.includes('Survey&Polls') || window.location.pathname.includes('survey&polls')) {
      window.location.href = 'index.html';
    }

    let signOutBtn = document.getElementById('signout-btn');
    let userProfileImg = document.getElementById('user-img-container');
    let pfpLoginBtn = document.getElementById('login-btn');
    let pfpSignupBtn = document.getElementById('signup-btn');
    if (pfpLoginBtn) {
      pfpLoginBtn.style.display = 'inline-block';
    }
    if (pfpSignupBtn) {
      pfpSignupBtn.style.display = 'inline-block';
    }
    if (signOutBtn) {
      signOutBtn.style.display = 'none';
    }
    if (userProfileImg) {
      userProfileImg.style.display = 'none';
    }
  }
});

// FOR SIGNING UP USER

let signupbtn = document.getElementById('signup-btn');
let loader = document.getElementById('loader');
let btnTxt = document.getElementById('btn-txt');
const signup = () => {
  let firstName = document.getElementById('firstName');
  let lastName = document.getElementById('lastName');
  let email = document.getElementById('emailInput');
  let password = document.getElementById('passwordInput');
  loader.style.display = 'inline-flex';
  btnTxt.style.color = 'transparent';

  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(async (userCredential) => {
      const user = userCredential.user;
      await setDoc(doc(db, "write-wise-users", user.uid), {
        firstname: firstName.value,
        lastname: lastName.value,
        fullname: firstName.value + " " + lastName.value,
        email: email.value,
        profilePicture: "",
        password: password.value,
        profileViews: 0
      });
      loader.style.display = 'none';
      btnTxt.style.color = 'white';
      window.location.href = 'index.html'
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      loader.style.display = 'none';
      btnTxt.style.color = 'white';
      swal("Error!", errorMessage, "error");
    });
}

signupbtn && signupbtn.addEventListener('click', signup);

// FOR LOGING THE USER IN

let loginBtn = document.getElementById('login-btn');
let btnTxtLogin = document.getElementById('button-text-login');

const login = () => {
  let loader = document.getElementById('loader')
  let email = document.getElementById('emailInput');
  let password = document.getElementById('passwordInput');
  loader.style.display = 'inline-flex';
  btnTxtLogin.style.color = 'transparent';
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      const user = userCredential.user;
      loader.style.display = 'none';
      btnTxtLogin.style.color = 'white';
      window.location.href = 'index.html';
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      loader.style.display = 'none';
      btnTxtLogin.style.color = 'white'
      swal("Error!", errorMessage, "error");
    });
}

loginBtn && loginBtn.addEventListener('click', login)

//FOR SIGNING THE USER OUT

let signOutBtn = document.getElementById('signout-btn');

const signOutFnc = () => {
  swal({
    title: "Are you sure?",
    text: "Are you sure you want to signout?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
    .then((willDelete) => {
      if (willDelete) {
        signOut(auth).then(() => {
          location.reload();
          window.location.href = 'index.html'
        }).catch((error) => {
          new swal("ERROR!", "There was an error Signing you Out", "error");
        })
      } else {

      }
    });
}

signOutBtn && signOutBtn.addEventListener('click', signOutFnc);