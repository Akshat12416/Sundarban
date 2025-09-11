export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left */}
        <p className="text-gray-300 text-sm">
          © {new Date().getFullYear()} CarbonChain. All rights reserved.
        </p>

        {/* Center Links */}
        <div className="flex gap-6 text-gray-300 text-sm">
          <a href="/about" className="hover:text-green-400 transition">
            About
          </a>
          <a href="/contact" className="hover:text-green-400 transition">
            Contact
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-green-400 transition">
            GitHub
          </a>
        </div>

        {/* Right */}
        <div className="flex gap-4">
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-green-400 transition">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-green-400 transition">
            <i className="fab fa-linkedin"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
