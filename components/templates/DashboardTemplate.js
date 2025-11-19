import DashboardHeader from '../organisms/DashboardHeader';
import Button from '../atoms/Button';
import InstrumentTable from '../molecules/InstrumentTable';
import InstrumentModal from '../organisms/InstrumentModal';
import styles from './DashboardTemplate.module.css';

const DashboardTemplate = ({ 
  title,
  user,
  instruments,
  loading,
  error,
  showModal,
  editingInstrument,
  filterStatus,
  onLogout,
  onAddInstrument,
  onEditInstrument,
  onDeleteInstrument,
  onStatusChange,
  onFilterChange,
  onSubmitModal,
  onCancelModal,
  modalLoading
}) => {
  return (
    <div className={styles.container}>
      <DashboardHeader 
        title={title}
        onLogout={onLogout}
        user={user}
      />
      
      {user?.role === 'admin' && (
        <div className={styles.actions}>
          <Button 
            variant="primary" 
            size="medium" 
            onClick={onAddInstrument}
          >
            + Add New Instrument
          </Button>
        </div>
      )}
      
      {error && <div className={styles.error}>{error}</div>}
      
      <InstrumentTable
        instruments={instruments}
        onEdit={user?.role === 'admin' ? onEditInstrument : null}
        onDelete={user?.role === 'admin' ? onDeleteInstrument : null}
        onStatusChange={onStatusChange}
        loading={loading}
        filterStatus={filterStatus}
        onFilterChange={onFilterChange}
      />
      
      {showModal && (
        <InstrumentModal
          instrument={editingInstrument}
          onSubmit={onSubmitModal}
          onCancel={onCancelModal}
          loading={modalLoading}
        />
      )}
    </div>
  );
};

export default DashboardTemplate;