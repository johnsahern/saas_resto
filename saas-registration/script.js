// =======================================================================
// CONFIGURATION API
// =======================================================================

// Utilisation dynamique des URLs pour la production
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3001/api';
const APP_URL = window.APP_URL || 'http://localhost:8080';

// =======================================================================
// GESTION DES ÉTAPES
// =======================================================================

let currentStep = 1;
const totalSteps = 2;

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    showStep(1);
});

function initializeEventListeners() {
    // Bouton "Continuer"
    const nextStepBtn = document.getElementById('next-step');
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', function() {
            if (validateCurrentStep()) {
                nextStep();
            }
        });
    }

    // Bouton "Retour"
    const prevStepBtn = document.getElementById('prev-step');
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', function() {
            prevStep();
        });
    }

    // Formulaire principal
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (!validateCurrentStep()) return;
            await submitRegistration();
        });
    }
}

function showStep(step) {
    const restaurantStep = document.getElementById('restaurant-step');
    const ownerStep = document.getElementById('owner-step');
    
    if (restaurantStep) restaurantStep.style.display = 'none';
    if (ownerStep) ownerStep.style.display = 'none';
    
    if (step === 1 && restaurantStep) {
        restaurantStep.style.display = 'block';
    } else if (step === 2 && ownerStep) {
        ownerStep.style.display = 'block';
    }
    
    updateStepIndicator(step);
    currentStep = step;
}

function nextStep() {
    if (currentStep < totalSteps) {
        showStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

function updateStepIndicator(step) {
    for (let i = 1; i <= totalSteps; i++) {
        const stepElement = document.getElementById(`step${i}`);
        if (stepElement) {
            stepElement.classList.remove('active', 'completed');
            if (i < step) {
                stepElement.classList.add('completed');
            } else if (i === step) {
                stepElement.classList.add('active');
            }
        }
    }
}

function validateCurrentStep() {
    if (currentStep === 1) {
        return validateRestaurantInfo();
    } else if (currentStep === 2) {
        return validateOwnerInfo();
    }
    return true;
}

function validateRestaurantInfo() {
    let isValid = true;
    
    const restaurantName = document.getElementById('restaurant_name');
    if (!restaurantName || !restaurantName.value.trim()) {
        alert('Nom du restaurant requis');
        isValid = false;
    }
    
    const restaurantAddress = document.getElementById('restaurant_address');
    if (!restaurantAddress || !restaurantAddress.value.trim()) {
        alert('Adresse requise');
        isValid = false;
    }
    
    const restaurantPhone = document.getElementById('restaurant_phone');
    if (!restaurantPhone || !restaurantPhone.value.trim()) {
        alert('Téléphone requis');
        isValid = false;
    }
    
    const restaurantEmail = document.getElementById('restaurant_email');
    if (!restaurantEmail || !restaurantEmail.value.trim()) {
        alert('Email requis');
        isValid = false;
    }
    
    return isValid;
}

function validateOwnerInfo() {
    let isValid = true;
    
    const firstName = document.getElementById('owner_first_name');
    if (!firstName || !firstName.value.trim()) {
        alert('Prénom requis');
        isValid = false;
    }
    
    const lastName = document.getElementById('owner_last_name');
    if (!lastName || !lastName.value.trim()) {
        alert('Nom requis');
        isValid = false;
    }
    
    const ownerEmail = document.getElementById('owner_email');
    if (!ownerEmail || !ownerEmail.value.trim()) {
        alert('Email requis');
        isValid = false;
    }
    
    const password = document.getElementById('password');
    if (!password || !password.value || password.value.length < 8) {
        alert('Mot de passe requis (8 caractères minimum)');
        isValid = false;
    }
    
    const confirmPassword = document.getElementById('confirm_password');
    if (!confirmPassword || password.value !== confirmPassword.value) {
        alert('Les mots de passe ne correspondent pas');
        isValid = false;
    }
    
    return isValid;
}

function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

async function submitRegistration() {
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    
    if (!submitBtn || !submitText) return;
    
    const originalText = submitText.textContent;
    submitBtn.disabled = true;
    submitText.textContent = 'Création en cours...';
    
    try {
        const restaurantName = document.getElementById('restaurant_name').value.trim();
        const restaurantSlug = generateSlug(restaurantName);
        
        const formData = {
            restaurant: {
                name: restaurantName,
                slug: restaurantSlug,
                email: document.getElementById('restaurant_email').value.trim(),
                phone: document.getElementById('restaurant_phone').value.trim(),
                address: document.getElementById('restaurant_address').value.trim(),
                description: null
            },
            owner: {
                first_name: document.getElementById('owner_first_name').value.trim(),
                last_name: document.getElementById('owner_last_name').value.trim(),
                email: document.getElementById('owner_email').value.trim(),
                phone: document.getElementById('restaurant_phone').value.trim(),
                password: document.getElementById('password').value
            }
        };
        
        console.log('Envoi des données:', formData);
        
        const response = await fetch(`${API_BASE_URL}/auth/register-restaurant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        console.log('Réponse serveur:', result);
        
        if (response.ok && result.success) {
            alert('Félicitations ! Votre restaurant a été créé avec succès.');
            setTimeout(() => {
                window.location.href = APP_URL;
            }, 2000);
        } else {
            throw new Error(result.error || 'Erreur lors de la création du compte');
        }
        
    } catch (error) {
        console.error('Erreur inscription:', error);
        alert(`Erreur: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitText.textContent = originalText;
    }
}

function redirectToLogin() {
    window.location.href = `${APP_URL}/manager-login`;
}
