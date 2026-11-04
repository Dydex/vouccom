import { Redirect } from 'expo-router';

// App entry point: always land on the first onboarding screen.
export default function Index() {
  return <Redirect href="/page1" />;
}
