import Button from '../atoms/Button';
import Select from '../atoms/Select';
import styles from './InstrumentTable.module.css';

const InstrumentTable = ({ 
  instruments = [], 
  onEdit, 
  onDelete, 
  onStatusChange,
  loading = false,
  filterStatus = 'all',
  onFilterChange
}) => {
  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'checked_out', label: 'Checked Out' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'available':
        return styles.available;
      case 'checked_out':
        return styles.checkedOut;
      case 'maintenance':
        return styles.maintenance;
      default:
        return '';
    }
  };

  const filteredInstruments = filterStatus === 'all'
    ? instruments
    : instruments.filter(instrument => instrument.status === filterStatus);

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading instruments...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.filter}>
        <Select
          label="Filter by Status"
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          options={statusOptions}
        />
      </div>
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstruments.length > 0 ? (
              filteredInstruments.map((instrument) => (
                <tr key={instrument.id}>
                  <td>{instrument.name}</td>
                  <td>{instrument.description}</td>
                  <td>{instrument.quantity}</td>
                  <td>{instrument.category}</td>
                  <td>
                    <span className={`${styles.status} ${getStatusClass(instrument.status)}`}>
                      {instrument.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    {onEdit && (
                      <Button 
                        variant="secondary" 
                        size="small" 
                        onClick={() => onEdit(instrument)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button 
                        variant="danger" 
                        size="small" 
                        onClick={() => onDelete(instrument.id)}
                      >
                        Delete
                      </Button>
                    )}
                    {onStatusChange && (
                      <Select
                        value={instrument.status}
                        onChange={(e) => onStatusChange(instrument, e.target.value)}
                        options={statusOptions.filter(opt => opt.value !== 'all')}
                        className={styles.statusSelect}
                      />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles.noData}>
                  No instruments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstrumentTable;