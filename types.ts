export enum AppView {
    Chat = 'chat',
    Build = 'build',
    Debug = 'debug',
    Image = 'image',
}

export enum MessageSender {
    User = 'user',
    AI = 'ai',
}

export interface ChatMessage {
    sender: MessageSender;
    text: string;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
}