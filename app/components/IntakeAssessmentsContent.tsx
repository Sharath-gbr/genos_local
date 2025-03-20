'use client';

import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

console.log('Loading IntakeAssessmentsContent');

const MedicalConditionsGrid = dynamic(
  () => import('@/app/components/widgets/MedicalConditionsGrid'),
  { ssr: false }
);

const BloodReportAssessment = dynamic(
  () => import('@/app/components/widgets/BloodReportAssessment'),
  { ssr: false }
);

const KnownAllergies = dynamic(
  () => import('@/app/components/widgets/KnownAllergies'),
  { ssr: false }
);

const GutSymptomsWidget = dynamic(
  () => import('@/app/components/widgets/GutSymptomsWidget'),
  { 
    ssr: false,
    loading: () => <Box className="p-6">Loading Gut Symptoms...</Box>
  }
);

const SleepHistoryWidget = dynamic(
  () => import('@/app/components/widgets/SleepHistoryWidget'),
  { 
    ssr: false,
    loading: () => <Box className="p-6">Loading Sleep History...</Box>
  }
);

const EnergyLevelsWidget = dynamic(
  () => import('@/app/components/widgets/EnergyLevelsWidget'),
  { 
    ssr: false,
    loading: () => <Box className="p-6">Loading Energy Levels History...</Box>
  }
);

export default function IntakeAssessmentsContent() {
  console.log('Rendering IntakeAssessmentsContent');
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <Box className="p-6">Loading...</Box>;
  }

  if (!session) {
    return null;
  }

  return (
    <Box className="p-6 space-y-4">
      <MedicalConditionsGrid />
      <BloodReportAssessment email={session.user?.email || ''} />
      <KnownAllergies />
      <GutSymptomsWidget />
      <SleepHistoryWidget />
      <EnergyLevelsWidget />
    </Box>
  );
} 