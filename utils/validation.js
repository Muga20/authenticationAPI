function validateEmail(email) {
    // Check email length
    if (email.length <= 10) {
        return false;
    }

    // Use a simpler regex for basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    // Check password length
    if (password.length <= 6) {
        return false;
    }

    // Use a simpler regex for basic password format validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/;
    return passwordRegex.test(password);
}

function validateNames(name) {
    // Check name length
    if (name.length <= 3) {
        return false;
    }

    // No additional validation required for names
    return true;
}

module.exports = {
    validateEmail,
    validatePassword,
    validateNames,
};
