import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';

const RescheduleModal = ({
  isOpen,
  onClose,
  onReschedule,
  times,
  newDate,
  newTime,
  setNewDate,
  setNewTime
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reschedule Appointment</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            label="New Date"
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="time-select-label">New Time</InputLabel>
            <Select
              labelId="time-select-label"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              label="New Time"
            >
              <MenuItem value="">
                <em>Select Time</em>
              </MenuItem>
              {times.map((time, index) => (
                <MenuItem key={index} value={time}>
                  {time}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onReschedule} variant="contained" color="primary">
          Reschedule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RescheduleModal;