import { addDoc, db, collection, serverTimestamp, storage, ref, getDownloadURL, uploadBytes } from './firebase.js'

// FOR VALIDATING THE FEEDBACK

const submitFeedbackBtn = document.getElementById('feedback-submit-btn');
const feedbackEmail = document.getElementById('feedback-email');
const feedbackMessage = document.getElementById('feedback-message');
const feedbackSummary = document.getElementById('feedback-summary');
const feedbackImage = document.getElementById('feedback-img');
const submitFeedbackLoader = document.getElementById('feedback-submit-loader');


const feedbackEmailError = document.getElementById('feedback-email-err');
const feedbackMessageError = document.getElementById('feedback-msg-err');

// Function to check form validity
function isFeedbackValid() {
    let valid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if email is present
    if (!feedbackEmail.value.trim()) {
        feedbackEmailError.innerHTML = 'Please provide an email address.';
        valid = false;
    } else if (!emailRegex.test(feedbackEmail.value.trim())) {
        feedbackEmailError.innerHTML = 'Please provide a valid email address.';
        valid = false;
    } else {
        feedbackEmailError.innerHTML = '';
    }

    // Check if email is present
    if (!feedbackMessage.value.trim()) {
        feedbackMessageError.innerHTML = 'Please provide a message';
        valid = false;
    } else {
        feedbackMessageError.innerHTML = '';
    }

    if (valid === false) {
        submitFeedbackBtn.disabled = true;
    } else {
        submitFeedbackBtn.disabled = false;
    }

    return valid;
}

// // Event listeners for input validation
feedbackEmail && feedbackEmail.addEventListener('input', isFeedbackValid);
feedbackMessage && feedbackMessage.addEventListener('input', isFeedbackValid);
submitFeedbackBtn && submitFeedbackBtn.addEventListener('click', isFeedbackValid);

submitFeedbackBtn && submitFeedbackBtn.addEventListener('click', async () => {

    if (isFeedbackValid && feedbackMessageError.innerHTML === '' && feedbackEmailError.innerHTML === '') {
        showLoader()
        const feedbackData = {
            UserEmail: feedbackEmail.value.trim(),
            FeedbackMessage: feedbackMessage.value.trim(),
            timestamp: serverTimestamp(),
        };

        if (feedbackSummary.value.trim()) {
            feedbackData.Feedbacksummary = feedbackSummary.value.trim();
        }

        if (feedbackImage.files.length > 0) {
            const imageFile = feedbackImage.files[0];
            const storageRef = ref(storage, `UserFeedbackImages/${feedbackEmail.value}/${imageFile.name}`);
            
            try {
                const fileSnapshot = await uploadBytes(storageRef, imageFile);
                const imageURL = await getDownloadURL(fileSnapshot.ref);
                feedbackData.imageURL = imageURL;
            } catch (error) {
                // console.error('Error uploading image:', error);
            }
        }

        try {
            const feedbackRef = collection(db, 'user-feedback');
            await addDoc(feedbackRef, feedbackData);
            hideLoader()
            swal('Success', 'Thank you for your valuable feedback! We appreciate your input and will take it into consideration' , 'success');
        } catch (error) {
            swal('Error',`Error adding feedback to Firestore:${error}`, 'error');
        }
    }else{
        // console.error('fields are not valid');
    }

})

function showLoader(){
    submitFeedbackLoader.style.display = 'flex';
    submitFeedbackBtn.style.color = 'transparent';
}

function hideLoader(){
    submitFeedbackLoader.style.display = 'none';
    submitFeedbackBtn.style.color = 'white';
}