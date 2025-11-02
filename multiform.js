// * Get DOM Elements

// * Steps
const steps = document.querySelectorAll('.step-number');

// * STEP 1: Personal Info Form
const personalInfoForm = document.querySelector('.personal-info-form');
const nameField = document.querySelector('#name');
const emailField = document.querySelector('#email');
const phoneField = document.querySelector('#phone');

//* STEP 1: Error Messages
const errorMessage = document.querySelectorAll('.error-message');

// * STEP 2: Select Plan Section
const selectPlanSection = document.querySelector('.select-plan-section');
const plans = document.querySelectorAll('.plan-card');
const planPrices = document.querySelectorAll('.price');
const pricingCycles = document.querySelectorAll('.pricing-cycle');
const yearlyDiscountDurations = document.querySelectorAll('.yearly-discount-duration');
const toggleContainer = document.querySelector('.toggle-container'); //? Container for range input and custom toggle thumb
const billingRange = document.getElementById('billing-toggle'); //? Input type range element, contains values 0(monthly) or 1(yearly)
const toggleThumb = document.querySelector('.toggle-thumb'); //? Custom toggle thumb
const monthly = document.getElementById('monthly');
const yearly = document.getElementById('yearly');

//* STEP 3: Addons Section
const addOnsSection = document.querySelector('.add-ons-section');
const addOns = document.querySelectorAll('.addon-card');
const defaultCheckboxes = document.querySelectorAll('.addon-card-body input[type="checkbox"]');
const addOnPrices = document.querySelectorAll('.addon-price');
const addOnPricingCycles = document.querySelectorAll('.addon-pricing-cycle');

// * STEP 4: Summary Section
const summarySection = document.querySelector('.summary-section');
const changePlanBtn = document.querySelector('.change-plan-btn');
const userPlanSelected = document.querySelector('.user-plan-selected');
const selectedPlanPrice = document.querySelector('.selected-plan-price span');
const totalCost = document.querySelector('.total-cost');
const totalCostValue = document.querySelector('.total-cost-value');
const selectedAddOnContainer = document.querySelector('.selected-addon-and-price-container');

// * STEP 5: Thank You Section
const thankYouSection = document.querySelector('.thank-you-section');

// * Next Step Buttons
const nextButtons = document.querySelectorAll('.next-button');

// * Previous Step Buttons
const previousButtons = document.querySelectorAll('.previous-button');

// * Confirmation Modal
const confirmationModalContainer = document.querySelector('.confirmation-modal-container');

// * Spinner Element Container
const spinnerContainer = document.querySelector('.spinner-container');


// * TRACKING USER'S CURRENT STEP & FORMS ARRAY FOR DYNAMICALLY SHOWING FORM STEPS
let currentStep = 0; //? Variable to keep track of the current step the user is on
const forms = [ //? Array of all the form/sections steps
    personalInfoForm, 
    selectPlanSection, 
    addOnsSection, 
    summarySection, 
    thankYouSection
]; 

//* Initialize with first step 0 active, all other sections hidden/disabled
showNextStep(0);

// * Flag to prevent multiple submissions
let isSubmitted = false; 



// * SHOWING FORM STEPS/SECTIONS DYNAMICALLY


// * Displays and highlights the form/section & step number based on the user's current step index.
// * @param {number} nextStepIndex - The index of the form/section and step number the user is on.
function showNextStep(nextStepIndex) {
    //? Display the form/section by removing or add the hidden class to the it
    forms.forEach((form, index) => {
        if (index === nextStepIndex) {
            form.classList.remove('hidden');
            form.classList.remove('disabled-section');
        } 
        else {
            form.classList.add('hidden');
            form.classList.add('disabled-section');
        }
    });

    //? Add the active class to the step number of the form/section the user is on, else remove it
    steps.forEach((step, index) => {
        if (index === nextStepIndex) {
            step.classList.add('active');
        } 
        else {
            step.classList.remove('active');
        }
    });
}



