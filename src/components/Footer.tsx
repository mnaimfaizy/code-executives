import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer: React.FC = () => (
  <Box component="footer" sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
    <Typography variant="body2" color="text.secondary">
      © 2025 Code Executives. All rights reserved. | <Link href="/about">About</Link>
    </Typography>
  </Box>
);

export default Footer;
