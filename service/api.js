// Dynamically set the BASE_URL based on the environment
const BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://192.168.1.6:5000/api/users' // Use your laptop's IP for physical device testing
    : 'http://localhost:5000/api/users'; // Use localhost for development on the same machine

// Function to register a user
export const registerUser = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};
