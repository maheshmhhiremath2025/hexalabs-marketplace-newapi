'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hi! 👋 Welcome to Hexalabs support. How can I help you today?',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessageText = inputMessage;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text: userMessageText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            // Call AI API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessageText }),
            });

            const data = await response.json();

            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response || 'I apologize, but I\'m having trouble responding right now. Please contact support@hexalabs.com for assistance.',
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error('Chat error:', error);

            // Fallback response on error
            const errorResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: 'I\'m having trouble connecting right now. For immediate assistance, please contact our support team at support@hexalabs.com or call +91 88849 07660.',
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages]);

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50"
                    aria-label="Open chat"
                >
                    <MessageCircle className="h-6 w-6" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <MessageCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Hexalabs Support</h3>
                                <p className="text-xs text-blue-100">Online • Typically replies instantly</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 p-1 rounded transition-colors"
                            aria-label="Close chat"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        id="chat-messages"
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                    >
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-800 border border-gray-200'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                    <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                                        }`}>
                                        {message.timestamp.toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-lg p-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim()}
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Send message"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            For urgent issues, email support@hexalabs.com
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
