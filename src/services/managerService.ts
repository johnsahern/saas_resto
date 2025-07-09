import { apiClient } from '@/integrations/api/client';

export interface CreateManagerDto {
  name: string;
  email: string;
  password: string;
  restaurantId: string;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  restaurantId: string;
  restaurantName: string;
  restaurantCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateManagerDto {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  restaurantCode?: string;
}

class ManagerService {
  async createManager(data: CreateManagerDto): Promise<Manager> {
    try {
      const response = await apiClient.post('/managers', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du manager:', error);
      throw error;
    }
  }

  async getManagersByRestaurant(restaurantId: string): Promise<{managers: Manager[], managerCode: string | null}> {
    try {
      const response = await apiClient.get(`/managers/restaurant/${restaurantId}`);
      const anyResponse = response as any;
      return {
        managers: response.data,
        managerCode: anyResponse.manager_code || null
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des managers:', error);
      throw error;
    }
  }

  async updateManager(managerId: string, data: UpdateManagerDto): Promise<Manager> {
    try {
      const response = await apiClient.patch(`/managers/${managerId}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du manager:', error);
      throw error;
    }
  }

  async deactivateManager(managerId: string): Promise<void> {
    try {
      await apiClient.delete(`/managers/${managerId}`);
    } catch (error) {
      console.error('Erreur lors de la désactivation du manager:', error);
      throw error;
    }
  }

  async generateRestaurantCode(restaurantId: string): Promise<string> {
    try {
      const response = await apiClient.post(`/restaurants/${restaurantId}/generate-code`);
      return response.data.code;
    } catch (error) {
      console.error('Erreur lors de la génération du code restaurant:', error);
      throw error;
    }
  }

  async validateRestaurantCode(code: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/restaurants/validate-code', { code });
      return response.data.isValid;
    } catch (error) {
      console.error('Erreur lors de la validation du code restaurant:', error);
      throw error;
    }
  }
}

export const managerService = new ManagerService(); 