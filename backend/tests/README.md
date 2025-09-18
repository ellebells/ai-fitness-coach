# AI Fitness Coach - Evaluation Test Suite

This directory contains comprehensive evaluation tests for the AI Fitness Coach application, designed to provide data and analysis for your project evaluation chapter.

## Test Categories

### 1. Speech Recognition Accuracy Tests (`test_speech_accuracy.py`)
**Purpose:** Evaluate the accuracy of voice command recognition and intent classification.

**Tests Include:**
- Basic workout commands (start, stop, pause)
- Exercise switching commands (plank, squat, push-up, etc.)
- Natural language variations and common mishearings
- Entity extraction accuracy for exercise names
- Response time measurement

**Metrics Generated:**
- Overall accuracy percentage
- Intent recognition accuracy
- Entity extraction accuracy
- Average response time
- Failed test case analysis

### 2. Performance and Load Tests (`test_performance.py`)
**Purpose:** Assess system performance under various load conditions and measure resource usage.

**Tests Include:**
- API response time measurement
- Concurrent user simulation
- System resource monitoring (CPU, memory)
- Model initialization timing
- Success rate under load

**Metrics Generated:**
- Average/min/max response times
- Requests per second capability
- Success rate under concurrent load
- System resource utilization
- Performance recommendations

### 3. Usability Evaluation (`test_usability.py`)
**Purpose:** Evaluate user experience and interface effectiveness through scenario-based testing.

**Tests Include:**
- Task completion scenarios (first-time user, exercise switching, error recovery)
- Voice command clarity and intuitiveness assessment
- Accessibility feature evaluation
- Error recovery capability testing
- User satisfaction scoring

**Metrics Generated:**
- Task completion rates
- User satisfaction scores
- Voice command clarity ratings
- Accessibility compliance percentage
- Error recovery success rates

### 4. Comprehensive Report Generator (`run_evaluation_suite.py`)
**Purpose:** Execute all tests and generate a formatted evaluation report suitable for academic use.

**Features:**
- Runs all test categories automatically
- Generates weighted overall performance score
- Creates formatted markdown report
- Provides JSON data for further analysis
- Includes recommendations and critical analysis

## Running the Evaluation Suite

### Prerequisites
Make sure your backend server is running:
```bash
cd backend
python app.py
```

### Run Individual Test Categories
```bash
# Speech accuracy tests
python test_speech_accuracy.py

# Performance tests  
python test_performance.py

# Usability evaluation
python test_usability.py
```

### Run Complete Evaluation Suite
```bash
# Run all tests and generate comprehensive report
python run_evaluation_suite.py
```

## Output Files

The evaluation suite generates several output files:

1. **Individual Test Results:**
   - `speech_accuracy_results_[timestamp].json`
   - `performance_results_[timestamp].json`  
   - `usability_results_[timestamp].json`

2. **Comprehensive Report:**
   - `evaluation_report_[timestamp].json` - Raw data
   - `evaluation_report_[timestamp].md` - Formatted report for your chapter

## Using Results in Your Report

### For Your Evaluation Chapter

The generated markdown report (`evaluation_report_[timestamp].md`) provides:

1. **Methodology Section:** Explains testing approach and justification
2. **Results Section:** Detailed quantitative results with metrics
3. **Critical Analysis:** Strengths, weaknesses, and limitations
4. **Recommendations:** Future improvements and extensions

### Key Metrics to Highlight

- **Speech Recognition Accuracy:** Shows how well the AI understands voice commands
- **System Performance:** Demonstrates real-time capability and scalability
- **User Experience:** Validates usability and accessibility
- **Overall Rating:** Provides comparative benchmark

### Example Report Sections

```markdown
## Evaluation Methodology

The evaluation employed a multi-faceted testing strategy combining automated accuracy testing, performance measurement, and usability assessment. This approach was chosen to provide comprehensive coverage while generating quantifiable metrics for analysis.

## Results and Analysis

### Speech Recognition Performance
- Overall accuracy: 87.5% across 35 test cases
- Intent recognition: 92.3% accuracy
- Entity extraction: 82.7% accuracy
- Average response time: 245ms

[Additional sections follow...]
```

## Customizing Tests

### Adding New Test Cases

To add new speech recognition test cases, edit `test_speech_accuracy.py`:
```python
test_cases = [
    {"text": "your new command", "expected_intent": "EXPECTED_INTENT", "expected_entity": "Expected Entity"},
    # ... existing test cases
]
```

### Modifying Performance Parameters

Adjust load testing parameters in `test_performance.py`:
```python
# Test with different concurrent user counts
load_results = self.test_concurrent_load(num_concurrent_users=10, requests_per_user=20)
```

### Adding New Evaluation Criteria

Create new evaluation functions in any test file and add them to the main evaluation loop.

## Interpreting Results

### Success Criteria
- **Speech Accuracy:** >85% for good performance
- **Response Time:** <300ms for real-time feel
- **Success Rate:** >95% for reliability
- **Task Completion:** >80% for usability

### Common Issues and Solutions
- Low speech accuracy → Add more variation mappings
- High response times → Optimize model inference
- Poor usability scores → Improve voice command clarity
- Accessibility issues → Add alternative input methods

## Academic Use

These tests provide several benefits for your evaluation chapter:

1. **Objective Metrics:** Quantitative data to support claims
2. **Reproducible Results:** Consistent testing methodology
3. **Comparative Analysis:** Benchmarks against standard criteria
4. **Critical Assessment:** Identifies both strengths and limitations
5. **Future Work:** Data-driven recommendations for improvements

The automated nature ensures your evaluation is thorough, unbiased, and academically rigorous while providing concrete evidence for your project's effectiveness and areas for improvement.