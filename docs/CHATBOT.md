# 🤖 AI Chatbot Documentation

## Overview

PeakPulse features an intelligent AI health assistant powered by **Groq API** using the **Llama 3.3 70B** model. The chatbot provides personalized health advice, answers wellness questions, and helps users navigate app features.

---

## ✨ Features

### Health Topics Covered
- 💤 **Sleep & Rest** - Sleep hygiene, duration recommendations
- 🥗 **Nutrition & Diet** - Meal planning, dietary advice
- 🏃 **Exercise & Fitness** - Workout routines, activity guidance
- 🧠 **Mental Health** - Stress management, mindfulness tips
- ⚖️ **Weight Management** - Healthy weight loss/gain strategies
- 💧 **Hydration** - Daily water intake recommendations
- 💊 **Vitamins & Supplements** - Nutritional guidance
- ❤️ **Heart Health** - Cardiovascular wellness
- 🛡️ **Immunity** - Immune system support

### App Features Assistance
- Explains streak system and badges
- Guides through challenges
- Interprets ML predictions
- Helps with goal setting
- Troubleshoots common issues

---

## 🔧 Technical Implementation

### Architecture
```
User Input → Chatbot Component → API Route → Groq API → Llama 3.3 70B → Response
```

### API Configuration

**Model:** `llama-3.3-70b-versatile`
- **Context:** Last 6 messages for conversation continuity
- **Temperature:** 0.7 (balanced creativity/accuracy)
- **Max Tokens:** 300 (concise responses)
- **Top P:** 0.95 (diverse word selection)

### System Prompt
```
You are PeakPulse Health Assistant. Answer naturally and conversationally. 
If the user asks about health, fitness, nutrition, mental health, sleep, 
exercise, or app features, provide helpful advice. If they ask about 
non-health topics, politely say "I can only assist with health and wellness 
questions. How can I help with your health goals?" Keep responses concise 
and friendly.
```

---

## 📡 API Endpoint

### Chat Request
```http
POST /api/chatbot
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "How much sleep should I get?",
  "conversationHistory": [
    {
      "sender": "user",
      "text": "Hello"
    },
    {
      "sender": "bot",
      "text": "Hi! I'm your PeakPulse health assistant. How can I help you today?"
    }
  ]
}
```

**Response:**
```json
{
  "response": "Most adults need 7-9 hours of sleep per night for optimal health. Establish a consistent sleep schedule by going to bed and waking up at the same time daily, even on weekends. Create a relaxing bedtime routine and keep your bedroom cool, dark, and quiet."
}
```

**Error Response:**
```json
{
  "error": "Failed to get response from AI",
  "details": "Rate limit exceeded",
  "status": 429
}
```

---

## 🎨 Frontend Component

### Component Location
`components/Chatbot.tsx`

### Usage
```tsx
import Chatbot from '@/components/Chatbot';

// Automatically included in app/layout.tsx
<Chatbot />
```

### Features
- Fixed bottom-right position
- Bounce animation on open/close
- Typing indicator during AI response
- Auto-scroll to latest message
- Message timestamps
- Smooth transitions

### Customization
```tsx
// Modify appearance in Chatbot.tsx
const [isOpen, setIsOpen] = useState(false);  // Default closed
const maxMessages = 50;  // Message history limit
```

---

## 🔐 Environment Setup

### Required API Key

**Groq API** (Free Tier):
- Sign up: https://console.groq.com/
- Create API key
- 30 requests/minute
- 14,400 requests/day

**Add to `.env.local`:**
```env
GROQ_API_KEY=gsk_your_api_key_here
```

### Alternative AI Providers

If switching from Groq:

**OpenAI:**
```env
OPENAI_API_KEY=sk-your-key
# Update route.ts to use OpenAI API
```

**Anthropic Claude:**
```env
ANTHROPIC_API_KEY=sk-ant-your-key
# Update route.ts to use Claude API
```

**Google Gemini:**
```env
GEMINI_API_KEY=AIza-your-key
# Already configured in codebase (quota issues)
```

---

## 💬 Example Conversations

### Greeting
```
User: Hi!
Bot: Hello! I'm your PeakPulse health assistant. How can I help you today?
```

### Health Advice
```
User: I'm feeling stressed, what should I do?
Bot: Try these stress management techniques: 1) Practice deep breathing 
exercises (4-7-8 technique), 2) Take a 10-minute walk outdoors, and 
3) Try progressive muscle relaxation. Our app also has guided meditation 
sessions that can help!
```

### App Features
```
User: What are streaks?
Bot: Streaks track consecutive days you're active on PeakPulse! Log 
activities, complete challenges, or engage with the community daily to 
maintain your streak. You'll earn special badges at 7, 30, 100, and 
365-day milestones!
```

