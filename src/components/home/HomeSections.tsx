import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { GraduationCap, Newspaper, FileText, Mail, CheckCircle, ExternalLink } from "lucide-react";
import { blogPosts } from "@/lib/blog-posts";

export function CapsSyllabusSection() {
  const features = [
    "100% Curriculum Alignment",
    "Grade-Specific Content",
    "Subject-Specific Expertise",
    "Structured Learning Paths"
  ];

  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">
            Curriculum Focus
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
            Perfectly Aligned with CAPS Syllabus
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Every lesson, quiz, and practice question is meticulously mapped to the latest CAPS documents, ensuring students learn exactly what they need to for their exams.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{feature}</h3>
                  <p className="mt-1 text-muted-foreground">
                    {index === 0 && "Every lesson, quiz, and practice question is meticulously mapped to the latest CAPS documents."}
                    {index === 1 && "Content is tailored for each grade, providing age-appropriate language and examples."}
                    {index === 2 && "Our AI understands the unique concepts and methodologies required for each subject."}
                    {index === 3 && "The platform follows the term-by-term structure of the CAPS syllabus."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-x-6">
          <Button asChild size="lg" variant="outline">
            <Link href="/caps-syllabus">
              Learn More About CAPS Alignment
              <GraduationCap className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function NewsSection() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">
            Stay Informed
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
            Educational News
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Stay updated with the latest school and university news from across South Africa
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <Newspaper className="h-16 w-16 text-primary opacity-50" />
                </div>
                <CardHeader>
                  <Badge variant="secondary" className="mb-2">School News</Badge>
                  <CardTitle className="text-lg line-clamp-2">
                    Latest Updates on Education in South Africa
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    Get the latest news and updates about schools, universities, and education policy across all nine provinces.
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-x-6">
          <Button asChild size="lg" variant="outline">
            <Link href="/news">
              Read More News
              <ExternalLink className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function BlogSection() {
  // Defensive check: ensure blogPosts is defined and is an array
  const recentPosts = (Array.isArray(blogPosts) ? blogPosts : []).filter(post => !post.comingSoon).slice(0, 3);

  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">
            Insights
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
            From the CAPS Tutor Blog
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Insights on AI in education, learning strategies, and the future of the South African classroom.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <Badge variant="outline" className="mb-2 w-fit">{post.category}</Badge>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {post.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{post.author.name}</span>
                      <span>{post.date}</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-x-6">
          <Button asChild size="lg" variant="outline">
            <Link href="/blog">
              View All Posts
              <FileText className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">
            Get in Touch
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
            We'd Love to Hear From You
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Have questions about features, pricing, or anything else? Our team is ready to answer all your questions.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <div className="rounded-2xl bg-card border-2 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-primary/10 p-4">
                <Mail className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>Email: hello@capstutor.ai</p>
              <p>Phone: +27 (21) 555-0123</p>
              <p>Address: 123 Learning Lane, Cape Town, South Africa</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link href="/contact">
              Send Us a Message
              <Mail className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Re-export new sections
export { CompetitiveAdvantagesSection } from './CompetitiveAdvantagesSection';
export { FAQSection } from './FAQSection';
export { StudyResourcesSection } from './StudyResourcesSection';