// * Clicking  the step number to smoothly move to that step/section
steps.forEach((step, stepIndex) => {
    step.addEventListener('click', () => {
        // ? Only allow progression if the current step is valid
        if (!validateStep(currentStep)) {
            return;
        }
        showNextStep(stepIndex);
        currentStep = stepIndex;
        updateStepCompletion(currentStep);
        displaySummary();
        // ? Scroll to the form/section with an animation
    })
});



//* NEXT & PREVIOUS BUTTONS NAVIGATION FUNCTIONALITIES

// // Tracks and stores the current billing range value, the default value is 0(monthly) as defined in the HTML
// let lastRangeValue = billingRange.value; 

//? Index of the summary section in the forms array to persist the active state when the thank you section is displayed
const summarySectionIndex = forms.indexOf(summarySection);


//* Dynamic next buttons
nextButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        if (isSubmitted) return; //? Prevent multiple submissions

        e.preventDefault();

        if (!validateStep(currentStep)) {
            return; //? Prevent progression if current step invalid
        }

        updateStepCompletion(currentStep);

        //? Loop through the step completion array up to the current step index(4(max) in this case)
        //? If any of the steps up to the current step index(i<=4) are incomplete (i.e stepCompletion[i] === false), prevent progression
        for (let i = 0; i <= currentStep; i++) {
            if (!stepCompletion[i]) {
                return; //? Prevent progression if any prior step incomplete
            }
        }

        //? If the index of currentStep is less than the length of the forms array, increase currentStep by 1(i.e go to the next step)
        //? length of forms array - 1 is the index of the forms array (in this case length is 5, index is 5-1 = 4)
        if (currentStep < forms.length - 1) {
            currentStep++;
            showNextStep(currentStep);

            //! To use this remove the reset form function and the updateAddOnPrices function calls from step 2 below also uncomment "let lastRangeValue" above
            // Reset the lastRangeValue to the current billing range value to update the add-on prices
            // if (currentStep === 1 && billingRange.value !== lastRangeValue) { 
            //     updateAddOnPrices();
            //     lastRangeValue = billingRange.value; // Update lastRangeValue to the current billing range value
            // }

            if (currentStep === 3) {
                displaySummary();
            }

            if (currentStep === 4) {
                showThankYouSection();
                steps[summarySectionIndex].classList.add('active');
            }
        }
    });
});



//* Dynamic previous buttons
previousButtons.forEach(button => {
    button.addEventListener('click', () => {
        //? If the index of the currentStep is greater than 0, decrease currentStep by 1(i.e go to the previous step)
        if (currentStep > 0) {
            currentStep--;
            showNextStep(currentStep);
        }
    });
});



//* Validation for each step
function validateStep(stepIndex) {
    switch(stepIndex) {
        case 0: {
            //? Explicitly call all validations to show all errors, then check combined validity
            const isNameValid = validateName();
            const isEmailValid = validateEmail();
            const isPhoneValid = validatePhoneNo();
            return isNameValid && isEmailValid && isPhoneValid;
        }
        case 1:
            return Array.from(plans).some(plan => plan.classList.contains('active')); //? Returns true if at least one plan is selected
        case 2:
            return true;
        case 3:
            return true;
        default:
            return false;
    }
}

//? Track completion status, each step is false by default
const stepCompletion = [false, false, false, false];

// * Update the step completion status
function updateStepCompletion(stepIndex) {
    stepCompletion[stepIndex] = validateStep(stepIndex);
}



// * STEP 1: Personal Info Form


//* Validate Form Input Fields

