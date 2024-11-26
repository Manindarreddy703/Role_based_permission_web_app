import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google"; // Import new Google Login

const Register = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/register",
        formData
      );
      const { token } = response.data;

      // Store the token (localStorage or sessionStorage)
      localStorage.setItem("token", token);

      alert("Registration successful!");
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
      });
      setErrorMessage(""); // Clear any error messages
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMessage(error.response.data.message || "Registration failed");
    }
  };

  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse; // Extract credential

    try {
      const res = await axios.post(
        "http://localhost:5000/api/google-register",
        { idToken: credential }
      );
      const { token } = res.data;

      localStorage.setItem("token", token);
      alert("Google registration successful!");
    } catch (error) {
      console.error("Error during Google registration:", error);
      setErrorMessage("Google registration failed");
    }
  };

  // Handle Google login failure
  const handleGoogleFailure = () => {
    setErrorMessage("Google login failed");
  };

  return (
    <div className="bg-white w-screen font-sans text-gray-900">
      <div className="mx-auto w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <h1 className="mb-4 text-center text-xl font-black leading-4 sm:text-2xl xl:text-3xl">
          Sign up
        </h1>
      </div>
      <div className="md:w-2/3 mx-auto w-full pb-16 lg:w-1/3">
        <form
          className="shadow-lg mb-4 rounded-lg py-10 px-8"
          onSubmit={handleSubmit}
        >
          {/* Existing input fields */}
          <div className="mb-4">
            <label htmlFor="firstname" className="block text-sm font-bold">
              Firstname
            </label>
            <input
              id="firstname"
              type="text"
              placeholder="Firstname"
              required
              value={formData.firstname}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="lastname" className="block text-sm font-bold">
              Lastname
            </label>
            <input
              id="lastname"
              type="text"
              placeholder="Lastname"
              required
              value={formData.lastname}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-bold">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-bold">
              Role
            </label>
            <select
              id="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="" disabled>
                Select role
              </option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-bold">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-bold"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Create account
            </button>
          </div>
          <div className="text-center mt-4">
            <p className="text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 underline">
                Log in
              </Link>
            </p>
          </div>
        </form>

        {/* Google Login Button */}
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleFailure}
          text="Sign up with Google"
          className="mt-4"
        />
      </div>
    </div>
  );
};

export default Register;
