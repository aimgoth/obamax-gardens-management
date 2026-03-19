import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';

export default function AssistantIndex({ sampleQuestions = [] }) {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: 'I am your Obamax Assistant. I answer from live app data and recent system updates. Ask me anything about revenue, workers, bookings, stock, or current status.',
            meta: null,
        },
    ]);

    const ask = async (q) => {
        const input = (q ?? question).trim();
        if (!input || loading) {
            return;
        }

        const userMessage = { role: 'user', text: input, meta: null };
        setMessages((prev) => [...prev, userMessage]);
        setQuestion('');
        setLoading(true);

        try {
            const response = await window.axios.post(route('assistant.ask'), { question: input });
            const payload = response.data;

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: payload.answer,
                    meta: `Scope: ${payload.scope} | Updated: ${payload.generated_at}`,
                },
            ]);
        } catch (error) {
            const message = error?.response?.data?.message || 'Assistant request failed. Please try again.';
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', text: message, meta: 'Error' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout title="Assistant">
            <Head title="Assistant" />

            <div className="mx-auto max-w-5xl">
                <div className="mb-6 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-green-50 to-lime-50 p-6">
                    <h2 className="text-2xl font-extrabold text-emerald-900">Obamax Intelligence Assistant</h2>
                    <p className="mt-1 text-sm text-emerald-700">
                        Live operational assistant for Bar, Restaurant, Hotel, workers, stock, and updates.
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="h-[460px] overflow-y-auto p-5">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={`${msg.role}-${index}`}
                                    className={`max-w-[90%] rounded-xl px-4 py-3 ${
                                        msg.role === 'user'
                                            ? 'ml-auto bg-emerald-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                                    {msg.meta && (
                                        <p
                                            className={`mt-2 text-xs ${
                                                msg.role === 'user' ? 'text-emerald-100' : 'text-gray-500'
                                            }`}
                                        >
                                            {msg.meta}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 p-4">
                        <div className="mb-3 flex flex-wrap gap-2">
                            {sampleQuestions.map((q) => (
                                <button
                                    key={q}
                                    type="button"
                                    onClick={() => ask(q)}
                                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                ask();
                            }}
                            className="flex gap-2"
                        >
                            <input
                                type="text"
                                value={question}
                                onChange={(event) => setQuestion(event.target.value)}
                                placeholder="Ask about today revenue, stock alerts, workers, bookings, latest updates..."
                                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none ring-emerald-300 focus:ring"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                            >
                                {loading ? 'Thinking...' : 'Ask'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
