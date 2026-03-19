import { Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

export default function GuestLayout({ children }) {
    const logoUrl = document.querySelector('meta[name="logo-url"]')?.content || '/logo.png';
    const [assistantOpen, setAssistantOpen] = useState(false);
    const [assistantLoading, setAssistantLoading] = useState(false);
    const [assistantQuestion, setAssistantQuestion] = useState('');
    const [assistantMessages, setAssistantMessages] = useState([
        {
            role: 'assistant',
            text: 'I am your Obamax assistant. Ask about revenue, stock, workers, bookings, updates, or how to use any module.',
            meta: null,
        },
    ]);
    const assistantRef = useRef(null);

    const assistantQuickPrompts = [
        'How to use this software?',
        'Today total revenue?',
        'Any low stock drinks?',
        'Latest updates now?',
    ];

    useEffect(() => {
        const handler = (e) => {
            if (assistantOpen && assistantRef.current && !assistantRef.current.contains(e.target)) {
                setAssistantOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [assistantOpen]);

    const askAssistant = async (rawQuestion) => {
        const q = (rawQuestion ?? assistantQuestion).trim();
        if (!q || assistantLoading) return;

        setAssistantMessages((prev) => [...prev, { role: 'user', text: q, meta: null }]);
        setAssistantQuestion('');
        setAssistantLoading(true);

        try {
            const response = await window.axios.post(route('assistant.ask'), { question: q });
            const payload = response.data;

            setAssistantMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: payload.answer,
                    meta: `Scope: ${payload.scope} | Updated: ${payload.generated_at}`,
                },
            ]);
        } catch (error) {
            const message = error?.response?.data?.message || 'Assistant request failed. Please try again.';
            setAssistantMessages((prev) => [
                ...prev,
                { role: 'assistant', text: message, meta: 'Error' },
            ]);
        } finally {
            setAssistantLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
            <div className="mb-6 flex flex-col items-center">
                <Link href="/">
                    <div className="flex items-center space-x-3">
                        <img
                            src={logoUrl}
                            alt="Obamax Gardens"
                            className="w-14 h-14 rounded-full object-cover shadow-lg"
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-green-800">Obamax Gardens</h1>
                            <p className="text-xs text-gray-500">Restaurant • Hotel • Bar</p>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="w-full max-w-md bg-white shadow-md rounded-xl overflow-hidden">
                {children}
            </div>
        </div>
    );
}
