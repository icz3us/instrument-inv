/**
 * Reports Service
 * This service handles generating various reports for the admin dashboard
 */

class ReportsService {
  /**
   * Get most borrowed instruments
   * @param {Array} instruments - Array of instruments
   * @param {Array} borrowRequests - Array of borrow requests
   * @returns {Array} - Top 10 most borrowed instruments
   */
  getMostBorrowedInstruments(instruments, borrowRequests) {
    // Count how many times each instrument has been borrowed
    const borrowCount = {};
    
    borrowRequests.forEach(request => {
      if (request.status === 'approved' || request.status === 'returned') {
        borrowCount[request.instrument_id] = (borrowCount[request.instrument_id] || 0) + 1;
      }
    });
    
    // Map to instrument names and sort by count
    const result = Object.entries(borrowCount)
      .map(([instrumentId, count]) => {
        const instrument = instruments.find(i => i.id === instrumentId);
        return {
          id: instrumentId,
          name: instrument ? instrument.name : 'Unknown Instrument',
          count: count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return result;
  }

  /**
   * Get inactive items (not used for X months)
   * @param {Array} instruments - Array of instruments
   * @param {Array} borrowRequests - Array of borrow requests
   * @param {number} months - Number of months to consider as inactive
   * @returns {Array} - Inactive instruments
   */
  getInactiveItems(instruments, borrowRequests, months = 6) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    // Find instruments that haven't been borrowed since cutoffDate
    const inactiveInstruments = instruments.filter(instrument => {
      const lastBorrow = borrowRequests
        .filter(request => request.instrument_id === instrument.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      
      return !lastBorrow || new Date(lastBorrow.created_at) < cutoffDate;
    });
    
    return inactiveInstruments;
  }

  /**
   * Get damage and loss rate analysis
   * @param {Array} instruments - Array of instruments
   * @param {Array} maintenanceLogs - Array of maintenance logs
   * @returns {Object} - Damage and loss statistics
   */
  getDamageLossAnalysis(instruments, maintenanceLogs) {
    const totalInstruments = instruments.length;
    const damagedInstruments = instruments.filter(i => i.condition === 'needs_repair').length;
    const missingInstruments = instruments.filter(i => i.condition === 'missing').length;
    
    const damageRate = totalInstruments > 0 ? (damagedInstruments / totalInstruments) * 100 : 0;
    const lossRate = totalInstruments > 0 ? (missingInstruments / totalInstruments) * 100 : 0;
    
    // Calculate maintenance costs
    const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => {
      return sum + (log.cost || 0);
    }, 0);
    
    return {
      totalInstruments,
      damagedInstruments,
      missingInstruments,
      damageRate: damageRate.toFixed(2),
      lossRate: lossRate.toFixed(2),
      totalMaintenanceCost
    };
  }

  /**
   * Get yearly procurement summary
   * @param {Array} instruments - Array of instruments
   * @returns {Object} - Procurement summary by year
   */
  getYearlyProcurementSummary(instruments) {
    const summary = {};
    
    instruments.forEach(instrument => {
      if (instrument.purchase_date) {
        const year = new Date(instrument.purchase_date).getFullYear();
        if (!summary[year]) {
          summary[year] = {
            count: 0,
            totalValue: 0 // This would require a value field in instruments
          };
        }
        summary[year].count += instrument.quantity || 1;
      }
    });
    
    return summary;
  }

  /**
   * Get instrument condition distribution
   * @param {Array} instruments - Array of instruments
   * @returns {Object} - Condition distribution statistics
   */
  getConditionDistribution(instruments) {
    const conditions = {
      good: 0,
      needs_repair: 0,
      under_maintenance: 0,
      missing: 0
    };
    
    instruments.forEach(instrument => {
      const condition = instrument.condition || 'good';
      if (conditions.hasOwnProperty(condition)) {
        conditions[condition] += instrument.quantity || 1;
      }
    });
    
    return conditions;
  }
}

// Create and export a singleton instance
export const reportsService = new ReportsService();