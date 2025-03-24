import { getUserOnboardingStatus } from "@/actions/user";
import { industries } from "@/data/industries";

const OnboardingPage = async () => {
  // Check if user is already onboarded
  const { isOnboarded } = await getUserOnboardingStatus();

  if (isOnboarded) {
    redirect("/dashboard");
  }

  return (
    <main>
      <OnboardingPage industries={industries} />
    </main>
  );
};

export default OnboardingPage;