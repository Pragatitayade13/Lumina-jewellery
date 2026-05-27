const API_BASE_URL = 'http://localhost:5000/api/jewellery';

export const getItems = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.material) queryParams.append('material', filters.material);
  if (filters.stockStatus) queryParams.append('stockStatus', filters.stockStatus);

  const url = `${API_BASE_URL}?${queryParams.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Failed to fetch inventory');
  }
  return response.json();
};

export const getItem = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Failed to fetch item details');
  }
  return response.json();
};

export const createItem = async (itemData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Failed to create item');
  }
  return response.json();
};

export const updateItem = async (id, itemData) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Failed to update item');
  }
  return response.json();
};

export const deleteItem = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Failed to delete item');
  }
  return response.json();
};
