import { useState, useEffect } from "react";
import { usePuterStore } from "~/lib/puter";

const ResumeQA = ({
                      imagePath,
                      feedback,
                      resumeId,
                  }: {
    imagePath: string;
    feedback: Feedback;
    resumeId: string;
}) => {
    const { ai, kv } = usePuterStore();
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const cacheKey = `qa:${resumeId}`;

    useEffect(() => {
        kv.get(cacheKey).then((cached) => {
            if (cached) setMessages(JSON.parse(cached));
        });
    }, [cacheKey]);

    const handleAsk = async () => {
        if (!input.trim()) return;
        const question = input.trim();
        setInput("");

        const newMessages = [...messages, { role: "user" as const, content: question }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const systemContext = `You are a helpful resume coach. The user has uploaded a resume (attached image) and received this feedback already: ${JSON.stringify(feedback)}. Answer the user's question about their resume concisely and helpfully, referring to the resume image when relevant.`;

            const chatMessages: ChatMessage[] = [
                {
                    role: "user",
                    content: [
                        { type: "file", puter_path: imagePath },
                        { type: "text", text: `${systemContext}\n\nConversation so far:\n${newMessages.map(m => `${m.role}: ${m.content}`).join("\n")}\n\nRespond only to the latest user question.` },
                    ],
                },
            ];

            const response = await ai.chat(chatMessages, { model: "gpt-4.1-mini" });

            if (!response) {
                setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong." }]);
                return;
            }

            const content =
                typeof response.message.content === "string"
                    ? response.message.content
                    : response.message.content[0].text;

            const updated = [...newMessages, { role: "assistant" as const, content }];
            setMessages(updated);
            await kv.set(cacheKey, JSON.stringify(updated));
        } catch (err) {
            console.error("Resume Q&A error:", err);
            setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-md w-full p-6 flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Ask About Your Resume</h2>

            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                {messages.length === 0 && (
                    <p className="text-gray-500 text-sm">
                        Ask anything — e.g. "What's my strongest section?" or "How should I phrase my Amazon project?"
                    </p>
                )}
                {messages.map((m, idx) => (
                    <div
                        key={idx}
                        className={`rounded-2xl p-3 text-sm max-w-[85%] ${
                            m.role === "user"
                                ? "bg-blue-50 self-end text-right"
                                : "bg-gray-50 self-start"
                        }`}
                    >
                        {m.content}
                    </div>
                ))}
                {isLoading && <p className="text-gray-400 text-sm">Thinking...</p>}
            </div>

            <div className="flex flex-row gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !isLoading && handleAsk()}
                    placeholder="Ask a question about your resume..."
                    className="flex-1"
                />
                <button className="primary-button w-fit px-6" onClick={handleAsk} disabled={isLoading}>
                    Ask
                </button>
            </div>
        </div>
    );
};

export default ResumeQA;