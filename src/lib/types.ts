export interface Violation {
  id: string;
  text: string;
  type: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Suggestions {
  [key: string]: string[];
} 