interface UserCredentials {
  username: string;
  password: string;
}

// Hardcoded user credentials
const VALID_CREDENTIALS: UserCredentials = {
  username: 'Bhanuprasad',
  password: 'Password@123'
};

export const checkPassword = async (username: string, password: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      resolve(
        username === VALID_CREDENTIALS.username && 
        password === VALID_CREDENTIALS.password
      );
    }, 500);
  });
};

// Add a function to validate username and password separately
export const validateCredentials = (username: string, password: string): { isValid: boolean; message: string } => {
  if (username !== VALID_CREDENTIALS.username) {
    return { isValid: false, message: 'Invalid username' };
  }
  if (password !== VALID_CREDENTIALS.password) {
    return { isValid: false, message: 'Incorrect password' };
  }
  return { isValid: true, message: 'Login successful' };
};