//! Validate Name Input Field
function validateName() {
    const fullNameRegex = /^[a-zA-Z]+ [a-zA-Z]+$/; //? Only first and last name
    // const fullNameRegex = /^[a-zA-Z]+ [a-zA-Z]+(?: [a-zA-Z]+)?$/; //? Optional middle/third name

    if (nameField.value === '' || !fullNameRegex.test(nameField.value)) {
        errorMessage[0].innerText = 'This field is required';
        nameField.classList.add('error');
        nameField.classList.add('error-vibrate');
        setTimeout(() => {
            nameField.classList.remove('error-vibrate');
        }, 2000);
    }
    else {
        nameField.classList.remove('error');
    }

    //? Returns true or false if the name provided is valid or not
    return fullNameRegex.test(nameField.value); 
}


//! Validate Email Input Field
function validateEmail() {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailField.value === '' || !emailRegex.test(emailField.value)) {
        errorMessage[1].innerText = 'This field is required';
        emailField.classList.add('error');
        emailField.classList.add('error-vibrate');
        setTimeout(() => {
            emailField.classList.remove('error-vibrate');
        }, 2000);
    }
    else {
        emailField.classList.remove('error');
    }

    //? Returns true or false if the email provided is valid or not
    return emailRegex.test(emailField.value); 
}


//! Validate Phone Input Field
function validatePhoneNo() {
    const phoneNoRegex = /^\+?\d{1,3} ?\d{3} ?\d{3} ?\d{3,4}$/;
    // const phoneNoRegex = /^\+?\d{1,3} ?\d{3} ?\d{3} ?\d{3,4}$|^\d{3} ?\d{3} ?\d{4}$/; //? Alternate Regex

    if (phoneField.value === '' || !phoneNoRegex.test(phoneField.value)) {
        errorMessage[2].innerText = 'This field is required';
        phoneField.classList.add('error');
        phoneField.classList.add('error-vibrate');
        setTimeout(() => {
            phoneField.classList.remove('error-vibrate');
        }, 2000);
    }
    else {
        phoneField.classList.remove('error');
    }

    //? Returns true or false if the phone number provided is valid or not
    return phoneNoRegex.test(phoneField.value); 
}




//! STEP 1: ERROR MESSAGES => Display Error Messages in Real Time

// * Name Field Error Message
nameField.addEventListener('input', () => {
    //? If the name field is invalid (i.e validateName returns false), Display error message
    if (!validateName()) { 
        errorMessage[0].innerText = 'Please enter your full name';
    }
    else {
        errorMessage[0].innerText = '';
    }

    //? Removes the error-vibrate animation class from having any effect on the name field while the user is typing
    nameField.classList.remove('error-vibrate'); 
});


// * Email Field Error Message
emailField.addEventListener('input', () => {
    // ? If the email field is invalid (i.e validateEmail returns false), Display error message
    if (!validateEmail()) {
        errorMessage[1].innerText = 'Please enter a valid email address';
    }
    else {
        errorMessage[1].innerText = '';
    }

    //? Removes the error-vibrate animation class from having any effect on the email field while the user is typing
    emailField.classList.remove('error-vibrate'); 
});


// * Phone Field Error Message
phoneField.addEventListener('input', () => {
    // ? If the phone field is invalid (i.e validatePhoneNo returns false), Display error message
    if (!validatePhoneNo()) {
        errorMessage[2].innerText = 'Please enter your phone number';
    }
    else {
        errorMessage[2].innerText = '';
    }

    //? Removes the error-vibrate animation class from having any effect on the phone field while the user is typing
    phoneField.classList.remove('error-vibrate'); 
});



//* STEP 2: Select Plan Section

// * Plan Cards: Selecting a plan, adding active state and removing the active state from previously selected plan
plans.forEach(plan => {
    plan.addEventListener('click', () => {
        plans.forEach(selectedPlan => {
            selectedPlan.classList.remove('active');
        });
        plan.classList.add('active');
    });
});

// * Billing Options: Monthly and Yearly

// * Clicking the Range Input to toggle switching
billingRange.addEventListener('input', () => {
    if (billingRange.value === '1') {
        yearly.checked = true;
        toggleContainer.classList.add('active');
        bounceThumb();
        updatePlanPrices();
        updateAddOnPrices();
    } 
    else {
        monthly.checked = true;
        toggleContainer.classList.remove('active');
        bounceThumb();
        updatePlanPrices();
        updateAddOnPrices();
    }
});

