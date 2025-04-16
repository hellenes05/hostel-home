'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="text-xl font-bold text-gray-800">HostelHome</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/properties" className="text-gray-600 hover:text-indigo-600 transition duration-300">
              Properties
            </Link>
            <Link href="/hostels" className="text-gray-600 hover:text-indigo-600 transition duration-300">
              Hostels
            </Link>
            <Link href="/hotels" className="text-gray-600 hover:text-indigo-600 transition duration-300">
              Hotels
            </Link>
            <Link href="/homes" className="text-gray-600 hover:text-indigo-600 transition duration-300">
              Homes
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-indigo-600 transition duration-300">
              About
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-indigo-600 transition duration-300">
              Login
            </Link>
            <Link 
              href="/auth/register" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/properties" 
                className="text-gray-600 hover:text-indigo-600 transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Properties
              </Link>
              <Link 
                href="/hostels" 
                className="text-gray-600 hover:text-indigo-600 transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Hostels
              </Link>
              <Link 
                href="/hotels" 
                className="text-gray-600 hover:text-indigo-600 transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Hotels
              </Link>
              <Link 
                href="/homes" 
                className="text-gray-600 hover:text-indigo-600 transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Homes
              </Link>
              <Link 
                href="/about" 
                className="text-gray-600 hover:text-indigo-600 transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 border-t border-gray-200 flex flex-col space-y-4">
                <Link 
                  href="/auth/login" 
                  className="text-gray-600 hover:text-indigo-600 transition duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/auth/register" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;