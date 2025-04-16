import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Home = () => {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Find Your Perfect Stay
              </h1>
              <p className="text-xl mb-8">
                Discover and book hostels, hotels, and homes for short-term stays or long-term leasing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/properties" 
                  className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
                >
                  Browse Properties
                </Link>
                <Link 
                  href="/auth/register" 
                  className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-700 transition duration-300"
                >
                  Sign Up
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-xl">
                {/* Replace with your actual image */}
                <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600">Property Image</span>
                  {/* Uncomment when you have an actual image */}
                  {/* <Image 
                    src="/images/hero-property.jpg" 
                    alt="Featured Property" 
                    fill
                    className="object-cover"
                  /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Find by Property Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Hostels', 'Hotels & Motels', 'Homes for Lease'].map((category) => (
              <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <div className="h-48 bg-gray-200 relative">
                  {/* Category image placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-600">{category} Image</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{category}</h3>
                  <p className="text-gray-600 mb-4">
                    {category === 'Hostels' 
                      ? 'Student accommodations with shared facilities.'
                      : category === 'Hotels & Motels'
                      ? 'Short-term stays with premium amenities.'
                      : 'Long-term residential properties for leasing.'}
                  </p>
                  <Link 
                    href={`/properties?type=${category.toLowerCase()}`}
                    className="text-indigo-600 font-medium hover:text-indigo-800"
                  >
                    Browse {category} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <div className="h-48 bg-gray-200 relative">
                  {/* Property image placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-600">Property {item} Image</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">Property Name {item}</h3>
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                      {item === 1 ? 'Hostel' : item === 2 ? 'Hotel' : 'Home'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at velit maximus.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-indigo-600">
                      ${(item * 50) + 50}/night
                    </span>
                    <Link 
                      href={`/properties/${item}`}
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-300"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link 
              href="/properties"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
            >
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              {
                title: 'Search',
                description: 'Browse our extensive catalog of properties based on your preferences.',
                icon: '🔍'
              },
              {
                title: 'Book',
                description: 'Reserve your stay with our secure booking system and payment options.',
                icon: '📅'
              },
              {
                title: 'Stay',
                description: 'Enjoy your comfortable stay with our customer support available 24/7.',
                icon: '🏠'
              }
            ].map((step, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-700 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Perfect Stay?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found their ideal accommodations through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/properties" 
              className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
            >
              Browse Properties
            </Link>
            <Link 
              href="/contact" 
              className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-700 transition duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;


