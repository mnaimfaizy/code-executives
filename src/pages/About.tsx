import React from 'react';
import { Typography, Box } from '@mui/material';

const About: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>
      About Code Executives
    </Typography>
    <Typography variant="body1">
      This platform helps learners understand programming languages through theory and interactive
      visualizations. More languages coming soon!
    </Typography>
  </Box>
);

export default About;
