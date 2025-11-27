import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import BioSection from '../components/profile-setup/BioSection';
import ProfilePictureUpload from '../components/profile-setup/ProfilePictureUpload';
import LocationSelector from '../components/profile-setup/LocationSelector';
import HobbySelector from '../components/profile-setup/HobbySelector';
import AnimatedCharacter from '../components/profile-setup/AnimatedCharacter';
import FloatingElements from '../components/profile-setup/FloatingElements';
import ProgressCharacter from '../components/profile-setup/ProgressCharacter';
import StepTransition from '../components/profile-setup/StepTransition';

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading, pendingRegistration} = useAuth();
  const [profileData, setProfileData] = useState({
    bio: '',
    profilePicture: null as File | null,
    location: { lat: 0, lng: 0, city: '' },
    mainHobby: '',
    customHobby: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const totalSteps = 4; // Reduced to 4 steps

  const updateProfileData = (field: string, value: any) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const finalHobby = profileData.mainHobby === 'Custom' ? profileData.customHobby : profileData.mainHobby;
    
    const success = await registerUser(
      pendingRegistration.name,
      pendingRegistration.username,   
      pendingRegistration.email,
      pendingRegistration.password,
      profileData.bio,
      profileData.profilePicture,
      profileData.location.lat.toString(),
      profileData.location.lng.toString(),
      finalHobby,
      profileData.location.city,
    );

    console.log('Test Lat Lan:', profileData.location);

    if (success) {
      navigate('/RegisterSuccess');
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setTransitionDirection('forward');
      setShowTransition(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setShowTransition(false);
      }, 400);
    } else {
      // Only submit when explicitly clicking "Complete Setup" on the last step
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setTransitionDirection('backward');
      setShowTransition(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setShowTransition(false);
      }, 400);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Tell Your Story";
      case 2: return "Show Your Face";
      case 3: return "Where Are You?";
      case 4: return "What Drives You?";
      default: return "Complete Your Profile";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1: return "Share what makes you unique (optional)";
      case 2: return "Add a personal touch with your photo (optional)";
      case 3: return "Help others find you by selecting your city (optional)";
      case 4: return "Tell us about your interests and hobbies (optional)";
      default: return "Let's personalize your experience";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return "Write a brief description about yourself. This helps others understand who you are.";
      case 2: return "Upload a profile picture to make your profile more personal and welcoming.";
      case 3: return "Select your city in Sri Lanka to connect with people in your area.";
      case 4: return "Choose from popular hobbies or add your own to help us recommend relevant content.";
      default: return "";
    }
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    
    // Count completed steps (all are optional now)
    if (profileData.bio.trim()) completed++;
    if (profileData.profilePicture) completed++;
    // if (profileData.location.trim()) completed++;
    if (profileData.mainHobby && (profileData.mainHobby !== 'Custom' || profileData.customHobby.trim())) completed++;
    
    return Math.round((completed / totalSteps) * 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-300 to-sky-200 p-4 transition-all duration-500 relative overflow-hidden">
      {/* Floating background elements */}
      <FloatingElements step={currentStep} />
      
      {/* Step transition overlay */}
      <StepTransition isVisible={showTransition} direction={transitionDirection} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/30 relative"
      >
        {/* Animated character in top corner */}
        <div className="absolute top-6 right-6 z-10">
          <AnimatedCharacter step={currentStep} />
        </div>

        <div className="p-8 md:p-12">
          {/* Header with animated title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-8"
          >
            <motion.h1
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-slate-800 mb-3 bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent"
            >
              {getStepTitle()}
            </motion.h1>
            <motion.p
              key={`subtitle-${currentStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-700 text-lg mb-2 font-medium"
            >
              {getStepSubtitle()}
            </motion.p>
            <motion.p
              key={`description-${currentStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-slate-600 text-sm max-w-2xl mx-auto"
            >
              {getStepDescription()}
            </motion.p>
          </motion.div>

          {/* Progress Character */}
          <ProgressCharacter currentStep={currentStep} totalSteps={totalSteps} />

          {/* Enhanced Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex justify-between mb-4">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: '100%',
                    backgroundColor: index + 1 <= currentStep ? '#1e40af' : 'rgba(30, 64, 175, 0.2)'
                  }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`h-2 rounded-full transition-all duration-500 relative ${
                    index !== totalSteps - 1 ? 'mr-2' : ''
                  }`}
                >
                  {/* Glowing effect for active step */}
                  {index + 1 === currentStep && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-blue-600 rounded-full blur-sm"
                    />
                  )}
                </motion.div>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <motion.p
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-slate-700 text-sm font-medium"
              >
                Step {currentStep} of {totalSteps}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center text-slate-600 text-sm"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                </motion.div>
                {getCompletionPercentage()}% Complete
              </motion.div>
            </div>
          </motion.div>

          {/* Form Steps */}
          <div className="space-y-8">
            <div className="min-h-[400px] relative">
<div className="min-h-[400px] relative overflow-hidden">
  <AnimatePresence mode="wait">
    {currentStep === 1 && (
      <motion.div
        key="step1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <BioSection
          bio={profileData.bio}
          updateBio={(value) => updateProfileData('bio', value)}
        />
      </motion.div>
    )}

    {currentStep === 2 && (
      <motion.div
        key="step2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <ProfilePictureUpload
          profilePicture={profileData.profilePicture}
          updateProfilePicture={(file) => updateProfileData('profilePicture', file)}
        />
      </motion.div>
    )}

    {currentStep === 3 && (
      <motion.div
        key="step3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <LocationSelector
          location={profileData.location}
          updateLocation={(location) => updateProfileData('location', location)}
        />
      </motion.div>
    )}

    {currentStep === 4 && (
      <motion.div
        key="step4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <HobbySelector
          hobby={profileData.mainHobby}
          customHobby={profileData.customHobby}
          updateHobby={(value) => updateProfileData('mainHobby', value)}
          updateCustomHobby={(value) => updateProfileData('customHobby', value)}
        />
      </motion.div>
    )}
  </AnimatePresence>
</div>





              {/* Step completion celebration */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 left-4"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="text-2xl"
                >
                  ✨
                </motion.div>
              </motion.div>
            </div>

            {/* Enhanced Navigation Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-between items-center pt-8 border-t border-slate-300/50"
            >
              {currentStep > 1 ? (
                <motion.button
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={prevStep}
                  className="flex items-center px-6 py-3 bg-white/30 hover:bg-white/40 text-slate-700 rounded-xl transition-all duration-300 border border-slate-300/50 group font-medium"
                >
                  <motion.div
                    animate={{ x: [-2, 0, -2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </motion.div>
                  Back
                </motion.button>
              ) : (
                <Link
                  to="/"
                  className="flex items-center px-6 py-3 bg-white/30 hover:bg-white/40 text-slate-600 hover:text-slate-700 rounded-xl transition-all duration-300 border border-slate-300/50 font-medium"
                >
                  Skip Setup
                </Link>
              )}

              <motion.button
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={nextStep}
                disabled={loading}
                className={`flex items-center px-8 py-3 rounded-xl transition-all duration-300 font-medium relative overflow-hidden ${
                  !loading
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-blue-400 text-white cursor-not-allowed'
                }`}
              >
                {/* Button glow effect */}
                {!loading && (
                  <motion.div
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                )}
                
                {loading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    {currentStep === totalSteps ? 'Complete Setup' : 'Continue'}
                    <motion.div
                      animate={{ x: [0, 2, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </motion.div>
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-sky-500 to-blue-600 opacity-60" />
      </motion.div>
    </div>
  );
};

export default ProfileSetup;