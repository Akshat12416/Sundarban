export default function Footer() {
  return (
    <footer className="mt-12 bg-[#111111]">
      <div className="mx-auto flex max-w-7xl items-center px-6 py-8">
        <p className="text-sm text-white/80">© {new Date().getFullYear()} Sundarban</p>
      </div>
    </footer>
  );
}
