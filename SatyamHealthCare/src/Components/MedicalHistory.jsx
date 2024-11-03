import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Container,
  Stack,
  Divider,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: theme.spacing(1),
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.95rem',
    fontWeight: 500,
  },
}));

const MedicalHistory = () => {
  const theme = useTheme();
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMedicalHistory, setNewMedicalHistory] = useState({
    hasChronicConditions: false,
    chronicConditions: '',
    hasAllergies: false,
    allergies: '',
    takesMedications: false,
    medications: '',
    hadSurgeries: false,
    surgeries: '',
    hasFamilyHistory: false,
    familyHistory: '',
    hasLifestyleFactors: false,
    lifestyleFactors: '',
    vaccinationRecords: ''
  });

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  const fetchMedicalHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://localhost:7166/api/MedicalHistoryFiles/GetLoggedInPatientMedicalHistory', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 404) {
        setError('No medical history found for this patient.');
        setMedicalHistory(null);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch medical history');
      }

      const data = await response.json();
      console.log('Fetched Medical History:', data);

      if (Array.isArray(data) && data.length > 0) {
        setMedicalHistory(data[0]); 
      } else {
        setMedicalHistory(null); 
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMedicalHistory(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('https://localhost:7166/api/MedicalHistoryFiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newMedicalHistory)
      });

      if (!response.ok) {
        throw new Error('Failed to submit medical history');
      }

      const data = await response.json();
      console.log('Medical history submitted successfully:', data);
      navigate('/');
      await fetchMedicalHistory();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (label, name, placeholder = '') => (
    <StyledTextField
      label={label}
      name={name}
      value={newMedicalHistory[name]}
      onChange={handleChange}
      placeholder={placeholder}
      variant="outlined"
      fullWidth
      margin="normal"
      multiline
      rows={3}
      sx={{
        '& .MuiInputBase-input': {
          fontSize: '1rem',
          lineHeight: 1.6,
        },
      }}
    />
  );

  const renderCheckboxField = (label, name, dependentFieldName) => (
    <Box sx={{ mt: 3, mb: 3 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={newMedicalHistory[name]}
            onChange={handleChange}
            name={name}
            sx={{
              '&.Mui-checked': {
                color: theme.palette.primary.main,
              },
            }}
          />
        }
        label={
          <Typography sx={{ fontSize: '1rem', fontWeight: 500 }}>
            {label}
          </Typography>
        }
      />
      {newMedicalHistory[name] && (
        <StyledTextField
          name={dependentFieldName}
          value={newMedicalHistory[dependentFieldName]}
          onChange={handleChange}
          placeholder={`Please provide details about your ${label.toLowerCase()}`}
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          sx={{ mt: 2 }}
        />
      )}
    </Box>
  );

  const renderForm = () => (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <StyledPaper>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontSize: '2rem',
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 4,
          }}
        >
          Submit Medical History
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {renderCheckboxField('Do you have any chronic conditions?', 'hasChronicConditions', 'chronicConditions')}
            <Divider />
            {renderCheckboxField('Do you have any allergies?', 'hasAllergies', 'allergies')}
            <Divider />
            {renderCheckboxField('Are you currently taking any medications?', 'takesMedications', 'medications')}
            <Divider />
            {renderCheckboxField('Have you had any surgeries?', 'hadSurgeries', 'surgeries')}
            <Divider />
            {renderCheckboxField('Do you have any relevant family medical history?', 'hasFamilyHistory', 'familyHistory')}
            <Divider />
            {renderCheckboxField('Are there any lifestyle factors affecting your health?', 'hasLifestyleFactors', 'lifestyleFactors')}
            <Divider />
            
            <Box sx={{ mt: 3 }}>
              {renderFormField('Vaccination Records', 'vaccinationRecords', 'Enter your vaccination history')}
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                mt: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                },
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Submitting...
                </Box>
              ) : (
                'Submit Medical History'
              )}
            </Button>
          </Stack>
        </form>
      </StyledPaper>
    </Container>
  );

  const renderExistingHistory = () => (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <StyledPaper>
        <Typography
          variant="h4"
          sx={{
            fontSize: '2rem',
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 4,
          }}
        >
          Your Medical History
        </Typography>
        <Stack spacing={3}>
          {[
            ['Chronic Conditions', medicalHistory.chronicConditions],
            ['Allergies', medicalHistory.allergies],
            ['Medications', medicalHistory.medications],
            ['Surgeries', medicalHistory.surgeries],
            ['Family History', medicalHistory.familyHistory],
            ['Lifestyle Factors', medicalHistory.lifestyleFactors],
            ['Vaccination Records', medicalHistory.vaccinationRecords]
          ].map(([label, value], index) => (
            <Box key={label}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  mb: 1,
                }}
              >
                {label}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  color: theme.palette.text.primary,
                }}
              >
                {value || 'None'}
              </Typography>
              {index < 6 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Stack>
      </StyledPaper>
    </Container>
  );

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error && !medicalHistory) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        {renderForm()}
      </Container>
    );
  }

  return medicalHistory ? renderExistingHistory() : renderForm();
};

export default MedicalHistory;