// * Clicking the "Monthly" and "Yearly" Labels to toggle switching
monthly.addEventListener('change', () => {
    billingRange.value = '0';
    toggleContainer.classList.remove('active');
    bounceThumb();
    updatePlanPrices();
    updateAddOnPrices();
});

yearly.addEventListener('change', () => {
    billingRange.value = '1';
    toggleContainer.classList.add('active');
    bounceThumb();
    updatePlanPrices();
    updateAddOnPrices();
});

function bounceThumb() {
    toggleThumb.classList.add('clicked');
    setTimeout(() => {
        toggleThumb.classList.remove('clicked');
    }, 150);
}

function updatePlanPrices() {
    planPrices.forEach((planPrice) => {    //? Using forEach to loop through the planPrices array and update the prices
        const pricesWithoutDollarSign = planPrice.innerHTML.replace('$', ''); //? Removing the '$' from the price
        
        if (billingRange.value === '1') {
            //? Updating the plan prices for yearly billing
            planPrice.innerHTML = '$' + parseInt(pricesWithoutDollarSign * 10);
            
            //? Updating the pricing cycles for yearly billing
            pricingCycles.forEach((cycle) => {
                cycle.innerHTML = '/yr';
            });
            
            //? Displaying the yearly discount durations
            yearlyDiscountDurations.forEach((duration) => {
                duration.classList.remove('hidden');
                duration.innerHTML = '2 months free';
            });
        } 
        else {
            //? Updating the plan prices for monthly billing
            planPrice.innerHTML = '$' + parseInt(pricesWithoutDollarSign / 10);
            
            //? Updating the pricing cycles for monthly billing
            pricingCycles.forEach((cycle) => {
                cycle.innerHTML = '/mo';
            });
            
            //? Hiding the yearly discount durations
            yearlyDiscountDurations.forEach((duration) => {
                duration.classList.add('hidden');
                duration.innerHTML = '';
            });
        }
    });

    //! Populating the Plans Prices, Pricing Cycles and Yearly Discount Durations Sequentially
    // 1. Arcade Plan
    // let arcadePlan = planPrices[0].innerHTML;
    // const arcadePlanWithoutDollarSign = arcadePlan.replace('$', '');
    // if (billingRange.value === '1') {
    //     console.log(arcadePlanWithoutDollarSign);
    //     planPrices[0].innerHTML = '$' + parseInt(arcadePlanWithoutDollarSign * 10);
    //     pricingCycles[0].innerHTML = '/yr';
    //     yearlyDiscountDurations[0].classList.remove('hidden');
    //     yearlyDiscountDurations[0].innerHTML = '2 months free';
    // } 
    // else {
    //     planPrices[0].innerHTML = '$' + parseInt(arcadePlanWithoutDollarSign / 10);
    //     pricingCycles[0].innerHTML = '/mo';
    //     yearlyDiscountDurations[0].classList.add('hidden');
    //     yearlyDiscountDurations[0].innerHTML = '';
    // }
}



//* STEP 3: Add-ons Section

// * Add-ons Cards: Selecting an Add-on Card, checking the checkbox and Adding Active Class
addOns.forEach((addOn, index) => {
    const checkbox = defaultCheckboxes[index];  //? Use the index to access the corresponding checkbox

    //? Toggle active class and checkbox checked state on card click
    addOn.addEventListener('click', () => {
        const isActive = addOn.classList.toggle('active');
        checkbox.checked = isActive; 
        //? isActive returns true if the active class is present and false vice versa
        //? .check is a boolean value the input type checkbox has by default, it takes the isActive value and checks or unchecks the checkbox  
    });

    //? Toggle active class on checkbox change (e.g. keyboard interaction)
    checkbox.addEventListener('change', () => {
        addOn.classList.toggle('active', checkbox.checked);
    });
});


