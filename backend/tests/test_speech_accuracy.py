"""
Speech Recognition Accuracy Tests
Tests the accuracy of voice command recognition for fitness application
"""

import json
import time
import requests
from datetime import datetime
import statistics

class SpeechAccuracyEvaluator:
    def __init__(self, backend_url="http://localhost:5000"):
        self.backend_url = backend_url
        self.test_results = []
        
    def test_command_accuracy(self):
        """Test accuracy of voice command recognition"""
        
        # Test cases with expected outcomes
        test_cases = [
            # Basic workout commands
            {"text": "start workout", "expected_intent": "START_WORKOUT", "expected_entity": None},
            {"text": "stop workout", "expected_intent": "STOP_WORKOUT", "expected_entity": None},
            {"text": "begin workout", "expected_intent": "START_WORKOUT", "expected_entity": None},
            {"text": "end workout", "expected_intent": "STOP_WORKOUT", "expected_entity": None},
            
            # Exercise switching commands
            {"text": "plank", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Plank"},
            {"text": "squat", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Squat"},
            {"text": "push up", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Push-up"},
            {"text": "bridge", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Bridge"},
            {"text": "superman", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Superman"},
            {"text": "wall sit", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Wall-sit"},
            {"text": "high knees", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "High Knees"},
            {"text": "lunges", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Lunges"},
            
            # Exercise variations and mishearings
            {"text": "planks", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Plank"},
            {"text": "pushup", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Push-up"},
            {"text": "pushups", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Push-up"},
            {"text": "squats", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Squat"},
            {"text": "lunge", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Lunges"},
            
            # Common mishearings
            {"text": "clank", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Plank"},
            {"text": "squad", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Squat"},
            {"text": "lunch", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Lunges"},
            
            # Skip and rest commands
            {"text": "skip", "expected_intent": "SKIP_EXERCISE", "expected_entity": None},
            {"text": "next", "expected_intent": "SKIP_EXERCISE", "expected_entity": None},
            {"text": "rest", "expected_intent": "ADD_REST", "expected_entity": None},
            {"text": "break", "expected_intent": "ADD_REST", "expected_entity": None},
            {"text": "pause", "expected_intent": "ADD_REST", "expected_entity": None},
            
            # Natural language commands
            {"text": "I want to do squats", "expected_intent": "SWITCH_EXERCISE", "expected_entity": "Squat"},
            {"text": "let's start the workout", "expected_intent": "START_WORKOUT", "expected_entity": None},
            {"text": "I need a break", "expected_intent": "ADD_REST", "expected_entity": None},
            {"text": "skip this exercise", "expected_intent": "SKIP_EXERCISE", "expected_entity": None},
            {"text": "time to stop", "expected_intent": "STOP_WORKOUT", "expected_entity": None},
            
            # Edge cases
            {"text": "", "expected_intent": "UNKNOWN", "expected_entity": None},
            {"text": "hello", "expected_intent": "UNKNOWN", "expected_entity": None},
            {"text": "what time is it", "expected_intent": "UNKNOWN", "expected_entity": None},
        ]
        
        results = {
            "total_tests": len(test_cases),
            "correct_intent": 0,
            "correct_entity": 0,
            "fully_correct": 0,
            "failed_tests": [],
            "response_times": [],
            "test_details": []
        }
        
        print(f"Running {len(test_cases)} speech recognition accuracy tests...")
        
        for i, test_case in enumerate(test_cases):
            print(f"Test {i+1}/{len(test_cases)}: '{test_case['text']}'")
            
            # Simulate the speech recognition by directly testing text processing
            # In a real scenario, you'd send actual audio files
            start_time = time.time()
            
            try:
                # Mock the speech processing (since we're testing the text processing logic)
                response = self._mock_speech_processing(test_case['text'])
                end_time = time.time()
                response_time = (end_time - start_time) * 1000  # Convert to milliseconds
                
                results["response_times"].append(response_time)
                
                # Check accuracy
                intent_correct = response.get("intent") == test_case["expected_intent"]
                entity_correct = response.get("entity") == test_case["expected_entity"]
                fully_correct = intent_correct and entity_correct
                
                if intent_correct:
                    results["correct_intent"] += 1
                if entity_correct:
                    results["correct_entity"] += 1
                if fully_correct:
                    results["fully_correct"] += 1
                else:
                    results["failed_tests"].append({
                        "input": test_case["text"],
                        "expected": test_case,
                        "actual": response,
                        "intent_correct": intent_correct,
                        "entity_correct": entity_correct
                    })
                
                results["test_details"].append({
                    "input": test_case["text"],
                    "expected_intent": test_case["expected_intent"],
                    "actual_intent": response.get("intent"),
                    "expected_entity": test_case["expected_entity"],
                    "actual_entity": response.get("entity"),
                    "response_time_ms": response_time,
                    "intent_correct": intent_correct,
                    "entity_correct": entity_correct,
                    "fully_correct": fully_correct
                })
                
            except Exception as e:
                print(f"Error testing '{test_case['text']}': {e}")
                results["failed_tests"].append({
                    "input": test_case["text"],
                    "error": str(e)
                })
        
        # Calculate statistics
        results["intent_accuracy"] = (results["correct_intent"] / results["total_tests"]) * 100
        results["entity_accuracy"] = (results["correct_entity"] / results["total_tests"]) * 100
        results["overall_accuracy"] = (results["fully_correct"] / results["total_tests"]) * 100
        results["avg_response_time_ms"] = statistics.mean(results["response_times"]) if results["response_times"] else 0
        results["max_response_time_ms"] = max(results["response_times"]) if results["response_times"] else 0
        results["min_response_time_ms"] = min(results["response_times"]) if results["response_times"] else 0
        
        return results
    
    def _mock_speech_processing(self, text):
        """Mock speech processing for testing text-based logic"""
        # This simulates the processing logic without needing actual audio
        # You would replace this with actual API calls in a full test
        
        # Simulate the intent classification logic from your app
        text_lower = text.lower().strip()
        text_clean = text_lower.translate(str.maketrans('', '', '.,!?'))
        
        single_word_mapping = {
            "start": "START_WORKOUT",
            "begin": "START_WORKOUT", 
            "stop": "STOP_WORKOUT",
            "end": "STOP_WORKOUT",
            "skip": "SKIP_EXERCISE",
            "next": "SKIP_EXERCISE",
            "rest": "ADD_REST",
            "break": "ADD_REST",
            "pause": "ADD_REST",
            "plank": "SWITCH_EXERCISE",
            "planks": "SWITCH_EXERCISE",
            "squat": "SWITCH_EXERCISE",
            "squats": "SWITCH_EXERCISE",
            "pushup": "SWITCH_EXERCISE",
            "pushups": "SWITCH_EXERCISE",
            "push up": "SWITCH_EXERCISE",
            "push ups": "SWITCH_EXERCISE",
            "bridge": "SWITCH_EXERCISE",
            "superman": "SWITCH_EXERCISE",
            "wall sit": "SWITCH_EXERCISE",
            "high knees": "SWITCH_EXERCISE",
            "lunges": "SWITCH_EXERCISE",
            "lunge": "SWITCH_EXERCISE",
            # Mishearings
            "clank": "SWITCH_EXERCISE",
            "squad": "SWITCH_EXERCISE",
            "lunch": "SWITCH_EXERCISE",
        }
        
        entity = None
        intent = single_word_mapping.get(text_clean, "UNKNOWN")
        
        if intent == "SWITCH_EXERCISE":
            exercise_mapping = {
                "plank": "Plank", "planks": "Plank", "clank": "Plank",
                "squat": "Squat", "squats": "Squat", "squad": "Squat",
                "pushup": "Push-up", "pushups": "Push-up", "push up": "Push-up", "push ups": "Push-up",
                "bridge": "Bridge",
                "superman": "Superman",
                "wall sit": "Wall-sit",
                "high knees": "High Knees",
                "lunges": "Lunges", "lunge": "Lunges", "lunch": "Lunges"
            }
            entity = exercise_mapping.get(text_clean)
        
        # Handle phrase matching
        if intent == "UNKNOWN":
            if any(phrase in text_lower for phrase in ["start workout", "begin workout"]):
                intent = "START_WORKOUT"
            elif any(phrase in text_lower for phrase in ["stop workout", "end workout"]):
                intent = "STOP_WORKOUT"
            elif any(phrase in text_lower for phrase in ["skip exercise", "next exercise"]):
                intent = "SKIP_EXERCISE"
            elif any(phrase in text_lower for phrase in ["need a break", "take a break"]):
                intent = "ADD_REST"
            elif "squat" in text_lower:
                intent = "SWITCH_EXERCISE"
                entity = "Squat"
        
        return {
            "intent": intent,
            "entity": entity,
            "transcription": text,
            "confidence": "high" if text_clean in ["start", "stop", "plank", "squat"] else "medium"
        }
    
    def save_results(self, results, filename=None):
        """Save test results to JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"speech_accuracy_results_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"Results saved to {filename}")
        return filename

def run_evaluation():
    """Run the speech accuracy evaluation"""
    evaluator = SpeechAccuracyEvaluator()
    
    print("=" * 60)
    print("SPEECH RECOGNITION ACCURACY EVALUATION")
    print("=" * 60)
    
    results = evaluator.test_command_accuracy()
    
    print("\n" + "=" * 60)
    print("EVALUATION RESULTS")
    print("=" * 60)
    
    print(f"Total Tests: {results['total_tests']}")
    print(f"Intent Accuracy: {results['intent_accuracy']:.2f}%")
    print(f"Entity Accuracy: {results['entity_accuracy']:.2f}%")
    print(f"Overall Accuracy: {results['overall_accuracy']:.2f}%")
    print(f"Average Response Time: {results['avg_response_time_ms']:.2f}ms")
    print(f"Max Response Time: {results['max_response_time_ms']:.2f}ms")
    print(f"Min Response Time: {results['min_response_time_ms']:.2f}ms")
    
    if results['failed_tests']:
        print(f"\nFailed Tests: {len(results['failed_tests'])}")
        for i, failed in enumerate(results['failed_tests'][:5]):  # Show first 5 failures
            print(f"  {i+1}. Input: '{failed['input']}'")
            if 'error' not in failed:
                print(f"     Expected: {failed['expected']['expected_intent']} / {failed['expected']['expected_entity']}")
                print(f"     Actual: {failed['actual']['intent']} / {failed['actual']['entity']}")
    
    # Save results
    filename = evaluator.save_results(results)
    
    return results, filename

if __name__ == "__main__":
    run_evaluation()