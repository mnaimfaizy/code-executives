import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

export interface TwoDLayoutProps {
  title?: string;
  editor: React.ReactNode; // left-top
  output: React.ReactNode; // left-bottom
  canvas: React.ReactNode; // right side
  height?: number; // layout height in px
}

const TwoDLayout: React.FC<TwoDLayoutProps> = ({ title, editor, output, canvas, height = 560 }) => {
  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: 'grey.50',
        borderRadius: 2,
        boxShadow: '0 8px 24px rgba(16,24,40,0.06)',
        border: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {/* Left column: editor + output */}
        <Stack spacing={2} sx={{ width: { xs: '100%', md: '44%' } }}>
          <Box
            sx={{
              flex: 1,
              height: { xs: height * 0.55, md: height * 0.55 },
              p: 1,
              bgcolor: 'grey.100',
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 1.5,
            }}
          >
            {editor}
          </Box>
          <Box
            sx={{
              flex: 1,
              height: { xs: height * 0.35, md: height * 0.35 },
              p: 1,
              bgcolor: 'grey.100',
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 1.5,
            }}
          >
            {output}
          </Box>
        </Stack>
        {/* Right column: canvas */}
        <Box
          sx={{
            width: { xs: '100%', md: '56%' },
            height,
            p: 1,
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: 2,
            background: 'linear-gradient(180deg, rgba(249,250,251,1) 0%, rgba(238,242,247,1) 100%)',
          }}
        >
          {canvas}
        </Box>
      </Stack>
    </Paper>
  );
};

export default TwoDLayout;