### Out of Scope
```
User: What's the weather today?
Bot: I can only assist with health and wellness questions. How can I 
help with your health goals?
```

---

## 📊 Performance

### Response Times
- Average: 1-2 seconds
- 95th percentile: 3 seconds
- Timeout: 30 seconds

### Rate Limits
- **Free Tier:** 30 requests/minute
- **Paid Tier:** Higher limits available
- Automatic retry on 429 errors

### Caching
- No caching (real-time personalized responses)
- Consider implementing Redis cache for common queries

---

## 🐛 Error Handling

### Common Errors

**1. API Key Missing/Invalid (500)**
```json
{
  "error": "Groq API key not configured"
}
```
**Solution:** Check `.env.local` has correct key

**2. Rate Limit Exceeded (429)**
```json
{
  "error": "Failed to get response from AI",
  "status": 429
}
```
**Solution:** Wait 60 seconds or upgrade to paid tier

**3. Network Timeout (408)**
```json
{
  "error": "Request timeout"
}
```
**Solution:** Retry request or check network connection

**4. Invalid Request (400)**
```json
{
  "error": "Invalid message format"
}
```
**Solution:** Ensure message is non-empty string

### Frontend Error Recovery
```tsx
// Automatic fallback in Chatbot.tsx
catch (error) {
    console.error('Chat error:', error);
    addMessage({
        text: "I'm having trouble connecting. Please try again.",
        sender: 'bot',
        timestamp: new Date()
    });
}
```

---

## 🧪 Testing

### Manual Testing
1. Open app at http://localhost:3000
2. Click chatbot icon (bottom-right)
3. Try these test queries:
   - "How much water should I drink?"
   - "Give me a workout routine"
   - "Explain ML predictions"
   - "What's the weather?" (should decline)

### Automated Testing
```bash
# Test chatbot API endpoint
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "conversationHistory": []
  }'
```

### Load Testing
```bash
# Test rate limits
for i in {1..35}; do
  curl -X POST http://localhost:3000/api/chatbot \
    -H "Content-Type: application/json" \
    -d '{"message": "Hi", "conversationHistory": []}' &
done
```

---

## 🎯 Best Practices

### For Users
- Ask specific questions for better responses
- Provide context when needed
- Check app features section for technical help
- Remember: Not a substitute for medical advice

### For Developers
- Monitor API usage to avoid rate limits
- Log errors for debugging
- Update system prompt as features evolve
- Consider A/B testing different prompts
- Implement analytics for popular queries

---

## 📈 Analytics & Monitoring

### Tracked Metrics
- Total messages sent
- Average response time
- Error rate by type
- Most common queries
- User satisfaction (future feature)

### Monitoring Dashboard
```typescript
// Future implementation
interface ChatbotMetrics {
  totalMessages: number;
  avgResponseTime: number;
  errorRate: number;
  popularTopics: string[];
  activeUsers: number;
}
```

---

## 🚀 Future Enhancements

### Planned Features
- ✅ Basic Q&A (Completed)
- ✅ Conversation history (Completed)
- 🔄 Voice input/output
- 📋 Save favorite responses
- 🎯 Personalized recommendations
- 📊 Integration with user health data
- 🔔 Proactive health tips
- 🌍 Multi-language support
- 📱 Mobile app chatbot
- 🤝 Connect with human coaches

### Advanced Capabilities
- Context awareness (knows user's goals)
- Image analysis (food photos for nutrition)
- Video exercise demonstrations
- Integration with wearables data
- Predictive health insights
- Emergency detection and alerts

---

## 🔒 Privacy & Security

### Data Handling
- Messages not stored permanently
- Conversation history cleared on logout
- No personal health data sent to AI
- GDPR compliant
- HIPAA considerations for future

### User Controls
- Can clear chat history anytime
- Option to disable chatbot
- No data sharing with third parties
- Transparent AI usage disclosure

---

## 📚 Resources

### API Documentation
- [Groq API Docs](https://console.groq.com/docs)
- [Llama 3.3 Model Card](https://huggingface.co/meta-llama/Llama-3.3-70B)
- [Chat Completions API](https://console.groq.com/docs/api-reference)

### Related Files
- `app/api/chatbot/route.ts` - Backend API
- `components/Chatbot.tsx` - Frontend component
- `.env.local` - Environment configuration

### Support
- Technical issues: File GitHub issue
- API key problems: Check Groq console
- Feature requests: Contact dev team

---

**Last Updated:** December 7, 2025  
**Status:** ✅ Fully Operational  
**Model:** Llama 3.3 70B via Groq API  
**Free Tier:** 30 req/min, 14,400 req/day
