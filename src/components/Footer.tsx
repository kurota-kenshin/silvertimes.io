export default function Footer() {
  return (
    <footer className="bg-silver-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">SilverTimes</h3>
            <p className="text-silver-200">
              Yield-bearing silver tokens backed by real assets.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-silver-200">
              <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Staking</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Redemption</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Audits</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-silver-200">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Team</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-silver-200">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-silver-600 pt-8 text-center text-silver-300">
          <p>&copy; 2025 SilverTimes. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Backed by a Hong Kong publicly listed company. Regular audits ensure asset backing.
          </p>
        </div>
      </div>
    </footer>
  )
}
