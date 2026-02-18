
import React from 'react';
import { Mail, Phone, MapPin, Twitter, Linkedin, Github, Youtube, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Large Company Name Watermark Section */}
      <div className="relative bg-slate-900">
        <div className="container mx-auto px-4 pt-12 pb-16">


          {/* Giant Company Name */}
          <div className="relative text-center">
            <h2 className="text-[8rem] md:text-[12rem] lg:text-[16rem] xl:text-[20rem] font-light tracking-tight leading-none select-none">
              <span
                className="bg-gradient-to-r from-slate-500/60 via-purple-400/50 to-slate-500/60 bg-clip-text text-transparent"
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                <span className="italic font-light">Lumi</span>
                <span className="font-normal">coria</span>
              </span>
            </h2>
          </div>
        </div>
      </div>

      {/* Footer Links Section */}
      <div className="bg-slate-900 text-gray-300">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="inline-block mb-6">
                <span className="text-2xl font-light text-white">
                  <span className="italic">Lumi</span>
                  <span className="font-medium">coria</span>
                  <span className="text-purple-400">.ai</span>
                </span>
              </Link>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                AI-powered document intelligence and well-being for professionals, students, and teams.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <Twitter size={20} className="text-gray-400 hover:text-white" />
                </a>
                <a href="#" className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <Linkedin size={20} className="text-gray-400 hover:text-white" />
                </a>
                <a href="#" className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <Github size={20} className="text-gray-400 hover:text-white" />
                </a>
                <a href="#" className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <Youtube size={20} className="text-gray-400 hover:text-white" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link to="/agents" className="text-sm text-gray-400 hover:text-white transition-colors">AI Agents</Link></li>
                <li><Link to="/chat" className="text-sm text-gray-400 hover:text-white transition-colors">Chat</Link></li>
                <li><Link to="/models" className="text-sm text-gray-400 hover:text-white transition-colors">Models</Link></li>
                <li><Link to="/documents" className="text-sm text-gray-400 hover:text-white transition-colors">Documents</Link></li>
                <li><Link to="/billing" className="text-sm text-gray-400 hover:text-white transition-colors">Billing</Link></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><Link to="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/wellbeing" className="text-sm text-gray-400 hover:text-white transition-colors">Well-being</Link></li>
                <li><Link to="/live-studio" className="text-sm text-gray-400 hover:text-white transition-colors">Live Studio</Link></li>
                <li><Link to="/agent-builder" className="text-sm text-gray-400 hover:text-white transition-colors">Agent Builder</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              © {new Date().getFullYear()} Lumicoria.ai. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-500 hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="text-gray-500 hover:text-white transition-colors">Terms</Link>
              <Link to="/contact" className="text-gray-500 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
