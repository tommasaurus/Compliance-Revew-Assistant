export interface Violation {
  id: string;
  text: string;
  start: number;
  end: number;
  length: number;
  type: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
} 