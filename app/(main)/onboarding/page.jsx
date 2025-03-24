import { industries } from "@/data/industries";

const OnboardingPage = () => {
  // Check if user is already onboarded

  return (
    <main>
      <OnboardingPage industries={industries} />
    </main>
  );
};

export default OnboardingPage;