//* Checking if monthly or yearly billing is selected and updating the prices accordingly in step 3
function updateAddOnPrices() {
    addOnPrices.forEach((addOnPrice) => {
        const pricesWithoutSymbols = addOnPrice.innerHTML.replace(/[+$]/g, '');

        if (billingRange.value === '1') {
            addOnPrice.innerHTML = '+$' + parseInt(pricesWithoutSymbols * 10);

            //? Updating the pricing cycles for yearly billing
            addOnPricingCycles.forEach((addOnCycle) => {
                addOnCycle.innerHTML = '/yr';
            });
        } 
        else {
            addOnPrice.innerHTML = '+$' + parseInt(pricesWithoutSymbols / 10);

            //? Updating the pricing cycles for yearly billing
            addOnPricingCycles.forEach((addOnCycle) => {
                addOnCycle.innerHTML = '/mo';
            });
        }
    });
}



// * STEP 4: Summary Section

//* Dynamically Create and Populate the Summary Section
function displaySummary() {
    let totalPrice = 0; //? Variable to store the total price of the selected plan and add-ons

    // ? Billing cycle displays
    //? Ternary/conditional operator to display either 'year' or 'month' based on the value of billingRange
    //? "year" is the expression if the condition is true and "month" if it is false
    const compactBillingCycle = billingRange.value === '1' ? '/yr' : '/mo';
    const planBillingCycle = billingRange.value === '1' ? '(Yearly)' : '(Monthly)';
    const totalPerBillingCycle = billingRange.value === '1' ? 'year' : 'month';

    //? Get the plan the user has selected
    plans.forEach((selectedPlan) => {
        if (selectedPlan.classList.contains('active')) {
            //? Get and display the chosen/selected plan name
            const chosenPlanName = selectedPlan.querySelector('.plan-card-header').textContent;
            userPlanSelected.textContent = chosenPlanName + planBillingCycle;

            //? Get and display the chosen plan's price and then convert to a pure number for calculation
            const chosenPlanPrice = selectedPlan.querySelector('.price').textContent.trim();
            selectedPlanPrice.textContent = chosenPlanPrice + compactBillingCycle;

            //? Extract numeric value from price string (e.g. "$10" -> 10)
            const planPriceWithoutSymbol = parseInt(chosenPlanPrice.replace(/[^0-9]/g, ''));
            totalPrice += planPriceWithoutSymbol; //? Adds and then saves the extracted price to variable totalPrice
        }
    });

    //? Clear previous add-ons summary if any
    selectedAddOnContainer.innerHTML = '';

    //? Get add-ons that are checked by the user
    addOns.forEach((selectedAddOn, index) => {
        const checkbox = defaultCheckboxes[index]; //? Use the index to access the corresponding checkbox

        if (checkbox.checked) {
            const chosenAddOn = selectedAddOn.querySelector('.addon-card-header').textContent;
            const chosenAddOnPrice = selectedAddOn.querySelector('.addon-price').textContent.trim();
            const addOnPriceWithoutSymbol = parseInt(chosenAddOnPrice.replace(/[^0-9]/g, ''));

            const selectedAddOns = `
                <div class="selected-addon-and-price">
                    <span class="selected-addon">${chosenAddOn}</span>
                    <span class="selected-addon-price">${chosenAddOnPrice + compactBillingCycle}</span>
                </div>
            `;
            selectedAddOnContainer.innerHTML += selectedAddOns;

            //? Adds and then saves the extracted price to variable totalPrice
            totalPrice += addOnPriceWithoutSymbol;

            // ! OR this:
            //? Create elements for add-on name and price
            // const addOnDiv = document.createElement('div');
            // addOnDiv.classList.add('selected-addon-and-price');

            // const addOnNameSpan = document.createElement('span');
            // addOnNameSpan.classList.add('selected-addon');
            // addOnNameSpan.textContent = chosenAddOn;

            // const addOnPriceSpan = document.createElement('span');
            // addOnPriceSpan.classList.add('selected-addon-price');
            // addOnPriceSpan.textContent = chosenAddOnPrice;

            // addOnDiv.appendChild(addOnNameSpan);
            // addOnDiv.appendChild(addOnPriceSpan);

            // selectedAddOnContainer.appendChild(addOnDiv);
        }
    });

    //? Display the total per billing cycle
    totalCost.textContent = 'Total (per ' + totalPerBillingCycle + ')';

    //? Display the total price
    if (billingRange.value === '0') { //monthly billing price display
        totalCostValue.textContent = '+$' + totalPrice + compactBillingCycle;
    } 
    else { //yearly billing price display
        totalCostValue.textContent = '$' + totalPrice + compactBillingCycle;
    }
}


