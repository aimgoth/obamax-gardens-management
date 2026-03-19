import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />
            <div className="px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Email</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Thanks for signing up! Please verify your email by clicking the link we sent.
                </p>
                {status === 'verification-link-sent' && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
                        A new verification link has been sent to your email.
                    </div>
                )}
                <form onSubmit={submit}>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                        {processing ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link href={route('logout')} method="post" as="button" className="text-sm text-gray-500 hover:text-gray-700">
                        Logout
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
