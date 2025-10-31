export function Footer() {
  return (
    <footer className="border-t bg-background/80">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <div className="mb-2 font-headline text-lg font-semibold">CAPS Tutor</div>
          <p className="text-muted-foreground text-sm">AI tutor aligned to South Africa’s CAPS curriculum for Grades 8–12.</p>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold">Product</div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><a className="hover:text-primary" href="/caps-syllabus">CAPS Syllabus</a></li>
            <li><a className="hover:text-primary" href="/blog">Blog</a></li>
            <li><a className="hover:text-primary" href="/contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold">Legal</div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><a className="hover:text-primary" href="#">Privacy</a></li>
            <li><a className="hover:text-primary" href="#">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} CAPS Tutor</span>
          <span>Made for South African learners</span>
        </div>
      </div>
    </footer>
  );
}


