import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../providers/UserProvider';
import { jwtDecode } from "jwt-decode";

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { updateUserId } = useUser();

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const loginResponse = await axios.post('http://68.66.251.150/auth/login', {
                email: email,
                password: password
            });

            if (loginResponse.status === 200) {
                const token = loginResponse.data.data.access_token;
                const decoded = jwtDecode(token);
                const userId = decoded.id;
                localStorage.setItem('userId', userId); // Save to local storage

                updateUserId(userId);
                navigate('/categories');
            }
        } catch (error) {
            console.error('Login or fetching user error:', error);
        }
    };



    return (
        <section className="bg-purple-900 h-screen">
            <div className="px-0 py-20 m-auto max-w-7xl sm:px-4">
                <div className="w-full px-4 pt-5 pb-6 m-auto mt-8 mb-6 bg-white rounded-none shadow-xl sm:rounded-lg sm:w-10/12 md:w-8/12 lg:w-6/12 xl:w-4/12 sm:px-6">
                    <h1 className="mb-4 text-lg font-semibold text-left text-gray-900">Log in to your account</h1>
                    <form className="mb-8 space-y-4" onSubmit={handleSubmit}>
                        <label className="block">
                            <span className="block mb-1 text-xs font-medium text-gray-700">Your Email</span>
                            <input
                                className="form-input"
                                type="email"
                                placeholder="Ex. james@bond.com"
                                inputMode="email"
                                required
                                value={email}
                                onChange={handleEmailChange}
                            />
                        </label>
                        <label className="block">
                            <span className="block mb-1 text-xs font-medium text-gray-700">Your Password</span>
                            <input
                                className="form-input"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={handlePasswordChange}
                            />
                        </label>
                        <input type="submit" className="w-full py-3 mt-1 btn btn-primary" value="Login" />
                    </form>
                </div>
            </div>
        </section>
    );
}
