import axios from 'axios';

const API_URL = 'https://669f704cb132e2c136fdd9a0.mockapi.io/api/v1/retreats';

export const fetchRetreats = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

export const updateRetreat = async (id: string, retreat: any) => {
  try {
    await axios.put(`${API_URL}/${id}`, retreat);
  } catch (error) {
    console.error('Error saving data:', error);
  }
};