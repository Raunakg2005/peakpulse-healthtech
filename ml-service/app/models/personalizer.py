"""
Personalization Engine
- Motivation Message Generator
- Difficulty Calibrator
- Reward Timing Optimizer
"""

import numpy as np
from typing import Dict, List
import random
import logging

logger = logging.getLogger(__name__)

class MotivationGenerator:
    def __init__(self):
        """Initialize motivation message generator."""
        self.message_templates = self._load_templates()
        self.tone_styles = ["encouraging", "celebratory", "challenging", "supportive"]
    
    def _load_templates(self) -> Dict[str, List[str]]:
        """Load message templates by context."""
        return {
            "daily_encouragement": [
                "You're making amazing progress, {name}! {streak_msg}",
                "Today is a new opportunity to grow stronger. {achievement}",
                "Your dedication to {favorite_activity} is inspiring!",
                "Small steps lead to big changes. Keep going! {progress}",
                "You've got this! {recent_win}"
            ],
            "streak_celebration": [
                "🎉 {streak} days strong! You're unstoppable!",
                "Wow! {streak} consecutive days - that's commitment!",
                "Your {streak}-day streak shows true dedication!",
                "Consistency is key, and you're nailing it with {streak} days!"
            ],
            "comeback": [
                "Welcome back! Ready to crush your goals again?",
                "Every champion has setbacks. Your comeback starts today!",
                "You're stronger than you think. Let's restart together!",
                "Missing you! Let's get back on track with something fun."
            ],
            "challenge_complete": [
                "Challenge crushed! You earned {points} points! 💪",
                "Incredible work on '{challenge_name}'! {reward}",
                "You did it! That's {points} points closer to your goal!",
                "Outstanding! '{challenge_name}' is complete! 🌟"
            ],
            "milestone": [
                "🏆 Milestone unlocked: {milestone}!",
                "You've reached {milestone} - what an achievement!",
                "Major accomplishment: {milestone} achieved!",
                "Celebrating your {milestone} milestone! 🎊"
            ]
        }
    
    def generate(self, user_profile: Dict, context: str = "daily_encouragement") -> Dict:
        """
        Generate personalized motivation message.
        
        Args:
            user_profile: User data for personalization
            context: Message context (daily, streak, comeback, etc.)
            
        Returns:
            Message with tone and personalization score
        """
        try:
            # Select appropriate template
            templates = self.message_templates.get(context, 
                                                   self.message_templates["daily_encouragement"])
            template = random.choice(templates)
            
            # Personalize message
            message = self._personalize_message(template, user_profile)
            
            # Determine tone
            tone = self._select_tone(user_profile, context)
            
            # Calculate personalization score
            score = self._calculate_personalization_score(user_profile)
            
            return {
                "message": message,
                "tone": tone,
                "personalization_score": round(score, 3)
            }
            
        except Exception as e:
            logger.error(f"Error generating motivation: {str(e)}")
            return {
                "message": "Keep up the great work!",
                "tone": "encouraging",
                "personalization_score": 0.5
            }
    
    def _personalize_message(self, template: str, profile: Dict) -> str:
        """Fill template with personalized data."""
        replacements = {
            "{name}": "Champion",  # Default, would use actual name from profile
            "{streak}": str(profile.get("meditation_streak", 1)),
            "{streak_msg}": self._get_streak_message(profile.get("meditation_streak", 0)),
            "{achievement}": self._get_recent_achievement(profile),
            "{favorite_activity}": self._get_favorite_activity(profile),
            "{progress}": self._get_progress_message(profile),
            "{recent_win}": self._get_recent_win(profile),
            "{points}": str(random.randint(50, 200)),
            "{challenge_name}": "Morning Meditation",
            "{reward}": "You're on fire!",
            "{milestone}": self._get_milestone(profile)
        }
        
        message = template
        for placeholder, value in replacements.items():
            if placeholder in message:
                message = message.replace(placeholder, value)
        
        return message
    
    def _get_streak_message(self, streak: int) -> str:
        """Generate streak-specific message."""
        if streak >= 30:
            return f"Your {streak}-day streak is phenomenal!"
        elif streak >= 7:
            return f"{streak} days in a row - that's the spirit!"
        elif streak >= 3:
            return f"Keep that {streak}-day momentum going!"
        else:
            return "Let's build an amazing streak together!"
    
    def _get_recent_achievement(self, profile: Dict) -> str:
        """Get recent achievement message."""
        completion_rate = profile.get("challenge_completion_rate", 0.5)
        if completion_rate > 0.8:
            return "Your 80%+ completion rate is outstanding!"
        elif completion_rate > 0.6:
            return "You're completing challenges consistently!"
        else:
            return "Every completion brings you closer to your goals!"
    
    def _get_favorite_activity(self, profile: Dict) -> str:
        """Determine favorite activity from profile."""
        # In production, analyze activity history
        activities = ["meditation", "exercise", "healthy eating", "hydration"]
        return random.choice(activities)
    
    def _get_progress_message(self, profile: Dict) -> str:
        """Generate progress message."""
        days_active = profile.get("days_active", 1)
        return f"You've been active for {days_active} days!"
    
    def _get_recent_win(self, profile: Dict) -> str:
        """Get recent win message."""
        steps = profile.get("avg_steps_last_7_days", 0)
        if steps > 8000:
            return f"Your {int(steps)} average steps are impressive!"
        else:
            return "You're building great habits!"
    
    def _get_milestone(self, profile: Dict) -> str:
        """Get milestone achievement."""
        milestones = [
            "100 points earned",
            "1 week active",
            "First challenge completed",
            "5 streaks maintained",
            "Community contributor"
        ]
        return random.choice(milestones)
    
    def _select_tone(self, profile: Dict, context: str) -> str:
        """Select appropriate tone based on user profile and context."""
        social_score = profile.get("social_engagement_score", 0.5)
        
        if context == "streak_celebration" or context == "milestone":
            return "celebratory"
        elif context == "comeback":
            return "supportive"
        elif social_score > 0.7:
            return "challenging"  # Engaged users respond to challenges
        else:
            return "encouraging"
    
    def _calculate_personalization_score(self, profile: Dict) -> float:
        """Calculate how personalized the message is."""
        score = 0.5  # Base score
        
        # Increase based on data availability
        if profile.get("meditation_streak", 0) > 0:
            score += 0.1
        if profile.get("days_active", 0) > 7:
            score += 0.1
        if profile.get("challenge_completion_rate", 0) > 0:
            score += 0.15
        if profile.get("avg_steps_last_7_days", 0) > 0:
            score += 0.1
        if len(profile.get("preferred_activity_times", [])) > 0:
            score += 0.05
        
        return min(1.0, score)


