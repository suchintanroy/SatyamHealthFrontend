import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Button,
  Tabs,
  Tab,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Snackbar
} from "@mui/material";
import {
  Edit as EditIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import AppointmentHistory from "./AppointmentHistory";
import MedicalHistory from "./MedicalHistory";

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2)
}));

const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [patientInfo, setPatientInfo] = useState({
    PatientID: "",
    fullName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    contactNumber: "",
    countryCode: "+91",
    bloodGroup: "",
    state: "",
    city: "",
    address: "",
    pincode: ""
  });

  const navigate = useNavigate();

  const fetchPatientData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://localhost:7166/api/Patients/GetLoggedInPatient",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch patient data");
      const data = await response.json();
      setPatientInfo(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      "fullName", "dateOfBirth", "gender", "bloodGroup",
      "contactNumber", "email", "address", "city", "state", "pincode"
    ];

    requiredFields.forEach(field => {
      if (!patientInfo[field]) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const fullContactNumber = `${patientInfo.countryCode} ${patientInfo.contactNumber}`;
    const updateData = {
      PatientID: patientInfo.patientID,
      FullName: patientInfo.fullName,
      DateOfBirth: patientInfo.dateOfBirth,
      Gender: patientInfo.gender,
      BloodGroup: patientInfo.bloodGroup,
      ContactNumber: fullContactNumber,
      Email: patientInfo.email,
      Address: patientInfo.address,
      Pincode: patientInfo.pincode,
      City: patientInfo.city,
      State: patientInfo.state,
    };

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://localhost:7166/api/Patients/${patientInfo.patientID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) throw new Error("Failed to update patient information");
      
      await fetchPatientData();
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: "Profile updated successfully",
        severity: "success"
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const renderPatientInfo = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Patient Information</Typography>
        {!isEditing && (
          <IconButton onClick={() => setIsEditing(true)} color="primary">
            <EditIcon />
          </IconButton>
        )}
      </Box>

      {isEditing ? (
        <form onSubmit={handleSaveChanges}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={patientInfo.fullName}
                onChange={handleInputChange}
                error={Boolean(formErrors.fullName)}
                helperText={formErrors.fullName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                name="dateOfBirth"
                value={patientInfo.dateOfBirth}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                error={Boolean(formErrors.dateOfBirth)}
                helperText={formErrors.dateOfBirth}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={patientInfo.gender}
                  onChange={handleInputChange}
                  error={Boolean(formErrors.gender)}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Blood Group</InputLabel>
                <Select
                  name="bloodGroup"
                  value={patientInfo.bloodGroup}
                  onChange={handleInputChange}
                  error={Boolean(formErrors.bloodGroup)}
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(group => (
                    <MenuItem key={group} value={group}>{group}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={patientInfo.email}
                onChange={handleInputChange}
                error={Boolean(formErrors.email)}
                helperText={formErrors.email}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Code</InputLabel>
                    <Select
                      name="countryCode"
                      value={patientInfo.countryCode}
                      onChange={handleInputChange}
                    >
                      <MenuItem value="+1">+1</MenuItem>
                      <MenuItem value="+44">+44</MenuItem>
                      <MenuItem value="+91">+91</MenuItem>
                      <MenuItem value="+61">+61</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    name="contactNumber"
                    value={patientInfo.contactNumber}
                    onChange={handleInputChange}
                    error={Boolean(formErrors.contactNumber)}
                    helperText={formErrors.contactNumber}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={patientInfo.address}
                onChange={handleInputChange}
                error={Boolean(formErrors.address)}
                helperText={formErrors.address}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={patientInfo.city}
                onChange={handleInputChange}
                error={Boolean(formErrors.city)}
                helperText={formErrors.city}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={patientInfo.state}
                onChange={handleInputChange}
                error={Boolean(formErrors.state)}
                helperText={formErrors.state}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Pincode"
                name="pincode"
                value={patientInfo.pincode}
                onChange={handleInputChange}
                error={Boolean(formErrors.pincode)}
                helperText={formErrors.pincode}
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button
              variant="outlined"
              onClick={() => {
                setIsEditing(false);
                fetchPatientData();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </Box>
        </form>
      ) : (
        <Grid container spacing={2}>
          {[
            { label: "Full Name", value: patientInfo.fullName },
            { label: "Date of Birth", value: patientInfo.dateOfBirth },
            { label: "Gender", value: patientInfo.gender },
            { label: "Blood Group", value: patientInfo.bloodGroup },
            { label: "Email", value: patientInfo.email },
            { label: "Contact Number", value: `${patientInfo.countryCode} ${patientInfo.contactNumber}` },
            { label: "Address", value: patientInfo.address },
            { label: "City", value: patientInfo.city },
            { label: "State", value: patientInfo.state },
            { label: "Pincode", value: patientInfo.pincode }
          ].map(({ label, value }) => (
            <Grid item xs={12} sm={6} key={label}>
              <Typography variant="subtitle2" color="textSecondary">
                {label}
              </Typography>
              <Typography>{value || "N/A"}</Typography>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <StyledPaper elevation={3}>
        <Box p={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{ mb: 3 }}
          >
            Back Home
          </Button>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ width: 64, height: 64 }}>
                <PersonIcon sx={{ width: 40, height: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5">{patientInfo.fullName || "Patient Name"}</Typography>
                <Typography color="textSecondary">{patientInfo.email}</Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/appointment")}
            >
              Book an Appointment
            </Button>
          </Box>

          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab label="Patient Information" />
            <Tab label="Appointment History" />
            <Tab label="Test Result" />
            <Tab label="Medical History" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            {renderPatientInfo()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <AppointmentHistory />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <Typography>Test Result content (to be implemented)</Typography>
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <MedicalHistory />
          </TabPanel>
        </Box>
      </StyledPaper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile;