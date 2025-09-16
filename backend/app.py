import os
import io
import string
import soundfile as sf
from flask import Flask, jsonify, request
from flask_cors import CORS
from pydub import AudioSegment
from transformers import pipeline

# --- App Initialization ---
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3003"]}}) # Support all common React ports

# --- Load AI Models ---

# Model 1: Speech-to-Text (OpenAI Whisper)
# Enhanced configuration for better accuracy
try:
    print("Loading Whisper model (this may take a moment on first run)...")
    # Use chunk_length_s for better accuracy with short commands
    transcriber = pipeline(
        "automatic-speech-recognition", 
        model="openai/whisper-base.en",
        chunk_length_s=30,  # Process in 30-second chunks
        return_timestamps=False  # We don't need timestamps for commands
    )
    print("Whisper model loaded successfully.")
except Exception as e:
    print(f"CRITICAL ERROR: Could not load Whisper model: {e}")
    transcriber = None

# Model 2: Intent Classification (Facebook BART Base - Pre-trained)
# BART is a pre-trained transformer model good for zero-shot classification
# We're using the "base" version for faster inference while maintaining good performance
try:
    print("Loading Intent Classification model (BART Base - Pre-trained)...")
    classifier = pipeline("zero-shot-classification", model="facebook/bart-base")
    print("Intent classification model loaded successfully.")
except Exception as e:
    print(f"CRITICAL ERROR: Could not load intent classification model: {e}")
    classifier = None

# --- Define Intents and Entities ---
# More specific and balanced intent labels for better BART classification
INTENT_LABELS = [
    "switch to exercise", "change to exercise", "do this exercise", "start this exercise",
    "start workout session", "begin workout session", "start training", 
    "stop workout session", "end workout session", "quit training", "finish workout",
    "skip current exercise", "move to next exercise", "skip this exercise",
    "take a rest break", "add rest time", "need a break", "pause workout"
]

# Expanded exercise entities with variations
EXERCISE_ENTITIES = [
    'plank', 'planks', 'plank exercise',
    'push up', 'push ups', 'pushup', 'pushups', 'press up', 'press ups',
    'squat', 'squats', 'squat exercise',
    'bridge', 'bridges', 'bridge pose', 'glute bridge',
    'bird dog', 'bird dogs', 'birddog', 'bird-dog',
    'high knees', 'high knee', 'knee ups', 'knee raise',
    'lunges', 'lunge', 'lung', 'forward lunge',
    'superman', 'supermans', 'superman pose', 'superman exercise',
    'wall sit', 'wall sits', 'wall squat', 'wallsit'
]

# Enhanced routine entities with more variations
ROUTINE_ENTITIES = {
    "core strength": "core_strength",
    "core workout": "core_strength", 
    "core": "core_strength",
    "abs workout": "core_strength",
    "lower body power": "lower_body",
    "lower body": "lower_body",
    "leg workout": "lower_body",
    "legs": "lower_body",
    "upper body and posture": "upper_body",
    "upper body": "upper_body",
    "arms workout": "upper_body",
    "arms": "upper_body"
}

# --- API Routes ---
@app.route('/api/health', methods=['GET'])
def health_check():
    """A simple endpoint to confirm the server is running."""
    return jsonify({"status": "healthy"}), 200

@app.route('/api/speech', methods=['POST'])
def recognize_speech():
    """
    This is the main AI orchestration endpoint.
    It receives an audio blob, transcribes it to text, and classifies the user's intent.
    """
    print(f"Received speech request. Content-Type: {request.content_type}, Data size: {len(request.data) if request.data else 0}")
    
    if not transcriber or not classifier:
        return jsonify({"error": "An AI model is not available. The server may be starting up."}), 503

    audio_blob = request.data
    
    try:
        # --- Step 1: Enhanced Audio Conversion ---
        # Convert to optimal format for Whisper with noise reduction
        audio = AudioSegment.from_file(io.BytesIO(audio_blob))
        
        # Normalize audio levels for better recognition
        audio = audio.normalize()
        
        # Convert to mono 16kHz (optimal for Whisper)
        audio = audio.set_channels(1).set_frame_rate(16000)
        
        # Apply light noise reduction if audio is too quiet
        if audio.dBFS < -30:  # If audio is very quiet
            audio = audio + (15 - audio.dBFS)  # Boost volume
        
        wav_buffer = io.BytesIO()
        audio.export(wav_buffer, format="wav")
        wav_buffer.seek(0)
        
        speech_array, sample_rate = sf.read(wav_buffer)

        # --- Step 2: Enhanced Speech-to-Text with Whisper ---
        # Use temperature parameter for more deterministic results
        transcription_result = transcriber(
            speech_array,
            generate_kwargs={"temperature": 0.0}  # More deterministic output
        )
        transcribed_text = transcription_result.get('text', '').strip()
        
        print(f"WHISPER RAW TRANSCRIPTION: '{transcribed_text}'")

        if not transcribed_text:
            return jsonify({"intent": "UNKNOWN", "entity": None, "transcription": ""})

        # --- Step 3: Enhanced Intent Classification ---
        # Improved single word and phrase matching
        text_lower = transcribed_text.lower().strip()
        
        # Remove punctuation for better matching
        text_clean = text_lower.translate(str.maketrans('', '', string.punctuation))
        
        print(f"PROCESSING TEXT: '{text_lower}' -> cleaned: '{text_clean}'")
        
        # Enhanced single word commands
        single_word_mapping = {
            "start": "start workout",
            "begin": "start workout", 
            "go": "start workout",
            "workout": "start workout",
            "stop": "stop workout",
            "end": "stop workout",
            "quit": "stop workout", 
            "done": "stop workout",
            "finish": "stop workout",
            "skip": "skip exercise",
            "next": "skip exercise",
            "pass": "skip exercise",
            "rest": "add rest",
            "break": "add rest",
            "pause": "add rest",
            # Exercise names
            "plank": "switch exercise",
            "planks": "switch exercise",
            "pushup": "switch exercise", 
            "pushups": "switch exercise",
            "push up": "switch exercise",
            "push ups": "switch exercise",
            "squat": "switch exercise",
            "squats": "switch exercise",
            "bridge": "switch exercise",
            "bridges": "switch exercise",
            "superman": "switch exercise",
            "lunge": "switch exercise",
            "lunges": "switch exercise",
            "wall sit": "switch exercise",
            "high knees": "switch exercise"
        }
        
        # Check for direct matches first (using cleaned text)
        best_intent = None
        entity = None
        
        if text_clean in single_word_mapping:
            best_intent = single_word_mapping[text_clean]
            print(f"DIRECT MATCH: '{text_clean}' -> '{best_intent}'")
            
            # Set entity for exercise switches
            if best_intent == "switch exercise":
                exercise_name_mapping = {
                    "plank": "Plank", "planks": "Plank",
                    "pushup": "Push-up", "pushups": "Push-up", 
                    "push up": "Push-up", "push ups": "Push-up",
                    "squat": "Squat", "squats": "Squat",
                    "bridge": "Bridge", "bridges": "Bridge", 
                    "superman": "Superman",
                    "lunge": "Lunges", "lunges": "Lunges",
                    "wall sit": "Wall-sit", "wall seat": "Wall-sit", "wall seed": "Wall-sit", "wall seet": "Wall-sit",
                    "high knees": "High Knees", "high knee": "High Knees", "hi knees": "High Knees", "hi knee": "High Knees"
                    
                }
                entity = exercise_name_mapping.get(text_clean)
                print(f"EXERCISE ENTITY: '{entity}'")
        
        # If no direct match, try phrase matching and exercise detection
        if not best_intent:
            # Check for common phrases first
            if any(phrase in text_lower for phrase in ["start workout", "begin workout", "start exercise"]):
                best_intent = "start workout"
            elif any(phrase in text_lower for phrase in ["stop workout", "end workout", "quit workout"]):
                best_intent = "stop workout"
            elif any(phrase in text_lower for phrase in ["skip exercise", "next exercise"]):
                best_intent = "skip exercise"
            elif any(phrase in text_lower for phrase in ["add rest", "take rest"]):
                best_intent = "add rest"
            else:
                # Check if it's an exercise name that wasn't caught by direct matching
                exercise_keywords = ["plank", "squat", "pushup", "push up", "bridge", "superman", "lunge", "wall sit", "high knee"]
                
                # Also check for common misheard words
                exercise_variations = {
                    "clank": "plank",  # Common mishearing
                    "bank": "plank",  # Common mishearing
                    "blank": "plank",  # Common mishearing
                    "plant": "plank",  # Common mishearing
                    "squad": "squat",  # Common mishearing
                    "what": "squat",  # Common mishearing
                    "squid": "squat",  # Common mishearing
                    "push": "pushup",  # Shortened form
                    "pushed": "pushup",  # Past tense
                    "brush": "pushup",  # Common mishearing
                    "lunch": "lunge",  # Common mishearing
                    "launch": "lunge",  # Common mishearing
                    "lung": "lunge",  # Shortened form
                    "super": "superman",  # Shortened form
                    "supa": "superman",  # Common mishearing
                    "supreme": "superman",  # Common mishearing
                    "wall seat": "wall sit",  # Common mishearing
                    "wall seed": "wall sit",  # Common mishearing
                    "wall seet": "wall sit",  # Common mishearing
                }
                
                # First check for direct keyword match
                matched_keyword = None
                for keyword in exercise_keywords:
                    if keyword in text_clean:
                        matched_keyword = keyword
                        break
                
                # If no direct match, check for variations/mishearings
                if not matched_keyword:
                    for variation, actual in exercise_variations.items():
                        if variation in text_clean:
                            matched_keyword = actual
                            print(f"EXERCISE VARIATION DETECTED: '{variation}' -> '{actual}'")
                            break
                
                if matched_keyword:
                    best_intent = "switch exercise"
                    # Set the entity for exercise switching
                    exercise_name_mapping = {
                        "plank": "Plank",
                        "squat": "Squat", 
                        "pushup": "Push-up", "push up": "Push-up",
                        "bridge": "Bridge", 
                        "superman": "Superman",
                        "lunge": "Lunges",
                        "wall sit": "Wall-sit",
                        "high knee": "High Knees"
                    }
                    entity = exercise_name_mapping.get(matched_keyword, matched_keyword.title())
                    print(f"EXERCISE DETECTED via keyword matching: '{matched_keyword}' -> entity: '{entity}'")
                
                # If still no match, try BART classification as last resort
                if not best_intent:
                    try:
                        # Give BART better context by providing the full sentence with context
                        context_text = f"User said: '{transcribed_text}' during a fitness workout session"
                        
                        # Use more specific labels that are less likely to default to rest
                        classification_labels = [
                            "switch to exercise", "change to exercise",
                            "start workout session", "begin workout", 
                            "stop workout session", "end workout",
                            "skip current exercise", "next exercise",
                            "take a rest break", "need rest"
                        ]
                        
                        intent_result = classifier(context_text, classification_labels)
                        print(f"BART INPUT: '{context_text}'")
                        print(f"BART LABELS: {classification_labels}")
                        
                        if isinstance(intent_result, dict) and 'labels' in intent_result and intent_result['labels']:
                            bart_result = intent_result['labels'][0]
                            confidence_score = intent_result['scores'][0] if 'scores' in intent_result else 0.0
                            
                            print(f"BART CLASSIFICATION: '{bart_result}' (confidence: {confidence_score:.3f})")
                            
                            # Only accept BART result if confidence is reasonable
                            if confidence_score > 0.3:  # Require at least 30% confidence
                                # Map BART results back to our standard intents
                                bart_mapping = {
                                    "switch to exercise": "switch exercise",
                                    "change to exercise": "switch exercise", 
                                    "start workout session": "start workout",
                                    "begin workout": "start workout",
                                    "stop workout session": "stop workout",
                                    "end workout": "stop workout",
                                    "skip current exercise": "skip exercise",
                                    "next exercise": "skip exercise",
                                    "take a rest break": "add rest",
                                    "need rest": "add rest"
                                }
                                best_intent = bart_mapping.get(bart_result, "UNKNOWN")
                                print(f"MAPPED BART RESULT: '{best_intent}'")
                            else:
                                print(f"BART CONFIDENCE TOO LOW ({confidence_score:.3f}), setting to UNKNOWN")
                                best_intent = "UNKNOWN"
                        else:
                            best_intent = "UNKNOWN"
                            print(f"NO CLASSIFICATION FOUND, setting to UNKNOWN")
                    except Exception as e:
                        print(f"BART CLASSIFICATION ERROR: {e}")
                        best_intent = "UNKNOWN"
        
        print(f"FINAL INTENT: '{best_intent}'")

        # --- Step 4: Intent Normalization ---
        # Normalize intent names for consistency
        intent_mapping = {
            "begin workout": "start workout",
            "start exercise": "start workout", 
            "end workout": "stop workout", 
            "finish workout": "stop workout",
            "change exercise": "switch exercise",
            "do exercise": "switch exercise",
            "next exercise": "switch exercise",
            "switch to exercise": "switch exercise",
            "change to exercise": "switch exercise",
            "start this exercise": "switch exercise",
            "do this exercise": "switch exercise",
            "pass": "skip exercise", 
            "next": "skip exercise",
            "move on": "skip exercise",
            "skip current exercise": "skip exercise",
            "move to next exercise": "skip exercise",
            "take rest": "add rest",
            "break": "add rest",
            "pause": "add rest",
            "wait": "add rest",
            "take a rest break": "add rest",
            "need rest": "add rest",
            "need a break": "add rest",
            "begin routine": "start routine",
            "do routine": "start routine"
        }
        
        # Normalize the intent
        normalized_intent = intent_mapping.get(best_intent, best_intent)
        
        # If no entity was set yet and this is a switch exercise command, try to extract it
        if normalized_intent == "switch exercise" and not entity:
            # Try to find exercise name in the transcribed text
            for exercise in EXERCISE_ENTITIES:
                if exercise.lower() in text_lower:
                    # Convert to proper format (e.g., "push up" -> "Push-up")
                    exercise_name_mapping = {
                        "plank": "Plank", "planks": "Plank", "plank exercise": "Plank",
                        "push up": "Push-up", "push ups": "Push-up", "pushup": "Push-up", "pushups": "Push-up",
                        "squat": "Squat", "squats": "Squat", "squat exercise": "Squat",
                        "bridge": "Bridge", "bridges": "Bridge", "bridge pose": "Bridge", "glute bridge": "Bridge",
                        "bird dog": "Bird-dog", "bird dogs": "Bird-dog", "birddog": "Bird-dog", "bird-dog": "Bird-dog",
                        "high knees": "High Knees", "high knee": "High Knees", "knee ups": "High Knees",
                        "lunges": "Lunges", "lunge": "Lunges", "lung": "Lunges",
                        "superman": "Superman", "supermans": "Superman", "superman pose": "Superman",
                        "wall sit": "Wall-sit", "wall sits": "Wall-sit",  "wallsit": "Wall-sit"
                    }
                    entity = exercise_name_mapping.get(exercise.lower(), exercise.title())
                    break
                    
        elif normalized_intent in ["start routine", "begin routine", "do routine"]:
            # Enhanced routine matching
            routine_labels = list(ROUTINE_ENTITIES.keys())
            
            # Check for direct matches first
            for routine_phrase in ROUTINE_ENTITIES:
                if routine_phrase.lower() in text_lower:
                    entity = ROUTINE_ENTITIES[routine_phrase]
                    break

        # --- Step 5: Format and Return the Final Command ---
        response = {
            "intent": normalized_intent.upper().replace(" ", "_"),
            "entity": entity,
            "transcription": transcribed_text,
            "confidence": "high" if text_clean in ["start", "stop", "skip", "plank", "squat", "pushup", "bridge"] else "medium"
        }
        
        print(f"FINAL RESPONSE: {response}")
        return jsonify(response)

    except Exception as e:
        print(f"Error processing audio: {e}")
        return jsonify({"error": str(e)}), 500

# --- Main Execution Block ---
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

