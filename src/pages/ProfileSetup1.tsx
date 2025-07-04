import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  MapPinIcon,
  CameraIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import BioSection from '../components/profile-setup/BioSection';
import ProfilePictureUpload from '../components/profile-setup/ProfilePictureUpload';
import LocationSelector from '../components/profile-setup/LocationSelector';
import HobbySelector from '../components/profile-setup/HobbySelector';



const ProfileSetup: React.FC = () => {
    const navigate = useNavigate();
    const { register: registerUser, loading } = useAuth();
    const { pendingRegistration } = useAuth();
    const [profileData, setProfileData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        bio: '',
        profilePicture: null as File | null,
        location: '',
        mainHobby: '',
        customHobby: '',
    });



    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const updateProfileData = (field: string, value: any) => {
        setProfileData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the data to your backend API

        console.log('Profile data submitted:', profileData);

        // Navigate to the next page (e.g., dashboard or home)
        // This would be replaced with your routing logic
        alert('Profile setup complete! Redirecting to Profile page...');
        const success = await registerUser(
            // profileData.name,
            // profileData.username,
            // profileData.email,
            // profileData.password,
            pendingRegistration.name,
            pendingRegistration.username,   
            pendingRegistration.email,
            pendingRegistration.password,
            profileData.bio,
            profileData.profilePicture,
            profileData.location,
            profileData.mainHobby,
        );

        if (success) {
            navigate('/profile');
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit({ preventDefault: () => { } } as React.FormEvent);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-300 to-sky-500 p-4 transition-all duration-500">
            <div className="w-full max-w-2xl bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden animate-fade-in">
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-white mb-2 animate-slide-up">Complete Your Profile</h1>
                    <p className="text-sky-100 mb-8 animate-slide-up animation-delay-100">
                        Let's personalize your experience on our platform
                    </p>

                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            {Array.from({ length: totalSteps }).map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-2 rounded-full transition-all duration-300 ${index + 1 <= currentStep ? 'bg-white w-full' : 'bg-white/30 w-full'
                                        } ${index !== totalSteps - 1 ? 'mr-2' : ''}`}
                                />
                            ))}
                        </div>
                        <p className="text-white text-sm">Step {currentStep} of {totalSteps}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {currentStep === 1 && (
                            <div className="animate-fade-in">
                                <BioSection
                                    bio={profileData.bio}
                                    updateBio={(value) => updateProfileData('bio', value)}
                                />
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="animate-fade-in">
                                <ProfilePictureUpload
                                    profilePicture={profileData.profilePicture}
                                    updateProfilePicture={(file) => updateProfileData('profilePicture', file)}
                                />
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="animate-fade-in">
                                <LocationSelector
                                    location={profileData.location}
                                    updateLocation={(value) => updateProfileData('location', value)}
                                />
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="animate-fade-in">
                                <HobbySelector
                                    hobby={profileData.mainHobby}
                                    customHobby={profileData.customHobby}
                                    updateHobby={(value) => updateProfileData('hobby', value)}
                                    updateCustomHobby={(value) => updateProfileData('customHobby', value)}
                                />
                            </div>
                        )}

                        <div className="flex justify-between pt-6">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300"
                                >
                                    Back
                                </button>
                            ) : (
                                <div></div> // Empty div for spacing
                            )}

                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-6 py-3 bg-white text-navy rounded-lg flex items-center hover:shadow-lg transition-all duration-300"
                            >
                                {currentStep === totalSteps ? 'Complete Setup' : 'Continue'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;