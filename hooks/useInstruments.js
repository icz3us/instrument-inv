import { useState, useEffect } from 'react';
import { instrumentsService } from '../services/instruments.service';

// Custom hook for fetching all instruments
export const useInstruments = () => {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInstruments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instrumentsService.getAllInstruments();
      setInstruments(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching instruments:', err);
    } finally {
      setLoading(false);
    }
  };

  const createInstrument = async (instrumentData) => {
    try {
      const newInstrument = await instrumentsService.createInstrument(instrumentData);
      setInstruments(prev => [...prev, newInstrument]);
      return newInstrument;
    } catch (err) {
      setError(err.message);
      console.error('Error creating instrument:', err);
      throw err;
    }
  };

  const updateInstrument = async (id, instrumentData) => {
    try {
      const updatedInstrument = await instrumentsService.updateInstrument(id, instrumentData);
      setInstruments(prev => 
        prev.map(instrument => 
          instrument.id === id ? updatedInstrument : instrument
        )
      );
      return updatedInstrument;
    } catch (err) {
      setError(err.message);
      console.error('Error updating instrument:', err);
      throw err;
    }
  };

  const deleteInstrument = async (id) => {
    try {
      await instrumentsService.deleteInstrument(id);
      setInstruments(prev => prev.filter(instrument => instrument.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting instrument:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchInstruments();
  }, []);

  return {
    instruments,
    loading,
    error,
    fetchInstruments,
    createInstrument,
    updateInstrument,
    deleteInstrument
  };
};