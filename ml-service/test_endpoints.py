"""
Test the ML Service endpoints
"""

import requests
import json

# Base URL for ML service
BASE_URL = "http://127.0.0.1:8000"

def test_health_check():
    """Test the health endpoint."""
    print("\n🔍 Testing health check endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_service_info():
    """Test the root endpoint."""
    print("\n🔍 Testing service info endpoint...")
    response = requests.get(BASE_URL)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_recommend_challenge():
    """Test challenge recommendation endpoint."""
    print("\n🔍 Testing challenge recommendation...")
    
    # Sample user profile
    user_profile = {
        "user_id": "test_user_001",
        "days_active": 30,
        "avg_steps_last_7_days": 8500.0,
        "meditation_streak": 10,
        "challenge_completion_rate": 0.75,
        "social_engagement_score": 0.6,
        "preferred_activity_times": ["morning", "evening"],
        "response_rate_to_notifications": 0.8,
        "mood_correlation_with_exercise": 0.7
    }
    
    response = requests.post(f"{BASE_URL}/api/recommend-challenge", json=user_profile)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        recommendations = response.json()
        print(f"\n✅ Got {len(recommendations)} recommendations:")
        for i, rec in enumerate(recommendations, 1):
            print(f"\n{i}. {rec['challenge_name']}")
            print(f"   Confidence: {rec['confidence_score']:.3f}")
            print(f"   Difficulty: {rec['difficulty_level']}/5")
            print(f"   Reasoning: {rec['reasoning']}")
        return True
    else:
        print(f"❌ Error: {response.text}")
        return False

def test_predict_dropout():
    """Test dropout prediction endpoint."""
    print("\n🔍 Testing dropout prediction...")
    
    user_profile = {
        "user_id": "test_user_001",
        "days_active": 15,
        "avg_steps_last_7_days": 4000.0,
        "meditation_streak": 3,
        "challenge_completion_rate": 0.40,
        "social_engagement_score": 0.3,
        "preferred_activity_times": ["evening"],
        "response_rate_to_notifications": 0.5,
        "mood_correlation_with_exercise": 0.5
    }
    
    response = requests.post(f"{BASE_URL}/api/predict-dropout", json=user_profile)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        prediction = response.json()
        print(f"\n✅ Dropout Prediction:")
        print(f"   Probability: {prediction['dropout_probability']:.3f}")
        print(f"   Risk Level: {prediction['risk_level'].upper()}")
        print(f"   Days until predicted dropout: {prediction['days_until_predicted_dropout']}")
        print(f"   Recommended interventions:")
        for intervention in prediction['recommended_interventions']:
            print(f"     • {intervention}")
        return True
    else:
        print(f"❌ Error: {response.text}")
        return False

def test_predict_streak():
    """Test streak prediction endpoint."""
    print("\n🔍 Testing streak prediction...")
    
    user_profile = {
        "user_id": "test_user_001",
        "days_active": 25,
        "avg_steps_last_7_days": 7500.0,
        "meditation_streak": 15,
        "challenge_completion_rate": 0.70,
        "social_engagement_score": 0.65,
        "preferred_activity_times": ["morning"],
        "response_rate_to_notifications": 0.75,
        "mood_correlation_with_exercise": 0.65
    }
    
    response = requests.post(f"{BASE_URL}/api/predict-streak", json=user_profile)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        prediction = response.json()
        print(f"\n✅ Streak Prediction:")
        print(f"   Current streak: {prediction['current_streak']} days")
        print(f"   Break probability: {prediction['streak_break_probability']:.3f}")
        print(f"   Recommended actions:")
        for action in prediction['recommended_actions']:
            print(f"     • {action}")
        return True
    else:
        print(f"❌ Error: {response.text}")
        return False

def test_generate_motivation():
    """Test motivation message generation."""
    print("\n🔍 Testing motivation message generation...")
    
    user_profile = {
        "user_id": "test_user_001",
        "days_active": 45,
        "avg_steps_last_7_days": 9500.0,
        "meditation_streak": 20,
        "challenge_completion_rate": 0.85,
        "social_engagement_score": 0.75,
        "preferred_activity_times": ["morning", "afternoon"],
        "response_rate_to_notifications": 0.90,
        "mood_correlation_with_exercise": 0.80
    }
    
    response = requests.post(f"{BASE_URL}/api/generate-motivation", json=user_profile)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        message = response.json()
        print(f"\n✅ Motivation Message:")
        print(f"   Message: \"{message['message']}\"")
        print(f"   Tone: {message['tone']}")
        print(f"   Personalization Score: {message['personalization_score']:.3f}")
        return True
    else:
        print(f"❌ Error: {response.text}")
        return False

def test_calibrate_difficulty():
    """Test difficulty calibration."""
    print("\n🔍 Testing difficulty calibration...")
    
    payload = {
        "user_id": "test_user_001",
        "days_active": 30,
        "avg_steps_last_7_days": 10000.0,
        "meditation_streak": 25,
        "challenge_completion_rate": 0.90,
        "social_engagement_score": 0.80,
        "preferred_activity_times": ["morning"],
        "response_rate_to_notifications": 0.85,
        "mood_correlation_with_exercise": 0.75,
        "current_difficulty": 3
    }
    
    response = requests.post(f"{BASE_URL}/api/calibrate-difficulty", json=payload)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n✅ Difficulty Calibration:")
        print(f"   Current difficulty: {result['current_difficulty']}/5")
        print(f"   Recommended difficulty: {result['recommended_difficulty']}/5")
        print(f"   Reasoning: {result['reasoning']}")
        print(f"   Confidence: {result['confidence']:.3f}")
        return True
    else:
        print(f"❌ Error: {response.text}")
        return False


def run_all_tests():
    """Run all tests."""
    print("="*60)
    print("🚀 ML SERVICE TEST SUITE")
    print("="*60)
    
    tests = [
        ("Health Check", test_health_check),
        ("Service Info", test_service_info),
        ("Challenge Recommendations", test_recommend_challenge),
        ("Dropout Prediction", test_predict_dropout),
        ("Streak Prediction", test_predict_streak),
        ("Motivation Generation", test_generate_motivation),
        ("Difficulty Calibration", test_calibrate_difficulty),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"\n❌ {test_name} FAILED with exception: {str(e)}")
            failed += 1
        
        print("\n" + "-"*60)
    
    print("\n" + "="*60)
    print(f"📊 TEST RESULTS: {passed}/{len(tests)} PASSED")
    if failed == 0:
        print("✅ ALL TESTS PASSED!")
    else:
        print(f"❌ {failed} TEST(S) FAILED")
    print("="*60)


if __name__ == "__main__":
    run_all_tests()
