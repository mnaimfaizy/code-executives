import React from 'react';
import { Drawer, List, ListItem, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const sidebarSections: Record<string, Array<{ label: string; path: string }>> = {
  '/javascript': [
    { label: 'Introduction', path: '/javascript?section=Introduction' },
    { label: 'Engine & Runtime', path: '/javascript?section=Engine%20%26%20Runtime' },
    { label: 'Execution Model', path: '/javascript?section=Execution%20Model' },
    { label: 'Event Loop', path: '/javascript?section=Event%20Loop' },
    { label: 'Call Stack', path: '/javascript?section=Call%20Stack' },
    { label: 'Memory Management', path: '/javascript?section=Memory%20Management' },
    { label: 'Visualization', path: '/javascript?section=Visualization' },
  ],
  '/': [],
  '/about': [],
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation();
  // Get the base path (e.g., '/javascript')
  const basePath = location.pathname;
  const sections = sidebarSections[basePath] || [];

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          top: 64, // Height of AppBar
          width: 240,
        },
      }}
    >
      <List>
        {sections.map(({ label, path }) => (
          <ListItem key={label} disablePadding>
            <Button
              sx={{
                justifyContent: 'flex-start',
                width: '100%',
                pl: 2,
                py: 1,
                textTransform: 'none',
              }}
              component={Link}
              to={path}
            >
              {label}
            </Button>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
