import { useState, useEffect } from "react";
import { usePuterStore } from "~/lib/puter";
import { prepareInterviewInstructions } from "../constants";
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionItem,
} from "./Accordion";

const QuestionGroup = ({ items }: { items: InterviewQuestion[] }) => (
    <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1 rounded-2xl p-4 bg-gray-50 border border-gray-200">
                <p className="font-medium text-gray-800">{item.question}</p>
                <p className="text-sm text-gray-500">{item.whyAsked}</p>
            </div>
        ))}
    </div>
);

const InterviewQuestions = ({
                                imagePath,
                                jobTitle,
                                jobDescription,
                                resumeId,
                            }: {
    imagePath: string;
    jobTitle: string;
    jobDescription: string;
    resumeId: string;
}) => {
    const { ai, kv } = usePuterStore();
    const [questions, setQuestions] = useState<InterviewQuestions | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cacheKey = `interview:${resumeId}`;

    useEffect(() => {
        kv.get(cacheKey).then((cached) => {
            if (cached) setQuestions(JSON.parse(cached));
        });
    }, [cacheKey]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await ai.feedback(
                imagePath,
                prepareInterviewInstructions({ jobTitle, jobDescription })
            );

            if (!response) {
                setError("Failed to generate interview questions");
                setIsLoading(false);
                return;
            }

            const content =
                typeof response.message.content === "string"
                    ? response.message.content
                    : response.message.content[0].text;

            const parsed = JSON.parse(content) as InterviewQuestions;
            setQuestions(parsed);
            await kv.set(cacheKey, JSON.stringify(parsed));
        } catch (err) {
            console.error("Interview question generation error:", err);
            setError("Something went wrong generating questions.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-md w-full p-6 flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
                <h2 className="text-2xl font-bold">Interview Questions</h2>
                <button
                    className="primary-button w-fit px-4 py-2 text-sm"
                    onClick={handleGenerate}
                    disabled={isLoading}
                >
                    {isLoading ? "Generating..." : questions ? "Regenerate" : "Generate Questions"}
                </button>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            {!questions && !isLoading && (
                <p className="text-gray-500 text-sm">
                    Generate likely interview questions based on this resume and job description.
                </p>
            )}

            {questions && (
                <Accordion allowMultiple>
                    <AccordionItem id="technical">
                        <AccordionHeader itemId="technical">
                            <p className="text-xl font-semibold">Technical Questions</p>
                        </AccordionHeader>
                        <AccordionContent itemId="technical">
                            <QuestionGroup items={questions.technical} />
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem id="behavioral">
                        <AccordionHeader itemId="behavioral">
                            <p className="text-xl font-semibold">Behavioral Questions</p>
                        </AccordionHeader>
                        <AccordionContent itemId="behavioral">
                            <QuestionGroup items={questions.behavioral} />
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem id="roleSpecific">
                        <AccordionHeader itemId="roleSpecific">
                            <p className="text-xl font-semibold">Role-Specific Questions</p>
                        </AccordionHeader>
                        <AccordionContent itemId="roleSpecific">
                            <QuestionGroup items={questions.roleSpecific} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
        </div>
    );
};

export default InterviewQuestions;