document.addEventListener('DOMContentLoaded', function() {
    // define elements from the DOM
    var accountButton = document.getElementById('accountButton');
    var userInfo = document.getElementById('userInfo');
    var userInitial = document.getElementById('userInitial');
    var userName = document.getElementById('userName');
    var registrationModal = document.getElementById('registrationModal');
    var loginModal = document.getElementById('loginModal');

    // check if user is logged in
    var isLoggedIn = function() {
        return localStorage.getItem('user') !== null;
    };

    // update the UI based on login status
    if (isLoggedIn()) {
        showUserInfo();
    } else {
        showAccountButton();
    }

    // account button click
    accountButton.addEventListener('click', function() {
        registrationModal.style.display = 'block'; // show modal
        registrationModal.style.opacity = '0';
        setTimeout(() => {
            registrationModal.style.transition = 'opacity 0.3s ease-in'; // smooth modal transition (fade in)
            registrationModal.style.opacity = '1';
        }, 10);
    });

    // close modals
    window.closeModal = function(modalId) {
        var modal = document.getElementById(modalId);
        modal.style.transition = 'opacity 0.3s ease-out'; // smooth modal transition (fade out)
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    };

    // close modal when clicking outside of the modal content (foreground)
    window.addEventListener('click', function(event) {
        var registrationModal = document.getElementById('registrationModal');
        var loginModal = document.getElementById('loginModal'); 
         
        if (event.target === registrationModal) {
            closeModal('registrationModal');
        }
        if (event.target === loginModal) { 
            closeModal('loginModal'); 
        }
    });

    // registration form
    document.getElementById('registrationForm').addEventListener('submit', function(event) {
        event.preventDefault(); // no reload

        // get email, username, password
        var regEmail = document.getElementById('regEmail').value;
        var regUsername = document.getElementById('regUsername').value;
        var regPassword = document.getElementById('regPassword').value;

        // save user to local storage (insecure, check the 'Reflection' section of the google doc for more info)
        localStorage.setItem('user', JSON.stringify({ email: regEmail, username: regUsername, password: regPassword }));

        registrationModal.style.display = 'none'; // close 
        loginModal.style.display = 'block'; // open login
    });

    // login form
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault(); // no reload

        // user from localstorage (insecure, check the 'Reflection' section of the google doc for more info)
        var storedUser = JSON.parse(localStorage.getItem('user'));

        // check credentials in localstorage 
        if (storedUser && storedUser.email === document.getElementById('loginEmail').value && storedUser.password === document.getElementById('loginPassword').value) {
            showUserInfo();
            updateSampleReview();
            closeModal('loginModal');
            loadReviews(); // load the reviews after login
        } else {
            alert('Invalid email or password.'); // TODO: make an actual popup rather than an alert box
        }
    });

    // check notifications (placeholder, no real functionality for now lol)
    document.querySelector('.notification').addEventListener('click', function() {
        alert("You're all caught up!");
    });

    // update sample review based on login status
    function updateSampleReview() {
        var sampleReviewName = document.getElementById('sampleReviewName');
        var sampleReviewAvatar = document.getElementById('sampleReviewAvatar');
        var editReviewButton = document.getElementById('editReview');

        if (isLoggedIn()) {
            var user = JSON.parse(localStorage.getItem('user'));
            sampleReviewName.textContent = user.username;
            sampleReviewAvatar.textContent = user.username.charAt(0).toUpperCase();
            editReviewButton.style.display = 'block';
        } else {
            sampleReviewName.textContent = "Sample User";
            sampleReviewAvatar.textContent = "S";
            editReviewButton.style.display = 'none';
        }
    }

    // edit the sample review
    document.getElementById('editReview').addEventListener('click', function() {
        var sampleReviewText = document.getElementById('sampleReviewText');
        var currentText = sampleReviewText.textContent; // get the current text
        var editTextarea = document.createElement('textarea'); // create a textarea element (TODO: Style this to make it dark)
        editTextarea.value = currentText; 
        editTextarea.style.width = "100%"; 

        sampleReviewText.parentNode.replaceChild(editTextarea, sampleReviewText); // replace the sample review text with the textarea (edit)
        this.textContent = 'Save';

        this.addEventListener('click', function saveHandler() { // add a click event listener to save the edited text
            var newText = editTextarea.value;
            sampleReviewText.textContent = newText;
            editTextarea.parentNode.replaceChild(sampleReviewText, editTextarea); 
            this.textContent = 'Edit';

            if (isLoggedIn()) {
                var user = JSON.parse(localStorage.getItem('user'));
                user.sampleReview = newText;
                localStorage.setItem('user', JSON.stringify(user));
            }

            this.removeEventListener('click', saveHandler); 
        });
    });

    // function to add a new review element
    function addReview(title, content, user) {
        var newReview = document.createElement('div'); 
        newReview.classList.add('review-item'); 
        newReview.innerHTML = `
            <div class="reviewer">
                <span class="avatar">${user.username.charAt(0).toUpperCase()}</span>
                <span class="name">${user.username}</span>
            </div>
            <div class="rating">★★★★★ 5.0</div>
            <p class="review-text">${content}</p>
        `;
        document.getElementById('reviewList').appendChild(newReview);
    }

    // save reviews to localStorage (insecure, check the 'Reflection' section of the google doc for more info)
    function saveReviews() {
        var reviewItems = document.getElementById('reviewList').querySelectorAll('.review-item:not(#sampleReview)'); // exclude sample review in the html
        var reviews = Array.from(reviewItems).map(function(reviewItem) { // map each review item to an object
            var reviewerName = reviewItem.querySelector('.name').textContent; 
            var reviewContent = reviewItem.querySelector('.review-text').textContent;  
            return { user: { username: reviewerName }, content: reviewContent }; 
        }); 
        localStorage.setItem('reviews', JSON.stringify(reviews)); // save to localStorage
    }

    // Load reviews from localStorage
    function loadReviews() {
        var reviews = JSON.parse(localStorage.getItem('reviews'));
        if (reviews) { 
            document.getElementById('reviewList').querySelectorAll('.review-item:not(#sampleReview)').forEach(el => el.remove()); // remove 
            reviews.forEach(function(review) {
                addReview('', review.content, review.user); // add each review
            });
        }
    }

    // post review button
    document.getElementById('postReview').addEventListener('click', function() {
        var content = document.getElementById('reviewContent').value; // get review content
        var user = JSON.parse(localStorage.getItem('user')) || { username: 'Sample User' }; // default to sample user

        if (content.trim() !== '') { // check if content is not empty
            addReview('', content, user);
            document.getElementById('reviewContent').value = ''; // clear content
            saveReviews();
        }
    });

    // show user info
    function showUserInfo() {
        var userData = JSON.parse(localStorage.getItem('user')); // get user data
        userInitial.textContent = userData.username.charAt(0).toUpperCase(); // set user initial
        userName.textContent = userData.username; // set user name
        accountButton.style.display = 'none'; // hide account button
        userInfo.style.display = 'flex'; 
        updateSampleReview();
    }

    // show account button
    function showAccountButton() {
        accountButton.style.display = 'block';
        userInfo.style.display = 'none';
    }

    // load reviews on page load
    loadReviews();
});

// log out when dropdown icon is clicked
document.querySelector('.dropdown-icon').addEventListener('click', function() {
    localStorage.removeItem('user'); 
    alert('You have logged out.');
    showAccountButton();
    updateSampleReview();
    loadReviews();
    location.reload(); // refresh the page
});