class DifficultyCalibrator:
    def __init__(self):
        """Initialize difficulty calibrator."""
        self.difficulty_levels = {
            1: "Very Easy",
            2: "Easy",
            3: "Medium",
            4: "Hard",
            5: "Very Hard"
        }
    
    def calibrate(
        self, 
        completion_rate: float, 
        current_difficulty: int, 
        user_engagement: float
    ) -> Dict:
        """
        Calibrate challenge difficulty based on performance.
        
        Args:
            completion_rate: Historical completion rate (0-1)
            current_difficulty: Current difficulty level (1-5)
            user_engagement: Overall engagement score (0-1)
            
        Returns:
            Recommended difficulty with reasoning
        """
        try:
            # Calculate adjustment
            adjustment = self._calculate_adjustment(
                completion_rate, 
                current_difficulty, 
                user_engagement
            )
            
            # Apply adjustment
            new_difficulty = max(1, min(5, current_difficulty + adjustment))
            
            # Get reasoning
            reasoning = self._get_calibration_reasoning(
                completion_rate, 
                adjustment, 
                new_difficulty
            )
            
            # Calculate confidence
            confidence = self._calculate_confidence(completion_rate, user_engagement)
            
            return {
                "new_difficulty": int(new_difficulty),
                "adjustment": adjustment,
                "reasoning": reasoning,
                "confidence": round(confidence, 3)
            }
            
        except Exception as e:
            logger.error(f"Error calibrating difficulty: {str(e)}")
            return {
                "new_difficulty": current_difficulty,
                "adjustment": 0,
                "reasoning": "Maintaining current difficulty",
                "confidence": 0.5
            }
    
    def _calculate_adjustment(
        self, 
        completion_rate: float, 
        current_difficulty: int, 
        engagement: float
    ) -> int:
        """Calculate difficulty adjustment."""
        # High performers should increase difficulty
        if completion_rate > 0.85 and engagement > 0.7:
            if current_difficulty < 5:
                return 1
        
        # Struggling users should decrease difficulty
        elif completion_rate < 0.5 and current_difficulty > 1:
            return -1
        
        # Moderate performers with low engagement
        elif completion_rate < 0.6 and engagement < 0.5 and current_difficulty > 1:
            return -1
        
        # Otherwise, maintain current level
        return 0
    
    def _get_calibration_reasoning(
        self, 
        completion_rate: float, 
        adjustment: int, 
        new_difficulty: int
    ) -> str:
        """Generate reasoning for difficulty adjustment."""
        if adjustment > 0:
            return f"Your {completion_rate*100:.0f}% completion rate shows you're ready for more challenge!"
        elif adjustment < 0:
            return f"Adjusting to difficulty {new_difficulty} to rebuild confidence and consistency"
        else:
            return f"Current difficulty level is optimal for your performance pattern"
    
    def _calculate_confidence(self, completion_rate: float, engagement: float) -> float:
        """Calculate confidence in the recommendation."""
        # High confidence when we have clear signals
        if completion_rate > 0.8 or completion_rate < 0.4:
            base_confidence = 0.85
        else:
            base_confidence = 0.65
        
        # Adjust based on engagement
        engagement_factor = engagement * 0.15
        
        return min(1.0, base_confidence + engagement_factor)
