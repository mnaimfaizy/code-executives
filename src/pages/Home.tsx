import React from 'react';
import { Typography, Box } from '@mui/material';

const Home: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>
      Welcome to Code Executives
    </Typography>
    <Typography variant="body1">
      Deep dive into the inner workings of programming languages with interactive theory and visual
      demos.
    </Typography>
  </Box>
);

export default Home;
