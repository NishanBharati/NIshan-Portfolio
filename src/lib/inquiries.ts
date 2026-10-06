import { requireSupabase } from './supabase';

export type InquiryStatus = 'new' | 'read' | 'archived';

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  status: InquiryStatus;
  created_at: string;
};

export type InquiryInput = Pick<Inquiry, 'name' | 'email' | 'message'> & { phone?: string; service?: string };

export const INQUIRY_LIMITS = { name: 100, email: 200, phone: 30, message: 5000, messageMin: 10 } as const;

/** Visitors may only insert (no read-back), so this deliberately doesn't `.select()` the new row. */
export async function submitInquiry(input: InquiryInput): Promise<void> {
  const { error } = await requireSupabase()
    .from('inquiries')
    .insert({
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || null,
      service: input.service || null,
      message: input.message.trim(),
    });
  if (error) throw error;
}
