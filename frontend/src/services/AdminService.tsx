const baseUrl = 'http://localhost:8000/api/admin';

export const AdminService = {
  async getDashboardStats() {
    const response = await fetch(`${baseUrl}/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  async getLowStockItems() {
    const response = await fetch(`${baseUrl}/reports/stock`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch low stock items');
    return response.json();
  },

  async getSalesReport(startDate: string, endDate: string) {
    const response = await fetch(
      `${baseUrl}/reports/sales?start=${startDate}&end=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    if (!response.ok) throw new Error('Failed to fetch sales report');
    return response.json();
  }
};