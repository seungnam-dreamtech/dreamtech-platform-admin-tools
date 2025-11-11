// 폼 섹션 공통 컴포넌트
import React from 'react';
import { Card, CardContent, Box, Typography, Stack } from '@mui/material';

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  extra?: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  icon,
  children,
  extra
}) => {
  return (
    <Card
      variant="outlined"
      sx={{ marginBottom: 2 }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            {icon}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {title}
              </Typography>
              {description && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {description}
                </Typography>
              )}
            </Box>
          </Stack>
          {extra && <Box>{extra}</Box>}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
};