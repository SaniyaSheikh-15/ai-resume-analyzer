import jsPDF from "jspdf";

export const exportFeedbackToPdf = async (
    feedback: Feedback,
    interviewQuestions: InterviewQuestions | null,
    filename: string
) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const usableWidth = pageWidth - margin * 2;
    let y = margin;

    const lineHeight = 5;

    const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
            pdf.addPage();
            y = margin;
        }
    };

    const addTitle = (text: string) => {
        checkPageBreak(12);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(20);
        pdf.setTextColor(31, 41, 55); // #1f2937
        pdf.text(text, margin, y);
        y += 10;
    };

    const addSubtitle = (text: string) => {
        checkPageBreak(10);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(15);
        pdf.setTextColor(31, 41, 55);
        pdf.text(text, margin, y);
        y += 8;
    };

    const addCategoryHeader = (title: string, score: number) => {
        checkPageBreak(10);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.setTextColor(31, 41, 55);
        pdf.text(title, margin, y);
        pdf.text(`${score}/100`, pageWidth - margin, y, { align: "right" });
        y += 7;
    };

    const addTip = (t: { type: string; tip: string; explanation?: string }) => {
        const color = t.type === "good" ? [21, 128, 61] : [161, 98, 7]; // green / amber
        const bgColor = t.type === "good" ? [240, 253, 244] : [254, 252, 232];

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10.5);
        const tipLines = pdf.splitTextToSize(t.tip, usableWidth - 8);

        let explanationLines: string[] = [];
        if (t.explanation) {
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9.5);
            explanationLines = pdf.splitTextToSize(t.explanation, usableWidth - 8);
        }

        const boxHeight = 6 + tipLines.length * 5 + explanationLines.length * 4.5 + 4;
        checkPageBreak(boxHeight + 2);

        // background box
        pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        pdf.roundedRect(margin, y, usableWidth, boxHeight, 2, 2, "F");

        let textY = y + 5;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10.5);
        pdf.setTextColor(color[0], color[1], color[2]);
        tipLines.forEach((line: string) => {
            pdf.text(line, margin + 4, textY);
            textY += 5;
        });

        if (explanationLines.length > 0) {
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9.5);
            pdf.setTextColor(55, 65, 81); // gray-700
            explanationLines.forEach((line: string) => {
                pdf.text(line, margin + 4, textY);
                textY += 4.5;
            });
        }

        y += boxHeight + 3;
    };

    const addQuestion = (q: { question: string; whyAsked: string }) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10.5);
        const questionLines = pdf.splitTextToSize(q.question, usableWidth - 8);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.5);
        const whyLines = pdf.splitTextToSize(q.whyAsked, usableWidth - 8);

        const boxHeight = 6 + questionLines.length * 5 + whyLines.length * 4.5 + 4;
        checkPageBreak(boxHeight + 2);

        pdf.setFillColor(249, 250, 251); // gray-50
        pdf.setDrawColor(229, 231, 235); // gray-200
        pdf.roundedRect(margin, y, usableWidth, boxHeight, 2, 2, "FD");

        let textY = y + 5;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10.5);
        pdf.setTextColor(31, 41, 55);
        questionLines.forEach((line: string) => {
            pdf.text(line, margin + 4, textY);
            textY += 5;
        });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.5);
        pdf.setTextColor(107, 114, 128); // gray-500
        whyLines.forEach((line: string) => {
            pdf.text(line, margin + 4, textY);
            textY += 4.5;
        });

        y += boxHeight + 3;
    };

    // ---- Title ----
    addTitle("Resume Review Report");

    // ---- Overall score box ----
    checkPageBreak(20);
    pdf.setDrawColor(229, 231, 235);
    pdf.roundedRect(margin, y, usableWidth, 16, 2, 2, "D");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(31, 41, 55);
    pdf.text(`Overall Score: ${feedback.overallScore}/100`, margin + 4, y + 7);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(107, 114, 128);
    pdf.text("This score is calculated based on the categories below.", margin + 4, y + 12);
    y += 22;

    // ---- Categories ----
    const categories: [string, number, { type: string; tip: string; explanation?: string }[]][] = [
        ["ATS", feedback.ATS.score, feedback.ATS.tips],
        ["Tone & Style", feedback.toneAndStyle.score, feedback.toneAndStyle.tips],
        ["Content", feedback.content.score, feedback.content.tips],
        ["Structure", feedback.structure.score, feedback.structure.tips],
        ["Skills", feedback.skills.score, feedback.skills.tips],
    ];

    for (const [title, score, tips] of categories) {
        addCategoryHeader(title, score);
        for (const tip of tips) {
            addTip(tip);
        }
        y += 2;
    }

    // ---- Interview Questions ----
    if (interviewQuestions) {
        y += 2;
        addTitle("Interview Questions");

        const groups: [string, { question: string; whyAsked: string }[]][] = [
            ["Technical", interviewQuestions.technical],
            ["Behavioral", interviewQuestions.behavioral],
            ["Role-Specific", interviewQuestions.roleSpecific],
        ];

        for (const [title, items] of groups) {
            addSubtitle(title);
            for (const q of items) {
                addQuestion(q);
            }
            y += 2;
        }
    }

    pdf.save(filename);
};