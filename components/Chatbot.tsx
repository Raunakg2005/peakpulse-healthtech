'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hi! I\'m your PeakPulse health assistant. How can I help you today?',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getBotResponse = async (userMessage: string): Promise<string> => {
        try {
            // Call Gemini API through our backend
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: messages.slice(-10) // Send last 10 messages for context
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get AI response');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Chatbot error:', error);
            return 'I\'m having trouble connecting right now. Please try again in a moment! 🔄';
        }
    };

    // Fallback responses (if API fails)
    const getFallbackResponse = (userMessage: string): string => {
        const message = userMessage.toLowerCase();

        // Filter inappropriate content
        const inappropriateWords = ['fuck', 'shit', 'damn', 'hell', 'bitch', 'ass', 'bastard', 'dick', 'piss', 'crap'];
        const hasBadWords = inappropriateWords.some(word => message.includes(word));
        
        if (hasBadWords) {
            return '❌ Please keep our conversation respectful and professional. I\'m here to help with your health and wellness! How can I assist you?';
        }

        // Greetings
        if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message === 'hii') {
            return 'Hello! How can I assist you with your health journey today? I can help with sleep, diet, exercise, mental health, and more! 😊';
        }

        // Sleep advice
        if (message.includes('sleep') || message.includes('rest') || message.includes('insomnia')) {
            return '💤 **Sleep Guidelines:**\n\n• Adults (18-64): 7-9 hours per night\n• Exercise improves sleep quality\n• Avoid screens 1 hour before bed\n• Keep bedroom cool (60-67°F)\n• Maintain consistent sleep schedule\n• Limit caffeine after 2 PM\n• Try meditation or deep breathing\n\nHaving trouble sleeping? Track your sleep patterns in our app!';
        }

        // Diet & Nutrition
        if (message.includes('diet') || message.includes('food') || message.includes('eat') || message.includes('nutrition') || message.includes('meal')) {
            return '🥗 **Nutrition Tips:**\n\n• Eat 5-6 small meals daily\n• Fill half your plate with veggies\n• Drink 8-10 glasses of water\n• Limit processed foods & sugar\n• Include lean protein in every meal\n• Eat whole grains over refined carbs\n• Healthy fats: nuts, avocado, olive oil\n\nNeed a meal plan? Use our Calorie Tracker!';
        }

        // Weight loss/gain
        if (message.includes('weight') || message.includes('lose') || message.includes('gain') || message.includes('fat')) {
            return '⚖️ **Weight Management:**\n\n**To Lose Weight:**\n• Create 500 cal deficit daily\n• Combine cardio + strength training\n• Eat more protein & fiber\n• Avoid liquid calories\n\n**To Gain Weight:**\n• Eat 300-500 cal surplus\n• Focus on strength training\n• Eat calorie-dense healthy foods\n• Eat 5-6 meals daily\n\n*Always consult a healthcare professional!*';
        }

        // Exercise & Fitness
        if (message.includes('exercise') || message.includes('workout') || message.includes('fitness') || message.includes('gym') || message.includes('cardio')) {
            return '💪 **Exercise Recommendations:**\n\n• 150 min moderate cardio/week\n• Strength training 2-3x/week\n• Warm up for 5-10 minutes\n• Cool down & stretch after\n• Rest days are important!\n• Mix cardio, strength, flexibility\n• Start slow, progress gradually\n\nCheck out our Challenges to stay motivated!';
        }

        // Mental Health
        if (message.includes('stress') || message.includes('anxiety') || message.includes('mental') || message.includes('depression') || message.includes('mood')) {
            return '🧠 **Mental Wellness:**\n\n• Practice daily meditation (10+ min)\n• Exercise releases endorphins\n• Get 7-9 hours of sleep\n• Connect with friends & family\n• Limit social media time\n• Practice gratitude journaling\n• Deep breathing exercises\n• Seek professional help if needed\n\n*Crisis? Call: 988 (Suicide & Crisis Lifeline)*';
        }

        // Water/Hydration
        if (message.includes('water') || message.includes('hydrat') || message.includes('drink')) {
            return '💧 **Hydration Guide:**\n\n• Drink 8-10 glasses (2-3 liters) daily\n• More if exercising or hot weather\n• Drink before you feel thirsty\n• Add lemon for flavor\n• Limit sugary drinks & alcohol\n• Monitor urine color (pale = good)\n\nTrack your water intake in the app!';
        }

        // Vitamins & Supplements
        if (message.includes('vitamin') || message.includes('supplement') || message.includes('protein')) {
            return '💊 **Supplement Basics:**\n\n**Essential Vitamins:**\n• Vitamin D: 600-800 IU/day\n• Vitamin C: 75-90 mg/day\n• B-Complex: Energy & metabolism\n• Omega-3: Heart & brain health\n\n**Protein:**\n• 0.8g per kg body weight\n• More if very active (1.2-2g/kg)\n\n*Consult doctor before starting supplements!*';
        }

        // Meditation & Mindfulness
        if (message.includes('meditat') || message.includes('mindful') || message.includes('breath')) {
            return '🧘 **Meditation & Mindfulness:**\n\n• Start with 5 minutes daily\n• Focus on breath counting\n• Use guided meditation apps\n• Practice morning or before bed\n• Be patient with yourself\n• Try body scan meditation\n• Mindful walking in nature\n\nTry our meditation challenges!';
        }

        // Heart Health
        if (message.includes('heart') || message.includes('cardio') || message.includes('blood pressure')) {
            return '❤️ **Heart Health Tips:**\n\n• Exercise 30 min daily\n• Limit sodium (<2,300mg/day)\n• Eat omega-3 rich foods\n• Maintain healthy weight\n• Don\'t smoke\n• Manage stress levels\n• Monitor blood pressure regularly\n• Get 7-9 hours sleep\n\nTrack vitals in our Vitals Monitor!';
        }

        // Immunity
        if (message.includes('immun') || message.includes('sick') || message.includes('cold') || message.includes('flu')) {
            return '🛡️ **Boost Your Immunity:**\n\n• Get 7-9 hours quality sleep\n• Eat colorful fruits & vegetables\n• Exercise regularly (moderate)\n• Manage stress effectively\n• Stay hydrated\n• Vitamin C, D, Zinc supplements\n• Wash hands frequently\n• Avoid smoking & excess alcohol';
        }

        // App Features
        if (message.includes('dropout') || message.includes('risk')) {
            return 'Your dropout risk is calculated using our ML models based on your activity patterns, streak, and engagement. Lower is better! Keep maintaining your streak to reduce it.';
        }
        if (message.includes('streak')) {
            return 'Your streak shows how many consecutive days you\'ve been active! Maintain it by completing challenges and logging activities daily. 🔥';
        }
        if (message.includes('challenge')) {
            return 'You can join challenges from the Challenges page. They help you stay motivated and earn points! Would you like me to suggest some?';
        }
        if (message.includes('point') || message.includes('score')) {
            return 'Points are earned by completing activities and challenges. They contribute to your level and unlock badges! Keep going!';
        }
        if (message.includes('quantum')) {
            return 'Our quantum ML model uses hybrid quantum-classical computing for more accurate predictions. Check the Insights page to see it in action!';
        }
        if (message.includes('vitals')) {
            return 'You can track your vital signs like heart rate, blood pressure, and oxygen levels. Regular monitoring helps you stay healthy!';
        }

        // Help menu
        if (message.includes('help') || message.includes('what can you do')) {
            return '🌟 **I can help you with:**\n\n**Health Topics:**\n• Sleep advice & tips\n• Diet & nutrition plans\n• Exercise & fitness routines\n• Mental health & stress\n• Weight management\n• Hydration tips\n• Heart health\n• Immunity boosting\n\n**App Features:**\n• Dropout risk & predictions\n• Streaks & challenges\n• Points & badges\n• Quantum ML insights\n• Vitals tracking\n\nJust ask me anything! 💪';
        }

        // Thanks
        if (message.includes('thank')) {
            return 'You\'re welcome! Keep up the great work on your health journey! 💪 Feel free to ask me anything else!';
        }

        // Default response
        return 'I\'m here to help with your health! Ask me about:\n• Sleep, diet, exercise 💪\n• Mental health & stress 🧠\n• Weight management ⚖️\n• Hydration & nutrition 🥗\n• App features & challenges 🎯\n\nOr type "help" to see everything I can do!';
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        const userInput = inputValue;
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Get AI response
        try {
            const responseText = await getBotResponse(userInput);
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: getFallbackResponse(userInput),
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Button - Fixed Bottom Right */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-4 rounded-full shadow-2xl hover:shadow-teal-500/50 hover:scale-110 transition-all duration-300 animate-bounce"
                >
                    <MessageCircle className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">PeakPulse Assistant</h3>
                                <p className="text-teal-100 text-xs">Always here to help!</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex items-start gap-2 ${
                                    message.sender === 'user' ? 'flex-row-reverse' : ''
                                }`}
                            >
                                <div
                                    className={`p-2 rounded-full ${
                                        message.sender === 'user'
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                            : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                                    }`}
                                >
                                    {message.sender === 'user' ? (
                                        <User className="w-4 h-4 text-white" />
                                    ) : (
                                        <Bot className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <div
                                    className={`flex-1 max-w-[75%] ${
                                        message.sender === 'user' ? 'text-right' : ''
                                    }`}
                                >
                                    <div
                                        className={`inline-block p-3 rounded-2xl ${
                                            message.sender === 'user'
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                : 'bg-white text-slate-800 border border-slate-200'
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 px-2">
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex items-start gap-2">
                                <div className="p-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-white p-3 rounded-2xl border border-slate-200">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-2 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-center">
                            Press Enter to send • Shift + Enter for new line
                        </p>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes delay-100 {
                    animation-delay: 100ms;
                }
                @keyframes delay-200 {
                    animation-delay: 200ms;
                }
            `}</style>
        </>
    );
}
