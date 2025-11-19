/**
 * Admin API helper functions
 * Centralized API calls for the content control admin panel
 */

// Content Management APIs
export async function getPastPapers(params?: { subject?: string; year?: string; limit?: number; offset?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.subject) queryParams.append('subject', params.subject);
  if (params?.year) queryParams.append('year', params.year);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const response = await fetch(`/api/admin/content/past-papers?${queryParams}`);
  return response.json();
}

export async function uploadPastPaper(formData: FormData) {
  const response = await fetch('/api/admin/content/past-papers', {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

export async function updatePastPaper(paperId: string, updates: any) {
  const response = await fetch('/api/admin/content/past-papers', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paperId, ...updates }),
  });
  return response.json();
}

export async function deletePastPaper(paperId: string) {
  const response = await fetch(`/api/admin/content/past-papers?paperId=${paperId}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function getPracticeQuestions(params?: { subject?: string; grade?: string; topic?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.subject) queryParams.append('subject', params.subject);
  if (params?.grade) queryParams.append('grade', params.grade);
  if (params?.topic) queryParams.append('topic', params.topic);

  const response = await fetch(`/api/admin/content/practice-questions?${queryParams}`);
  return response.json();
}

export async function createPracticeQuestion(data: any) {
  const response = await fetch('/api/admin/content/practice-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getWeeklyTasks(params?: { grade?: string; subject?: string; week?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.grade) queryParams.append('grade', params.grade);
  if (params?.subject) queryParams.append('subject', params.subject);
  if (params?.week) queryParams.append('week', params.week);

  const response = await fetch(`/api/admin/content/weekly-tasks?${queryParams}`);
  return response.json();
}

export async function createWeeklyTask(data: any) {
  const response = await fetch('/api/admin/content/weekly-tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getSubjectAvailability() {
  const response = await fetch('/api/admin/content/subject-availability');
  return response.json();
}

export async function updateSubjectAvailability(availability: Record<string, string[]>) {
  const response = await fetch('/api/admin/content/subject-availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ availability }),
  });
  return response.json();
}

// System Settings APIs
export async function getSystemSettings() {
  const response = await fetch('/api/admin/system/settings');
  return response.json();
}

export async function updateSystemSettings(section: string, data: any) {
  const response = await fetch('/api/admin/system/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, data }),
  });
  return response.json();
}

export async function getAnnouncements(active?: boolean) {
  const queryParams = new URLSearchParams();
  if (active !== undefined) queryParams.append('active', active.toString());

  const response = await fetch(`/api/admin/system/announcements?${queryParams}`);
  return response.json();
}

export async function createAnnouncement(data: any) {
  try {
    const response = await fetch('/api/admin/system/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
      return { success: false, error: errorData.error || `HTTP ${response.status}` };
    }
    
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Network error creating announcement:', error);
    return { success: false, error: error.message || 'Network error: Failed to create announcement' };
  }
}

export async function updateAnnouncement(announcementId: string, updates: any) {
  const response = await fetch('/api/admin/system/announcements', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ announcementId, ...updates }),
  });
  return response.json();
}

export async function deleteAnnouncement(announcementId: string) {
  const response = await fetch(`/api/admin/system/announcements?announcementId=${announcementId}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function deleteAnnouncements(announcementIds: string[]) {
  const response = await fetch('/api/admin/system/announcements', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ announcementIds }),
  });
  return response.json();
}

// User Management APIs
export async function getUsers(params?: { search?: string; limit?: number; offset?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const response = await fetch(`/api/admin/users/list?${queryParams}`);
  return response.json();
}

export async function exportUsers(userId: string, format: 'csv' | 'json' = 'csv') {
  const response = await fetch('/api/admin/users/list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, format }),
  });
  return response;
}

export async function applyRestriction(data: { userId?: string; email?: string; restrictionType: string; reason: string; adminId: string }) {
  const response = await fetch('/api/admin/users/restrictions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getRestrictions(userId?: string, email?: string) {
  const queryParams = new URLSearchParams();
  if (userId) queryParams.append('userId', userId);
  if (email) queryParams.append('email', email);

  const response = await fetch(`/api/admin/users/restrictions?${queryParams}`);
  return response.json();
}

export async function removeRestriction(restrictionId?: string, userId?: string) {
  const queryParams = new URLSearchParams();
  if (restrictionId) queryParams.append('restrictionId', restrictionId);
  if (userId) queryParams.append('userId', userId);

  const response = await fetch(`/api/admin/users/restrictions?${queryParams}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function getUserActivity(userId?: string, email?: string) {
  const queryParams = new URLSearchParams();
  if (userId) queryParams.append('userId', userId);
  if (email) queryParams.append('email', email);

  const response = await fetch(`/api/admin/users/activity?${queryParams}`);
  return response.json();
}

export async function resetPassword(email: string, newPassword: string) {
  const response = await fetch('/api/admin/users/password-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  });
  return response.json();
}

// Analytics APIs
export async function getDBEAccess() {
  const response = await fetch('/api/admin/analytics/dbe-access');
  return response.json();
}

export async function updateDBEAccess(enabled: boolean, authorizedUsers: string[]) {
  const response = await fetch('/api/admin/analytics/dbe-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled, authorizedUsers }),
  });
  return response.json();
}

export async function generateReport(data: { reportType: string; startDate: string; endDate: string; format: string }) {
  const response = await fetch('/api/admin/analytics/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response;
}

export async function getAccessRoles() {
  const response = await fetch('/api/admin/analytics/access-roles');
  return response.json();
}

export async function updateAccessRole(data: { userId?: string; email?: string; role: string; adminId: string }) {
  const response = await fetch('/api/admin/analytics/access-roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Compliance APIs
export async function getPOPIARequests() {
  const response = await fetch('/api/admin/compliance/popia');
  return response.json();
}

export async function processPOPIARequest(requestId: string, action: 'approve' | 'reject', adminId: string, reason?: string) {
  const response = await fetch('/api/admin/compliance/popia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, action, adminId, reason }),
  });
  return response.json();
}

export async function getStorageStats() {
  const response = await fetch('/api/admin/compliance/storage');
  return response.json();
}

export async function getAuditLogs(params?: { startDate?: string; endDate?: string; logType?: string; format?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.logType) queryParams.append('logType', params.logType);
  if (params?.format) queryParams.append('format', params.format);

  const response = await fetch(`/api/admin/compliance/audit-logs?${queryParams}`);
  return response;
}

// Integration APIs
export async function getEmailSmsConfig() {
  const response = await fetch('/api/admin/integrations/email-sms');
  return response.json();
}

export async function updateEmailSmsConfig(email: any, sms: any, userId: string) {
  const response = await fetch('/api/admin/integrations/email-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, sms, userId }),
  });
  return response.json();
}

export async function getAPIKeys() {
  const response = await fetch('/api/admin/integrations/api-keys');
  return response.json();
}

export async function createAPIKey(data: { serviceName: string; apiKey: string; description: string; active: boolean; userId: string }) {
  const response = await fetch('/api/admin/integrations/api-keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateAPIKey(keyId: string, updates: any) {
  const response = await fetch('/api/admin/integrations/api-keys', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyId, ...updates }),
  });
  return response.json();
}

export async function deleteAPIKey(keyId: string) {
  const response = await fetch(`/api/admin/integrations/api-keys?keyId=${keyId}`, {
    method: 'DELETE',
  });
  return response.json();
}

