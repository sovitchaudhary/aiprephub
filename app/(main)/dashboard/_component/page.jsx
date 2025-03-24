const IndustryInsightsPage = async () => {
  const { isOnboarded } = await getUserOnboardingStatus();
  
    if (!isOnboarded) {
      redirect("/dashboard");
    }
  return (
    <div>IndustryInsightsPage</div>
  )
}

export default IndustryInsightsPage