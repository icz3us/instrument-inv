import { useState } from 'react';
import Button from '../atoms/Button';
import Select from '../atoms/Select';
import Textarea from '../atoms/Textarea';
import { employeeService } from '../../services/employee.service';
import styles from './ConditionReporting.module.css';

const ConditionReporting = ({ instrument, user, onReportSubmitted, onCancel }) => {
  const [condition, setCondition] = useState('good');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const conditionData = {
        instrument_id: instrument.id,
        condition,
        notes,
        reported_by: user.id
      };

      await employeeService.reportCondition(conditionData);
      
      // Call the callback if provided
      if (onReportSubmitted) {
        onReportSubmitted();
      }
    } catch (err) {
      setError('Failed to submit condition report. Please try again.');
      console.error('Error submitting condition report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Report Instrument Condition</h2>
        <p>Instrument: {instrument.name}</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="condition">Condition</label>
          <Select
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="good">Good</option>
            <option value="needs_repair">Needs Repair</option>
            <option value="under_maintenance">Under Maintenance</option>
            <option value="missing">Missing</option>
          </Select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="notes">Notes</label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the condition of the instrument..."
            rows={4}
          />
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={loading}
          >
            Submit Report
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConditionReporting;