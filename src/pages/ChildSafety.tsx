import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logo from '../assets/logo_home.png';
import { effectiveDate, publishedBy, childSafetySections } from '../content/childSafety';

// Public page — intentionally not wrapped in ProtectedRoute/AuthRoute so it
// has a stable URL that works whether or not the visitor is logged in
// (required for app store review / CSAE standards disclosure).
const ChildSafety: React.FC = () => {
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
            <h1 className="text-3xl font-bold text-gray-800">Child Safety Standards</h1>
            <p className="text-gray-500 text-sm mt-1">
              Effective: {effectiveDate} · Published by: {publishedBy}
            </p>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed mb-6">
            HobbySphere ("we", "our", "us"), operated by CrowdSphere Ltd, is committed to
            protecting children from sexual abuse and exploitation (CSAE) on our platform. We
            have zero tolerance for child sexual abuse material (CSAM) or any behavior that
            endangers the safety of minors.
          </p>

          <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
            {childSafetySections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-semibold text-gray-800 mb-1">{section.heading}</h2>
                <p>{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildSafety;