// * Change Plan Button

//? Navigates back to step two (plan selection) by updating currentStep to 1.
function handleChangePlanClick() {
    //? Set current step to 1 (select plan section's index no in the array)
    currentStep = 1;
    
    //? Use the function to continue to the next step once the user has selected a plan
    showNextStep(currentStep);
}
changePlanBtn.addEventListener('click', handleChangePlanClick);



// * STEP 5: Thank You Section

// ? Display the thank you section
function showThankYouSection() {
    // ? Display the confirmation modal
    showConfirmationModal();

    // ? Confirm button on the confirmation modal
    const confirmationModal = document.querySelector('.confirmation-modal');
    const confirmButton = confirmationModal.querySelector('.confirm-button');
    confirmButton.addEventListener('click', () => {
        // ? Hide the confirmation modal
        confirmationModalContainer.classList.add('hidden');
        confirmationModalContainer.style.display = '';

        // ? Creating the spinner before displaying the thank you section
        spinnerContainer.classList.remove('hidden');
        const spinner = document.createElement('div');
        spinner.classList.add('spinner');
        spinnerContainer.style.display = 'flex';
        spinnerContainer.appendChild(spinner);

        // ? After 2 seconds, remove the spinner and display the thank you section
        setTimeout(() => {
            // ? Hide the summary section
            summarySection.classList.add('hidden');
            summarySection.classList.add('disabled-section');

            // ? Display the thank you section
            thankYouSection.classList.remove('hidden');
            thankYouSection.classList.remove('disabled-section');

            // ? Hide the spinner and clear its content
            spinnerContainer.style.display = '';
            spinnerContainer.classList.add('hidden');
            spinnerContainer.innerHTML = '';

            const sectionElements = `
                <img src="images/icon-thank-you.svg" alt="Thank You Image">
                <h2 class="thank-you-text">Thank you!</h2>
                <p class="thank-you-paragraph">
                    Thanks for confirming your subscription! We hope you have fun using our platform. If you ever need support,
                    please feel free to email us at <a href="mailto:support@loremgaming.com">support@loremgaming.com</a>
                </p>
            `;
            thankYouSection.innerHTML = sectionElements;
            isSubmitted = true; //? Set flag to true after showing thank you section
            resetForm(); //? Reset the form to its initial state
        }, 2000);
    });
}


