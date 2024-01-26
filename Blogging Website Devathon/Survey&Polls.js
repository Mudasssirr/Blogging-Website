let createPollBtn = document.getElementById('create-polls-btn');
let cancelPollCard = document.getElementById('cancel-poll-card');

let createSurveyBtn = document.getElementById('create-surveys-btn');
let cancelSurveyCard = document.getElementById('cancel-survey-card');

let createActions = document.getElementById('create-actions');
let createPollsCard = document.getElementById('create-poll');
let createSurveyCard = document.getElementById('create-survey');

let Cards = document.getElementById('surveysNpolls');
let CardsPagination = document.getElementById('blog-pagination');

// FOR SHOWING OR HIDING POLL CARD

createPollBtn && createPollBtn.addEventListener('click', () => {
    createActions.style.display = 'none';
    createSurveyCard.style.display = 'none';
    Cards.style.display = 'none';
    CardsPagination.style.display = 'none';
    createPollsCard.style.display = 'block';
});

cancelPollCard && cancelPollCard.addEventListener('click', () =>{
    createActions.style.display = 'flex';
    Cards.style.display = 'block';
    CardsPagination.style.display = 'flex';
    createSurveyCard.style.display = 'none';
    createPollsCard.style.display = 'none';
});

// FOR SHOWING OR HIDING SURVEY CARD

createSurveyBtn && createSurveyBtn.addEventListener('click', () => {
    createActions.style.display = 'none';
    createPollsCard.style.display = 'none';
    Cards.style.display = 'none';
    CardsPagination.style.display = 'none';
    createSurveyCard.style.display = 'block';
});

cancelSurveyCard && cancelSurveyCard.addEventListener('click', () =>{
    createActions.style.display = 'flex';
    Cards.style.display = 'block';
    CardsPagination.style.display = 'flex';
    createSurveyCard.style.display = 'none';
    createPollsCard.style.display = 'none';
});