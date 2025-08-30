export interface ChatWithTomasRequest {
  message: string;
  userAddress?: string;
  caseId?: string; // Optional - if not provided, will be created automatically
}
