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
        p: { xs: 2, md: 3 },
        background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 15px 12px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.8)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
          borderRadius: '16px 16px 0 0',
        },
      }}
    >
      {title && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: '60px',
              height: '3px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '2px',
              opacity: 0.7,
            }}
          />
        </Box>
      )}
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={{ xs: 2, md: 3 }}
        sx={{
          width: '100%',
          minWidth: 0, // Allow flex items to shrink below their minimum content size
          '& > *': {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            minWidth: 0, // Apply to all children
          },
        }}
      >
        {/* Left column: editor + output with enhanced styling */}
        <Stack spacing={{ xs: 2, md: 3 }} sx={{ width: { xs: '100%', lg: '44%' }, minWidth: 0 }}>
          <Box
            sx={{
              height: { xs: '300px', md: `${height * 0.55}px`, lg: `${height * 0.55}px` },
              minHeight: '250px',
              p: { xs: 1.5, md: 2 },
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgba(203, 213, 225, 0.5)',
              borderRadius: 3,
              boxShadow: '0 4px 15px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%)',
              },
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
              },
            }}
          >
            {/* Editor Label */}
            <Typography
              variant="subtitle2"
              sx={{
                color: 'rgba(51, 65, 85, 0.8)',
                fontWeight: 600,
                mb: 1,
                fontSize: { xs: '0.7rem', md: '0.75rem' },
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Code Editor
            </Typography>
            <Box sx={{ height: 'calc(100% - 24px)' }}>{editor}</Box>
          </Box>
          <Box
            sx={{
              height: { xs: '200px', md: `${height * 0.35}px`, lg: `${height * 0.35}px` },
              minHeight: '150px',
              p: { xs: 1.5, md: 2 },
              background: 'linear-gradient(145deg, #1f2937 0%, #111827 100%)',
              border: '1px solid rgba(75, 85, 99, 0.5)',
              borderRadius: 3,
              boxShadow: '0 4px 15px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.4) 50%, transparent 100%)',
              },
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
              },
            }}
          >
            {/* Output Label */}
            <Typography
              variant="subtitle2"
              sx={{
                color: 'rgba(34, 197, 94, 0.9)',
                fontWeight: 600,
                mb: 1,
                fontSize: { xs: '0.7rem', md: '0.75rem' },
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Console Output
            </Typography>
            <Box sx={{ height: 'calc(100% - 24px)' }}>{output}</Box>
          </Box>
        </Stack>

        {/* Right column: canvas with enhanced styling */}
        <Box
          sx={{
            width: { xs: '100%', lg: '56%' },
            height: { xs: '500px', sm: '600px', md: `${height}px`, lg: `${height}px` },
            minHeight: { xs: '450px', sm: '500px' },
            p: 0,
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            minWidth: 0,
            '&:hover': {
              transform: { xs: 'none', md: 'translateY(-4px)' },
              boxShadow: { xs: '0 10px 30px rgba(0,0,0,0.1)', md: '0 20px 40px rgba(0,0,0,0.15)' },
            },
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Canvas Label */}
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              px: 3,
              py: 2,
              borderRadius: '3px 3px 0 0',
              borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
              mb: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: 'rgba(51, 65, 85, 0.9)',
                fontWeight: 600,
                fontSize: { xs: '0.75rem', md: '0.8rem' },
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Live Visualization
            </Typography>
          </Box>
          {canvas}
        </Box>
      </Stack>
    </Paper>
  );
};

export default TwoDLayout;
