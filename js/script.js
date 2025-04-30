document.addEventListener("DOMContentLoaded", () => {
    const languageSelect = document.getElementById("language-select");
    const debugOutput = document.getElementById("debug-output"); // Get debug div
    let currentLanguage = localStorage.getItem("language") || "en"; // Default to English or load saved preference
    let currentTranslations = {}; // Store current translations

    function logDebug(message) {
        // Removed debug div output for cleaner final version
        console.log(message); // Log to console
    }

    // Function to fetch translations and update UI
    async function loadTranslations(lang) {
        logDebug(`Attempting to load translations for: ${lang}`);
        try {
            // Use absolute path from server root for fetch
            const response = await fetch(`/locales/${lang}.json`); 
            logDebug(`Fetch response status for ${lang}.json: ${response.status}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            currentTranslations = await response.json(); // Store translations
            logDebug(`Successfully fetched and parsed ${lang}.json`);
            applyTranslations(currentTranslations);
            // Update the select dropdown to reflect the current language
            languageSelect.value = lang;
            // Update the lang attribute of the html tag
            document.documentElement.lang = lang;
            logDebug(`UI updated for language: ${lang}`);
        } catch (error) {
            logDebug(`Error loading translations for ${lang}: ${error.message}`);
            console.error("Error loading translations:", error);
            // Optionally load default language (e.g., English) as fallback
            if (lang !== "en") {
                logDebug("Falling back to English.");
                loadTranslations("en");
            }
        }
    }

    // Function to apply translations to elements with data-translate attribute
    function applyTranslations(translations) {
        let appliedCount = 0;
        document.querySelectorAll("[data-translate]").forEach(element => {
            const key = element.getAttribute("data-translate");
            if (translations[key]) {
                // Use innerHTML to correctly render HTML entities like &copy;
                element.innerHTML = translations[key];
                appliedCount++;
            } else {
                 logDebug(`Warning: Translation key "${key}" not found.`);
            }
        });
        logDebug(`Applied ${appliedCount} translations.`);
    }

    // --- Navigation Active State --- 
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split("/").pop() || "index.html"; // Get current page filename
        const navLinks = document.querySelectorAll("header nav ul li a");
        navLinks.forEach(link => {
            const linkPage = link.getAttribute("href");
            if (linkPage === currentPage) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
        logDebug(`Set active nav link for: ${currentPage}`);
    }

    // Event listener for language selection change
    if (languageSelect) {
        languageSelect.addEventListener("change", (event) => {
            const selectedLanguage = event.target.value;
            logDebug(`Language changed to: ${selectedLanguage}`);
            currentLanguage = selectedLanguage;
            localStorage.setItem("language", selectedLanguage); // Save preference
            loadTranslations(selectedLanguage);
        });
    }

    // --- Form Handling --- 

    const driverApplicationForm = document.getElementById("driver-application-form");
    const applicationStatus = document.getElementById("application-status");

    if (driverApplicationForm) {
        driverApplicationForm.addEventListener("submit", (event) => {
            event.preventDefault(); // Prevent default submission
            logDebug("Driver application form submitted.");

            // Basic Validation (check if required fields are filled)
            let isValid = true;
            driverApplicationForm.querySelectorAll("[required]").forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = "red"; // Highlight invalid field
                } else {
                    input.style.borderColor = "#ccc"; // Reset border color
                }
            });

            // Check experience minimum
            const experienceInput = document.getElementById("app_experience");
            if (experienceInput && parseInt(experienceInput.value) < 2) {
                 isValid = false;
                 experienceInput.style.borderColor = "red";
            }

            if (isValid) {
                logDebug("Form validation passed.");
                // Simulate successful submission (replace with actual submission logic if backend exists)
                if (applicationStatus) {
                    applicationStatus.textContent = currentTranslations["apply_form_success_message"] || "Application submitted successfully!";
                    applicationStatus.style.color = "green";
                }
                driverApplicationForm.reset(); // Clear the form
                // Optionally, disable the form or redirect
            } else {
                logDebug("Form validation failed.");
                if (applicationStatus) {
                    applicationStatus.textContent = currentTranslations["apply_form_error_message"] || "Please fill out all required fields correctly.";
                    applicationStatus.style.color = "red";
                }
            }
        });
    }

    // Add similar handling for contact form if it exists on the page
    const contactForm = document.getElementById("contact-form");
    const formStatus = document.getElementById("form-status"); // Status for contact form

    if (contactForm) {
         contactForm.addEventListener("submit", (event) => {
            event.preventDefault(); // Prevent default submission
            logDebug("Contact form submitted.");

            // Basic Validation
            let isValid = true;
            contactForm.querySelectorAll("[required]").forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = "red";
                } else {
                    input.style.borderColor = "#ccc";
                }
            });

            if (isValid) {
                logDebug("Contact form validation passed.");
                if (formStatus) {
                    formStatus.textContent = currentTranslations["contact_form_success_message"] || "Message sent successfully!";
                    formStatus.style.color = "green";
                }
                contactForm.reset();
            } else {
                logDebug("Contact form validation failed.");
                if (formStatus) {
                    formStatus.textContent = currentTranslations["contact_form_error_message"] || "Please fill out all required fields correctly.";
                    formStatus.style.color = "red";
                }
            }
        });
    }

    // --- End Form Handling ---

    // Initial setup
    setActiveNavLink(); // Set active link on page load
    logDebug(`Initial language: ${currentLanguage}`);
    loadTranslations(currentLanguage); // Load initial translations
});

