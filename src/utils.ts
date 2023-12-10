// this module contains utility functions for loading data


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

// load data from a local csv and call the callback with the data
export function loadCSV(path, callback) {
  parseCSV(path).then(callback).catch(e => console.log('Error:', e));
}

export function loadJSON(path, callback) {
  fetchJSON(path).then(callback).catch(e => console.log('Error:', e));
}

// load data from a remote json and call the callback with the data
export async function loadRemoteJSON(url, callback) {
  try {
    const json = await fetchJSON(url);
    callback(json.data.stations);
  } catch (error) {
    console.log('Error:', error);
  }
}
