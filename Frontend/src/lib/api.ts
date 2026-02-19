import { API_BASE_URL } from '@/config/api';


export interface Lab {
  id: string;
  name: string;
  description?: string;
  totalTests?: number;
}

export interface LabTest {
  id: string;
  name: string;
  description?: string;
  price: number | null;
  discounted_price: number | null;
  pinned?: boolean;
}

export interface LabTestsResponse {
  lab: Lab;
  tests: LabTest[];
}

export interface OrderCustomer {
  name: string;
  mobile: string;
  age: string;
  city: string;
}

export interface OrderItemPayload {
  testId: string;
  testName: string;
  labId: string;
  labName: string;
  quantity: number;
  price: number;
  discountedPrice: number;
  pinned?: boolean;
}

export interface OrderTotals {
  original: number;
  final: number;
  planCoverage: number;
}

export interface CreateOrderPayload {
  customer: OrderCustomer;
  preferredDate?: string;
  preferredTime?: string;
  items: OrderItemPayload[];
  totals: OrderTotals;
}

export interface Order extends CreateOrderPayload {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'Received' | 'Pending' | 'Completed';

/**
 * Fetch all available labs from the backend
 */
export async function getLabs(): Promise<Lab[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/labs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch labs: ${response.statusText}`);
    }

    const data = await response.json();
    return data.labs || [];
  } catch (error) {
    console.error('Error fetching labs:', error);
    return [];
  }
}

/**
 * Fetch tests for a specific lab
 */
export async function getLabTests(labId: string): Promise<LabTestsResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/labs/${labId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Lab not found
      }
      throw new Error(`Failed to fetch lab tests: ${response.statusText}`);
    }

    const data = await response.json();
    // Handle both old format (array) and new format (object with lab and tests)
    if (Array.isArray(data)) {
      return { lab: { id: labId, name: '' }, tests: data };
    }
    return data;
  } catch (error) {
    console.error(`Error fetching tests for lab ${labId}:`, error);
    return null;
  }
}

/**
 * Check if a lab has data available in the backend
 */
export async function hasLabData(labId: string): Promise<boolean> {
  const response = await getLabTests(labId);
  return response !== null && Array.isArray(response.tests) && response.tests.length > 0;
}

/**
 * Create a new order
 */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  console.log('📡 [API] Making POST request to:', `${API_BASE_URL}/orders`);
  console.log('📡 [API] Request payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📡 [API] Response status:', response.status);
    console.log('📡 [API] Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [API] Error response:', errorData);
      throw new Error(errorData.message || `Failed to create order: ${response.statusText}`);
    }

    const orderData = await response.json();
    console.log('✅ [API] Order created successfully:', orderData._id);
    return orderData;
  } catch (error) {
    console.error('❌ [API] Network or parsing error:', error);
    throw error;
  }
}

/**
 * Fetch all orders
 */
export async function getOrders(): Promise<Order[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update order status');
  }

  return response.json();
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  serviceType?: string;
  programName?: string;
  status: 'new' | 'contacted' | 'resolved' | 'cancelled';
  createdAt: string;
}

/**
 * Create a new lead/inquiry
 */
export async function createLead(formData: Partial<Lead>): Promise<{ success: boolean; message: string; lead?: Lead }> {
  try {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to submit inquiry");
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || "Inquiry submitted successfully",
      lead: data.lead,
    };
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    throw error;
  }
}

/**
 * Fetch all leads (Admin only)
 */
export async function getLeads(token?: string): Promise<Lead[]> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch leads: ${response.statusText}`);
    }

    const data = await response.json();
    return data.leads || [];
  } catch (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
}

/**
 * Update lead status (Admin only)
 */
export async function updateLeadStatus(leadId: string, status: string, token?: string): Promise<Lead> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/leads/${leadId}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update lead status');
  }

  return response.json();
}

/**
 * Delete order
 */
export async function deleteOrder(orderId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete order');
  }
}

/**
 * Delete lead (Admin only)
 */
export async function deleteLead(leadId: string, token?: string): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete lead');
  }
}

/**
 * Get user orders by email
 */
export async function getUserOrders(mobile: string): Promise<Order[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders?mobile=${encodeURIComponent(mobile)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user orders: ${response.statusText}`);
    }

    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
}

/**
 * Health Card API
 */
export interface HealthCard {
  _id: string;
  userId: string;
  name: string;
  idCard: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  bloodGroup: string;
  organizationName: string;
  employeeId: string;
  healthCardNumber: string;
  qrCode: string;
  issueDate: string;
  validity: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  medicalConditions: string;
  allergies: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthCardPayload {
  name: string;
  idCard: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  bloodGroup?: string;
  organizationName?: string;
  employeeId?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  medicalConditions?: string;
  allergies?: string;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  service?: string;
  message?: string;
  preferredDate?: string;
  preferredTime?: string;
}

/**
 * Get user's health card
 */
export async function getHealthCard(token: string): Promise<HealthCard | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/health-card`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch health card: ${response.statusText}`);
    }

    const data = await response.json();
    return data.healthCard;
  } catch (error) {
    console.error('Error fetching health card:', error);
    throw error;
  }
}

/**
 * Create or update health card
 */
export async function createOrUpdateHealthCard(
  payload: CreateHealthCardPayload,
  token: string
): Promise<HealthCard> {
  try {
    const response = await fetch(`${API_BASE_URL}/health-card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to save health card');
    }

    const data = await response.json();
    return data.healthCard;
  } catch (error) {
    console.error('Error saving health card:', error);
    throw error;
  }
}

/**
 * Download health card as PDF
 */
export async function downloadHealthCard(
  token: string
): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/health-card/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to download PDF');
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error downloading health card as PDF:', error);
    throw error;
  }
}

/**
 * Submit booking form
 */
export async function submitBookingForm(formData: BookingFormData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/booking/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to submit booking form');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting booking form:', error);
    throw error;
  }
}

/**
 * Chat with AI assistant
 */
export async function chatWithAI(message: string, history: any[] = []): Promise<{ response: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get AI response');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error chatting with AI:', error);
    throw error;
  }
}


