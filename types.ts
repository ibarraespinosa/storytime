
export interface Scene {
  id: string;
  description: string;
  imageUrl: string | null;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}
