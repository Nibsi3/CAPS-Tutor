'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is CAPS Tutor free to use?",
    answer: "Yes! CAPS Tutor is completely free to use. We believe in making quality education accessible to all South African students. You can access all subjects, lessons, practice questions, and AI tutoring features without any cost."
  },
  {
    question: "What subjects are available on CAPS Tutor?",
    answer: "We cover all major subjects for Grades 10-12 aligned with the CAPS curriculum, including Mathematics, Physical Sciences, Life Sciences, Accounting, Business Studies, Economics, Geography, History, Information Technology, Computer Applications Technology (CAT), and language subjects (English and Afrikaans)."
  },
  {
    question: "How does the AI tutoring work?",
    answer: "Our AI tutor uses advanced machine learning to understand the CAPS curriculum and provide personalized help. Simply ask a question about any topic, and the AI will provide step-by-step explanations, examples, and guidance tailored to your grade level. The AI understands context and can help with homework, exam preparation, and concept clarification."
  },
  {
    question: "Is the content aligned with the CAPS syllabus?",
    answer: "Absolutely! Every lesson, practice question, and learning resource is meticulously mapped to the official CAPS (Curriculum and Assessment Policy Statement) documents. Our content follows the term-by-term structure of the CAPS syllabus, ensuring students learn exactly what they need for their exams."
  },
  {
    question: "Can I track my progress?",
    answer: "Yes! CAPS Tutor provides comprehensive progress tracking. You can see your performance by subject, topic, and grade level. The platform tracks your strengths and weaknesses, time spent learning, and historical performance trends to help you identify areas that need more practice."
  },
  {
    question: "How do the adaptive practice questions work?",
    answer: "Our adaptive learning system analyzes your performance and identifies topics where you need more practice. Based on this analysis, it automatically generates custom practice quizzes that focus on your weak areas. As you improve, the system adapts to challenge you appropriately and help you master all topics."
  },
  {
    question: "Do I need to create an account?",
    answer: "Yes, creating a free account is required to track your progress, save your practice history, and access personalized features. Registration is quick and easy - you can sign up with your email address or use social login options."
  },
  {
    question: "Is CAPS Tutor suitable for exam preparation?",
    answer: "Definitely! CAPS Tutor is designed specifically for exam preparation. All content is aligned with CAPS exam requirements, and our practice questions follow the format and difficulty level of actual exams. The AI tutor can also help you prepare for specific exams by focusing on exam-relevant topics."
  },
  {
    question: "Can I use CAPS Tutor on my phone or tablet?",
    answer: "Yes! CAPS Tutor is fully responsive and works on all devices including smartphones, tablets, and computers. You can study on the go and access all features from any device with an internet connection."
  },
  {
    question: "How accurate is the AI tutor's information?",
    answer: "Our AI tutor is trained specifically on the CAPS curriculum and verified by education experts. It provides accurate, curriculum-aligned explanations. However, if you notice any discrepancies, please contact us so we can improve the system."
  }
];

export function FAQSection() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">
            Frequently Asked Questions
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
            Got Questions? We've Got Answers
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Everything you need to know about CAPS Tutor, from pricing to features to how it all works.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-7">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Still have questions?{' '}
            <a href="/contact" className="text-primary hover:underline font-medium">
              Contact us
            </a>{' '}
            and we'll be happy to help!
          </p>
        </div>
      </div>
    </section>
  );
}

