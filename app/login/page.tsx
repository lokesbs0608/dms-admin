"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const loginRoutes = [
    { id: 1, route: "/auth/login" },
    { id: 2, route: "/customer/login" },
    { id: 3, route: "/loader/login" },
];

const LoginForm: React.FC = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [repeatPassword, setRepeatPassword] = useState<string>("");
    const [loginOption, setLoginOption] = useState<number>(1);
    const [terms, setTerms] = useState<boolean>(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox" && name === "terms") {
            setTerms(e.target.checked); // Handling checkbox specifically
        } else if (name === "email" || name === "password") {
            setFormData((prev) => ({ ...prev, [name]: value }));
        } else if (name === "repeatPassword") {
            setRepeatPassword(value);
        } else if (name === "loginOption") {
            setLoginOption(+value);
        }
    };

    // Function to get route by id
    const getRouteById = (id: number): string => {
        const routeObj = loginRoutes.find((route) => route.id === id) || {
            id: 1,
            route: "/auth/login",
        };
        return routeObj?.route;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== repeatPassword) {
            alert("Passwords do not match");
            return;
        }
        if (!terms) {
            alert("You must agree to the terms and conditions");
            return;
        }

        try {
            const resp = await login(getRouteById(loginOption), formData);
            console.log(resp);
        } catch (error) {
            console.log(error);
        }

        // Handle form submission logic here
        console.log("Form submitted", { ...formData, loginOption });
    };

    return (
        <form
            className="max-w-sm mx-auto container h-screen flex justify-center flex-col"
            onSubmit={handleSubmit}
        >
            <div className="font-bold text-3xl text-center text-[#1d4ed8]">
                Speedo One Express
            </div>
            <Image
                src={"/logo.png"}
                width={100}
                height={100}
                alt="speedo one express"
                className="w-100 aspect-square m-3 mx-auto"
            />
            <div className="mb-5">
                <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                    User Name
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                    placeholder="name@flowbite.com"
                    required
                />
            </div>
            <div className="mb-5">
                <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                    required
                />
            </div>
            <div className="mb-5">
                <label
                    htmlFor="repeat-password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                    Repeat password
                </label>
                <input
                    type="password"
                    id="repeat-password"
                    name="repeatPassword"
                    value={repeatPassword}
                    onChange={handleChange}
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                    required
                />
            </div>
            <div className="mb-5">
                <label
                    htmlFor="countries"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                    Select an Login Type
                </label>
                <select
                    name="loginOption"
                    onChange={handleChange}
                    id="countries"
                    value={loginOption}
                    defaultValue={1}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                    <option value="">Choose a Login</option>
                    <option value={1}>Employee</option>
                    <option value={2}>Customer</option>
                    <option value={3}>Loader</option>
                </select>
            </div>
            <div className="flex items-start mb-5">
                <div className="flex items-center h-5">
                    <input
                        id="terms"
                        type="checkbox"
                        name="terms"
                        checked={terms}
                        onChange={handleChange}
                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                        required
                    />
                </div>
                <label
                    htmlFor="terms"
                    className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                    I agree with the{" "}
                    <a
                        href="#"
                        className="text-blue-600 hover:underline dark:text-blue-500"
                    >
                        terms and conditions
                    </a>
                </label>
            </div>
            <button
                type="submit"
                className="text-white bg-blue-700 w-full hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
                Login
            </button>
        </form>
    );
};

export default LoginForm;
