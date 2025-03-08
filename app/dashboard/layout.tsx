'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import { Box, Paper, Container, IconButton, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { 
  HomeIcon, 
  UserCircleIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowLeftOnRectangleIcon,
  PersonIcon
} from '@heroicons/react/24/outline'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'

const EXPANDED_WIDTH = 280
const COLLAPSED_WIDTH = 80

const StyledSidebar = styled('div')<{ isexpanded: 'true' | 'false' }>(({ theme, isexpanded }) => ({
  backgroundColor: '#1E1E1E',
  width: isexpanded === 'true' ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
  position: 'fixed',
  left: 0,
  top: 0,
  height: '100vh',
  transition: 'all 0.3s ease-in-out',
  borderRight: `1px solid ${theme.palette.primary.main}`,
  boxShadow: `0 0 20px rgba(255, 51, 102, 0.1)`,
  zIndex: 1200,
  padding: theme.spacing(3),
  '&:hover': {
    boxShadow: `0 0 30px rgba(255, 51, 102, 0.2)`,
  }
}))

const MainContent = styled('main')<{ isexpanded: 'true' | 'false' }>(({ isexpanded }) => ({
  marginLeft: isexpanded === 'true' ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
  transition: 'margin-left 0.3s ease-in-out',
  width: `calc(100% - ${isexpanded === 'true' ? EXPANDED_WIDTH : COLLAPSED_WIDTH}px)`,
}))

const ToggleButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: -20,
  top: 20,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  width: 40,
  height: 40,
}))

const NavItemText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isExpanded'
})<{ isExpanded?: boolean }>(({ isExpanded }) => ({
  opacity: isExpanded ? 1 : 0,
  transition: 'opacity 0.3s ease-in-out',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  width: isExpanded ? 'auto' : 0,
}))

const StyledNavItem = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'isExpanded'
})<{ isExpanded?: boolean }>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.text.primary,
  textDecoration: 'none',
  gap: theme.spacing(2),
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: 'rgba(255, 95, 31, 0.1)',
    transform: 'translateX(5px)',
    '&::after': {
      transform: 'translateX(0)',
    },
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: '2px',
    width: '100%',
    backgroundColor: theme.palette.primary.main,
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease-in-out',
  },
  '& svg': {
    width: 24,
    height: 24,
    color: theme.palette.primary.main,
    transition: 'all 0.2s ease-in-out',
  },
  '&:hover svg': {
    transform: 'scale(1.1)',
  },
}))

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  { name: 'Assessments', href: '/dashboard/assessments', icon: ClipboardDocumentListIcon },
  { name: 'Daily Logs', href: '/dashboard/daily-logs', icon: CalendarIcon },
  { name: 'Progress', href: '/dashboard/progress', icon: ChartBarIcon },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#1E1E1E', minHeight: '100vh' }}>
      <StyledSidebar isexpanded={isExpanded ? 'true' : 'false'}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ color: 'primary.main' }}>
            {isExpanded ? 'NEN' : 'N'}
          </Typography>
          <ToggleButton onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronLeftIcon /> : <MenuIcon />}
          </ToggleButton>
        </Box>

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <StyledNavItem href={item.href}>
                      <item.icon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
                      <NavItemText isExpanded={isExpanded}>{item.name}</NavItemText>
                    </StyledNavItem>
                  </li>
                ))}
              </ul>
            </li>
            <li className="mt-auto">
              <StyledNavItem
                href="/logout"
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
                <NavItemText isExpanded={isExpanded}>Logout</NavItemText>
              </StyledNavItem>
            </li>
          </ul>
        </nav>
      </StyledSidebar>

      <MainContent isexpanded={isExpanded ? 'true' : 'false'}>
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </MainContent>
    </Box>
  )
} 