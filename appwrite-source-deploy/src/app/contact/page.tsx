
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="flex-1">
        <div className="relative isolate bg-background">
          <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
            <div className="relative px-6 pb-20 pt-24 sm:pt-32 lg:static lg:px-8 lg:py-48">
              <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
                 <div
                    className="absolute inset-y-0 left-0 -z-10 w-full overflow-hidden bg-muted/20 ring-1 ring-foreground/5 lg:w-1/2"
                    >
                    <div
                        className="absolute -left-56 top-[calc(100%-13rem)] transform-gpu blur-3xl sm:left-[calc(50%-15rem)] sm:top-[calc(100%-48rem)] lg:left-[calc(50%-28rem)] lg:top-[-10rem] xl:left-[calc(50%-24rem)]"
                        aria-hidden="true"
                    >
                        <div
                        className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-primary to-purple-500 opacity-20"
                        style={{
                            clipPath:
                            'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64.3%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
                        }}
                        />
                    </div>
                </div>
                <h1 className="text-4xl font-bold tracking-tight font-headline">Get in touch</h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  We’d love to hear from you. Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.
                </p>
                <div className="mt-10 space-y-4 text-base leading-7 text-muted-foreground">
                  <div className="flex gap-x-4">
                    <div className="flex-none">
                      <span className="sr-only">Address</span>
                      <Building className="h-7 w-6 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div>
                      123 Learning Lane, Knowledge Park
                      <br />
                      Cape Town, 8001, South Africa
                    </div>
                  </div>
                  <div className="flex gap-x-4">
                    <div className="flex-none">
                      <span className="sr-only">Telephone</span>
                      <Phone className="h-7 w-6 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div>
                      <a className="hover:text-foreground" href="tel:+27 (21) 555-0123">
                        +27 (21) 555-0123
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-x-4">
                    <div className="flex-none">
                      <span className="sr-only">Email</span>
                      <Mail className="h-7 w-6 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div>
                      <a className="hover:text-foreground" href="mailto:hello@capstutor.ai">
                        hello@capstutor.ai
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <form action="#" method="POST" className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48">
              <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="first-name" className="text-base">First name</Label>
                    <div className="mt-2.5">
                      <Input
                        type="text"
                        name="first-name"
                        id="first-name"
                        autoComplete="given-name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="last-name" className="text-base">Last name</Label>
                    <div className="mt-2.5">
                      <Input
                        type="text"
                        name="last-name"
                        id="last-name"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="email" className="text-base">Email</Label>
                    <div className="mt-2.5">
                      <Input
                        type="email"
                        name="email"
                        id="email"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="message" className="text-base">Message</Label>
                    <div className="mt-2.5">
                      <Textarea
                        name="message"
                        id="message"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <Button type="submit">
                    Send message
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
    </main>
  );
}
