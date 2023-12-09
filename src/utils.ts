export async function parseCSV(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();

    // Parse the CSV data
    const rows = text.trim().split('\n');
    const headers = rows[0].split(',').map(header => header.trim());
    const data = [];

    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',').map(value => value.trim());
      const rowObject = {};

      for (let j = 0; j < headers.length; j++) {
        rowObject[headers[j]] = values[j];
      }

      data.push(rowObject);
    }

    return data;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
}

export async function fetchJSON(url): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error; // Rethrow the error for the caller to handle
  }
}