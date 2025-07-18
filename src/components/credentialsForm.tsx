"use client";

import {signIn} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useState} from "react";

export function CredentialsForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    const handleSubmit = async (e: { preventDefault: () => void; currentTarget: HTMLFormElement | undefined; }) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);

        if (loginAttempts >= 3) return;

        const signInResponse = await signIn("credentials", {
            email: data.get("email"),
            password: data.get("password"),
            redirect: false,
        });

        console.log(signInResponse);

        if (signInResponse && !signInResponse.error) {
            //****** Redirect to page
            router.push("/homepage");
        } else {
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);
            if (newAttempts >= 3) {
                setError(
                    "If you signed in with Google, please continue using Google to sign in. Thank you!"
                );
                setIsLocked(true);
            } else {
                setError("Your Email or Password is wrong!");
            }
        }
    };

    return (
        <form
            className="w-full mt-8 text-xl text-black font-semibold flex flex-col"
            onSubmit={handleSubmit}
        >
            {error && (
                <span className="p-4 mb-2 text-lg font-semibold text-white bg-red-500 rounded-md">
                      {error}
                </span>
            )}

            <input
                type="email"
                name="email"
                placeholder="Email"
                required
                disabled={isLocked}
                className="w-full px-4 py-4 mb-4 border border-gray-300 rounded-md"
            />

            <input
                type="password"
                name="password"
                placeholder="Password"
                required
                disabled={isLocked}
                className="w-full px-4 py-4 mb-4 border border-gray-300 rounded-md"
            />

            <button
                type="submit"
                disabled={isLocked}
                className="w-full h-12 px-6 mt-4 text-lg text-white transition-colors duration-150 bg-blue-600 rounded-lg focus:shadow-outline hover:bg-blue-700"
            >
                Log in
            </button>
        </form>
    );
}
