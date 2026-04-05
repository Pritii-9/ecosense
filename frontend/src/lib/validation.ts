export const nameRegex = /^[A-Za-z][A-Za-z\s'-]{1,49}$/
export const emailRegex = /^(?=.{6,254}$)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
export const codeRegex = /^\d{6}$/

export const validateFirstName = (name: string) => {
  const trimmedName = name.trim()

  if (!trimmedName) {
    return 'First name is required.'
  }

  if (!nameRegex.test(trimmedName)) {
    return 'Use letters, spaces, apostrophes, or hyphens only.'
  }

  return ''
}

export const validateEmail = (email: string) => {
  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    return 'Email is required.'
  }

  if (!emailRegex.test(trimmedEmail)) {
    return 'Enter a valid email address.'
  }

  return ''
}

export const validateVerificationCode = (code: string) => {
  const trimmedCode = code.trim()

  if (!trimmedCode) {
    return 'Verification code is required.'
  }

  if (!codeRegex.test(trimmedCode)) {
    return 'Enter the 6-digit code sent to your email.'
  }

  return ''
}

export const validatePassword = (password: string) => {
  if (!password) {
    return 'Password is required.'
  }

  if (password.length < 8 || password.length > 64) {
    return 'Password must be 8 to 64 characters long.'
  }

  if (!/[a-z]/.test(password)) {
    return 'Add at least one lowercase letter.'
  }

  if (!/[A-Z]/.test(password)) {
    return 'Add at least one uppercase letter.'
  }

  if (!/\d/.test(password)) {
    return 'Add at least one number.'
  }

  if (!/[^\w\s]/.test(password)) {
    return 'Add at least one special character.'
  }

  return ''
}

export const validatePasswordConfirmation = (password: string, confirmPassword: string) => {
  if (!confirmPassword) {
    return 'Please confirm your password.'
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match.'
  }

  return ''
}
