import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const service = vi.hoisted(() => ({
  getAdminSections: vi.fn(),
  createSection: vi.fn(),
  updateSection: vi.fn(),
  reorderSections: vi.fn(),
  deleteSection: vi.fn(),
}));

vi.mock('@/features/admin-auth/auth', () => ({
  requireSession: () => null,
}));

vi.mock('@/features/biography/server', () => ({
  biographyService: service,
  BiographySectionNotFoundError: class BiographySectionNotFoundError extends Error {},
  BiographyValidationError: class BiographyValidationError extends Error {},
  isBiographyHeadingLevel: (value: unknown) => value === 'large' || value === 'medium' || value === 'small',
}));

import { GET, PATCH, POST } from './biography-route';

describe('admin biography route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the admin sections', async () => {
    service.getAdminSections.mockResolvedValue([]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ sections: [] });
  });

  it('rejects an invalid section payload', async () => {
    const request = new NextRequest('http://localhost/api/admin/bio', {
      method: 'POST',
      body: JSON.stringify({ bodyText: 123, headingLevel: 'large', isActive: true }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(service.createSection).not.toHaveBeenCalled();
  });

  it('creates a valid section', async () => {
    const section = { id: 2, bodyText: 'Texto' };
    service.createSection.mockResolvedValue(section);
    const request = new NextRequest('http://localhost/api/admin/bio', {
      method: 'POST',
      body: JSON.stringify({ subtitle: 'Formación', bodyText: 'Texto', headingLevel: 'large', isActive: true }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ section });
    expect(service.createSection).toHaveBeenCalledWith({
      subtitle: 'Formación',
      bodyText: 'Texto',
      headingLevel: 'large',
      isActive: true,
    });
  });

  it('rejects a reorder payload that is not an array', async () => {
    const request = new NextRequest('http://localhost/api/admin/bio', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds: '1,2' }),
    });

    const response = await PATCH(request);

    expect(response.status).toBe(400);
    expect(service.reorderSections).not.toHaveBeenCalled();
  });
});
