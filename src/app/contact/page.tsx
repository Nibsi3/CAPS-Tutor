export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-headline mb-4 text-4xl font-bold">Contact us</h1>
      <p className="text-muted-foreground mb-6">We'd love to hear from you. Send us a message and we'll get back within 1–2 working days.</p>
      <form action="https://formspree.io/f/xbldbkry" method="POST" className="space-y-4">
        <input name="name" required placeholder="Your name" className="w-full rounded-md border bg-background px-3 py-2" />
        <input type="email" name="email" required placeholder="Your email" className="w-full rounded-md border bg-background px-3 py-2" />
        <textarea name="message" required placeholder="How can we help?" rows={6} className="w-full rounded-md border bg-background px-3 py-2" />
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Send</button>
      </form>
    </main>
  );
}


