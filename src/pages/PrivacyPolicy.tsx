import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logo from '../assets/logo_home.png';
import { effectiveDate, publishedBy, privacyPolicySections } from '../content/privacyPolicy';

// Public page — intentionally not wrapped in ProtectedRoute/AuthRoute so it
// has a stable URL that works whether or not the visitor is logged in
// (required for Google OAuth consent screens, app store listings, etc.).
const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-sky-200">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center text-sky-700 hover:underline text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Hobby Sphere
        </Link>

        <div className="bg-white/90 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img src={logo} alt="Hobby Sphere Logo" className="w-16 h-16 mx-auto mb-3" />
            <h1 className="text-3xl font-bold text-gray-800">HobbySphere Privacy Policy</h1>
            <p className="text-gray-500 text-sm mt-1">
              Effective: {effectiveDate} · Published by: {publishedBy}
            </p>
          </div>

          <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
            {privacyPolicySections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-semibold text-gray-800 mb-1">{section.heading}</h2>
                <p>{section.body}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-500 text-xs mt-8 pt-6 border-t border-gray-200">
            For information on how we protect minors on HobbySphere, see our{' '}
            <Link to="/child-safety" className="text-sky-600 hover:underline">
              Child Safety Standards
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
