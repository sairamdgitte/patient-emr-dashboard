// This is a simplified version - you'll need to adapt it to your actual CSV structure
export const processWebsiteData = (csvData) => {
  return csvData.map(row => ({
    patient_id: row.patient_id,
    allergy_id: row.allergy_id,
    condition_id: row.condition_id,
    medication_statement_id_y: row.medication_statement_id_y,
    dateAsserted_x: row.dateAsserted_x,
    dateAsserted_y: row.dateAsserted_y,
    loinc_display: row.loinc_display
  }));
};

// Sample processed data structure
export const websiteData = [
  // Your actual processed data would go here
];