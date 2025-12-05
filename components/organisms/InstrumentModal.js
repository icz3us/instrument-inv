import InstrumentForm from '../molecules/InstrumentForm';
import styles from './InstrumentModal.module.css';

const InstrumentModal = ({ 
  instrument = null, 
  onSubmit, 
  onCancel, 
  loading 
}) => {
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>{instrument ? 'Edit Instrument' : 'Add New Instrument'}</h2>
        <InstrumentForm
          instrument={instrument}
          onSubmit={onSubmit}
          onCancel={onCancel}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default InstrumentModal;