// * Display Confirmation Modal
function showConfirmationModal() {
    // ? Create & display a confirmation modal
    confirmationModalContainer.classList.remove('hidden');
    confirmationModalContainer.style.display = 'flex';

    const confirmationModal = document.createElement('div');
    confirmationModal.classList.add('confirmation-modal');

    let selectedPlanName = '';
    let selectedPlanPriceCost = '';
    plans.forEach(plan => {
        if (plan.classList.contains('active')) {
            selectedPlanName = plan.querySelector('.plan-card-header').textContent;
            selectedPlanPriceCost = plan.querySelector('.price').textContent.trim();
        }
    });

    const totalPrice = totalCostValue.textContent;

    confirmationModal.innerHTML = `
        <div class="close-modal"> 
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill-rule="evenodd" class="close-modal-icon">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z"/>
            </svg>
        </div>
        <div class="confirmation-modal-details">
            <div class="modal-header">
                <h3>Confirm Your Subscription 
                    <span>${nameField.value.split(' ')[0]}</span>
                </h3>
                <p>
                    Please make sure you have selected your preferred plan and add-ons. Are you sure you want to confirm your subscription?
                </p>
            </div>

            <div class="modal-body">
                <!--* Personal Info -->
                <aside class="confirm-personal-info-container">
                    <h3>Personal Info</h3>
                    <div class="confirm-personal-info-body">
                        <div class="confirm-personal-info-name">
                            <h5>Name</h5>
                            <span class="personal-info-name">${nameField.value}</span>
                        </div>
                        <div class="confirm-personal-info-email">
                            <h5>Email</h5>
                            <span class="personal-info-email">${emailField.value}</span>
                        </div>
                        <div class="confirm-personal-info-phone">
                            <h5>Phone</h5>
                            <span class="personal-info-phone">${phoneField.value}</span>
                        </div>
                    </div>
                </aside>
                
                <main class="confirm-plan-and-addons-container">
                    <!-- * Confirm Selected Plan -->
                    <div class="confirm-plan-header">
                        <h4>Plan</h4>
                        <h4>Price</h4>
                    </div>
                    <div class="confirm-plan-body">
                        <div class="confirm-plan-name">
                            <span class="plan-name">${selectedPlanName + (billingRange.value === '0' ? '(Monthly)' : '(Yearly)')}</span>
                        </div>
                        <div class="confirm-plan-price">
                            <span class="plan-price">${selectedPlanPriceCost + (billingRange.value === '0' ? '/mo' : '/yr')}</span>
                        </div>
                    </div>

                    <div class="confirm-divider">
                        <hr>
                    </div>

                    <!-- * Confirm Selected Add-ons -->
                    <div class="confirm-add-ons-header">
                        <h4>Add-ons</h4>
                    </div>
                    <div class="confirm-add-ons-body"></div>

                    <div class="confirm-divider">
                        <hr>
                    </div>

                    <!-- * Confirm Total -->
                    <div class="confirm-total">
                        <h4>Total</h4>
                        <div class="confirm-total-amount">
                            <span class="total-amount">${totalPrice}</span>
                        </div>
                    </div>
                </main>

            </div>

            <div class="confirm-button-container">
                <button class="confirm-button">
                    Confirm
                </button>
            </div>
        </div>
    `;
    confirmationModalContainer.innerHTML = '';
    confirmationModalContainer.appendChild(confirmationModal);

    const confirmAddOnsBody = confirmationModal.querySelector('.confirm-add-ons-body');
    confirmAddOnsBody.innerHTML = ''; // Clear any existing content
    addOns.forEach((selectedAddOn, index) => {
        const checkbox = defaultCheckboxes[index];
        if (checkbox.checked) {
            const confirmedAddOns = selectedAddOn.querySelector('.addon-card-header').textContent;
            const confirmedAddOnsPrice = selectedAddOn.querySelector('.addon-price').textContent.trim();
            const billingCycle = billingRange.value === '0' ? '/mo' : '/yr';
            const addOnDiv = document.createElement('div');
            addOnDiv.classList.add('confirm-add-ons');
            addOnDiv.innerHTML = `
                <div class="confirm-add-on-name">
                    <span class="add-on-name">${confirmedAddOns}</span>
                </div>
                <div class="confirm-add-on-price">
                    <span class="add-on-price">${confirmedAddOnsPrice + billingCycle}</span>
                </div>
            `;
            confirmAddOnsBody.appendChild(addOnDiv);
        }
    });


    // ? Close the confirmation modal
    const closeModal = confirmationModal.querySelector('.close-modal-icon');
    closeModal.addEventListener('click', () => {
        confirmationModalContainer.classList.add('hidden');
        confirmationModalContainer.style.display = '';
        //? Reset to summary step to allow showing modal again on next attempt
        currentStep = 3;
        showNextStep(currentStep);
    });
    
    // ? Keep the summary section visible
    summarySection.classList.remove('hidden');
    summarySection.classList.remove('disabled-section');

    // ? Ensure the thank you section remains hidden until confirmation
    thankYouSection.classList.add('hidden');
    thankYouSection.classList.add('disabled-section');
}


// * Reset the form to its initial state after 5 seconds
function resetForm() {
    setTimeout(() => {
        //? Reset current step to 0
        currentStep = 0;
        showNextStep(currentStep);

        //? Clear form fields
        nameField.value = '';
        emailField.value = '';
        phoneField.value = '';

        //? Remove active class from plans
        plans.forEach(plan => plan.classList.remove('active'));

        //? Uncheck all add-ons and remove active class
        defaultCheckboxes.forEach(checkbox => checkbox.checked = false);
        addOns.forEach(addOn => addOn.classList.remove('active'));

        //? Reset billing to monthly
        billingRange.value = '0';
        monthly.checked = true;
        yearly.checked = false;
        toggleContainer.classList.remove('active');

        //? Set original monthly plan prices
        planPrices[0].innerHTML = '$9'; // Arcade
        planPrices[1].innerHTML = '$12'; // Advanced
        planPrices[2].innerHTML = '$15'; // Pro
        pricingCycles.forEach(cycle => cycle.innerHTML = '/mo');
        yearlyDiscountDurations.forEach(duration => {
            duration.classList.add('hidden');
            duration.innerHTML = '';
        });

        //? Set original monthly add-on prices
        addOnPrices[0].innerHTML = '+$1'; // Online service
        addOnPrices[1].innerHTML = '+$2'; // Larger storage
        addOnPrices[2].innerHTML = '+$2'; // Customizable profile
        addOnPricingCycles.forEach(cycle => cycle.innerHTML = '/mo');

        //? Clear error messages
        errorMessage.forEach(msg => msg.innerText = '');
        nameField.classList.remove('error');
        emailField.classList.remove('error');
        phoneField.classList.remove('error');

        //? Reset step completion
        stepCompletion.fill(false);

        //? Hide modal and thank you section
        confirmationModalContainer.classList.add('hidden');
        confirmationModalContainer.style.display = '';
        thankYouSection.classList.add('hidden');
        thankYouSection.classList.add('disabled-section');

        //? Reset submission flag
        isSubmitted = false;
    }, 5000);
}


// * JS Media Query
const container = document.querySelector('.container');
const childElements = Array.from(container.children);

// * Create error message element once
const screenErrorMessage = document.createElement('h1');
screenErrorMessage.className = 'screen-error-message';
screenErrorMessage.textContent = 'Please move to a larger screen to view this form';
screenErrorMessage.style.display = 'none';
container.insertBefore(screenErrorMessage, container.firstChild);

//* Display a custom message when the screen size is less than 320px
function handleSmallScreensResize() {
    if (window.matchMedia("(max-width: 319.9px)").matches) {
        // ? Hide main content, show screen error message
        childElements.forEach(element => element.style.display = 'none');
        screenErrorMessage.style.display = 'block';

        // ? Close confirmation modal if open (simulate clicking close icon)
        if (!confirmationModalContainer.classList.contains('hidden')) {
            confirmationModalContainer.classList.add('hidden');
            confirmationModalContainer.style.display = '';
            // Reset to summary step to allow showing modal again on next attempt
            currentStep = 3;
            showNextStep(currentStep);
        }
    } 
    else {
        // ? Show main content, hide screen error message
        childElements.forEach(element => element.style.display = 'flex');
        screenErrorMessage.style.display = 'none';
    }
}


// * Check screen size on page load
handleSmallScreensResize();


// * Check screen size on window resize
window.addEventListener('resize', handleSmallScreensResize);


