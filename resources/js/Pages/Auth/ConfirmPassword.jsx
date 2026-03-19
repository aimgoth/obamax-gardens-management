import { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

    useEffect(() => {
        return () => reset('password');
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'));
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />
            <div className="px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm Password</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Please confirm your password before continuing.
                </p>
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            onChange={(e) => setData('password', e.target.value)}
                            autoFocus
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                        {processing ? 'Confirming...' : 'Confirm'}
                    </button>
                </form>
            </div>
        </GuestLayout>
    );
}
