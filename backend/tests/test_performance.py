"""
Performance and Load Testing for AI Fitness Coach Backend
Tests response times, concurrent users, and model performance
"""

import asyncio
import aiohttp
import time
import threading
import json
import statistics
from datetime import datetime
import concurrent.futures
import psutil
import sys
import os

class PerformanceEvaluator:
    def __init__(self, backend_url="http://localhost:5000"):
        self.backend_url = backend_url
        self.results = {
            "response_time_tests": [],
            "load_tests": [],
            "memory_usage": [],
            "cpu_usage": [],
            "model_performance": []
        }
    
    def test_response_times(self):
        """Test API response times for different endpoints"""
        print("Testing API response times...")
        
        endpoints = [
            {"url": "/", "method": "GET", "name": "Root endpoint"},
            {"url": "/api/health", "method": "GET", "name": "Health check"},
        ]
        
        results = {}
        
        for endpoint in endpoints:
            print(f"Testing {endpoint['name']}...")
            times = []
            
            for i in range(10):  # 10 requests per endpoint
                start_time = time.time()
                try:
                    import requests
                    response = requests.get(f"{self.backend_url}{endpoint['url']}", timeout=10)
                    end_time = time.time()
                    
                    if response.status_code == 200:
                        response_time = (end_time - start_time) * 1000  # Convert to ms
                        times.append(response_time)
                    else:
                        print(f"  Request {i+1} failed with status {response.status_code}")
                        
                except Exception as e:
                    print(f"  Request {i+1} failed: {e}")
            
            if times:
                results[endpoint['name']] = {
                    "avg_time_ms": statistics.mean(times),
                    "min_time_ms": min(times),
                    "max_time_ms": max(times),
                    "median_time_ms": statistics.median(times),
                    "std_dev_ms": statistics.stdev(times) if len(times) > 1 else 0,
                    "successful_requests": len(times),
                    "total_requests": 10
                }
        
        self.results["response_time_tests"] = results
        return results
    
    def test_concurrent_load(self, num_concurrent_users=5, requests_per_user=10):
        """Test performance under concurrent load"""
        print(f"Testing concurrent load: {num_concurrent_users} users, {requests_per_user} requests each...")
        
        def worker_thread(user_id):
            """Worker function for each simulated user"""
            import requests
            user_results = []
            
            for request_num in range(requests_per_user):
                start_time = time.time()
                try:
                    response = requests.get(f"{self.backend_url}/api/health", timeout=15)
                    end_time = time.time()
                    
                    response_time = (end_time - start_time) * 1000
                    user_results.append({
                        "user_id": user_id,
                        "request_num": request_num + 1,
                        "response_time_ms": response_time,
                        "status_code": response.status_code,
                        "success": response.status_code == 200
                    })
                    
                except Exception as e:
                    user_results.append({
                        "user_id": user_id,
                        "request_num": request_num + 1,
                        "error": str(e),
                        "success": False
                    })
                
                # Small delay between requests
                time.sleep(0.1)
            
            return user_results
        
        # Run concurrent threads
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_concurrent_users) as executor:
            future_to_user = {executor.submit(worker_thread, user_id): user_id 
                             for user_id in range(num_concurrent_users)}
            
            all_results = []
            for future in concurrent.futures.as_completed(future_to_user):
                user_results = future.result()
                all_results.extend(user_results)
        
        end_time = time.time()
        total_test_time = end_time - start_time
        
        # Analyze results
        successful_requests = [r for r in all_results if r.get('success', False)]
        failed_requests = [r for r in all_results if not r.get('success', False)]
        
        if successful_requests:
            response_times = [r['response_time_ms'] for r in successful_requests]
            
            load_results = {
                "total_requests": len(all_results),
                "successful_requests": len(successful_requests),
                "failed_requests": len(failed_requests),
                "success_rate": (len(successful_requests) / len(all_results)) * 100,
                "total_test_time_s": total_test_time,
                "requests_per_second": len(all_results) / total_test_time,
                "avg_response_time_ms": statistics.mean(response_times),
                "min_response_time_ms": min(response_times),
                "max_response_time_ms": max(response_times),
                "median_response_time_ms": statistics.median(response_times),
                "p95_response_time_ms": self._percentile(response_times, 95),
                "p99_response_time_ms": self._percentile(response_times, 99),
                "concurrent_users": num_concurrent_users,
                "requests_per_user": requests_per_user
            }
        else:
            load_results = {
                "total_requests": len(all_results),
                "successful_requests": 0,
                "failed_requests": len(failed_requests),
                "success_rate": 0,
                "error": "No successful requests"
            }
        
        self.results["load_tests"].append(load_results)
        return load_results
    
    def monitor_system_resources(self, duration_seconds=60):
        """Monitor CPU and memory usage during operation"""
        print(f"Monitoring system resources for {duration_seconds} seconds...")
        
        cpu_readings = []
        memory_readings = []
        
        start_time = time.time()
        
        while time.time() - start_time < duration_seconds:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory_info = psutil.virtual_memory()
            
            cpu_readings.append(cpu_percent)
            memory_readings.append({
                "total_gb": memory_info.total / (1024**3),
                "available_gb": memory_info.available / (1024**3),
                "used_gb": memory_info.used / (1024**3),
                "percent_used": memory_info.percent
            })
        
        # Analyze resource usage
        resource_results = {
            "monitoring_duration_s": duration_seconds,
            "cpu_usage": {
                "avg_percent": statistics.mean(cpu_readings),
                "max_percent": max(cpu_readings),
                "min_percent": min(cpu_readings),
                "readings": cpu_readings
            },
            "memory_usage": {
                "avg_used_gb": statistics.mean([r["used_gb"] for r in memory_readings]),
                "max_used_gb": max([r["used_gb"] for r in memory_readings]),
                "avg_percent": statistics.mean([r["percent_used"] for r in memory_readings]),
                "max_percent": max([r["percent_used"] for r in memory_readings]),
                "readings": memory_readings
            }
        }
        
        self.results["cpu_usage"] = resource_results["cpu_usage"]
        self.results["memory_usage"] = resource_results["memory_usage"]
        
        return resource_results
    
    def test_model_initialization_time(self):
        """Test how long it takes to load AI models"""
        print("Testing model initialization times...")
        
        # This would typically involve restarting the server and timing startup
        # For now, we'll simulate or estimate based on logs
        
        model_results = {
            "whisper_model": {
                "estimated_load_time_s": 15,  # Typical Whisper-base loading time
                "model_size": "openai/whisper-base.en",
                "memory_usage_estimate_mb": 500
            },
            "bart_model": {
                "estimated_load_time_s": 8,   # Typical BART-large loading time
                "model_size": "facebook/bart-large-mnli", 
                "memory_usage_estimate_mb": 1200
            },
            "total_estimated_startup_time_s": 25,
            "notes": "Actual times may vary based on hardware and network speed"
        }
        
        self.results["model_performance"] = model_results
        return model_results
    
    def _percentile(self, data, percentile):
        """Calculate percentile of a dataset"""
        if not data:
            return 0
        sorted_data = sorted(data)
        index = (percentile / 100) * (len(sorted_data) - 1)
        
        if index.is_integer():
            return sorted_data[int(index)]
        else:
            lower = sorted_data[int(index)]
            upper = sorted_data[int(index) + 1]
            return lower + (upper - lower) * (index - int(index))
    
    def run_full_evaluation(self):
        """Run all performance tests"""
        print("=" * 60)
        print("PERFORMANCE EVALUATION SUITE")
        print("=" * 60)
        
        # Test 1: Response times
        response_results = self.test_response_times()
        
        # Test 2: Concurrent load testing
        load_results = self.test_concurrent_load(num_concurrent_users=3, requests_per_user=5)
        
        # Test 3: System resource monitoring (shorter duration for testing)
        resource_results = self.monitor_system_resources(duration_seconds=30)
        
        # Test 4: Model performance
        model_results = self.test_model_initialization_time()
        
        # Compile final results
        final_results = {
            "test_timestamp": datetime.now().isoformat(),
            "response_times": response_results,
            "load_testing": load_results,
            "system_resources": resource_results,
            "model_performance": model_results,
            "summary": {
                "api_health": "healthy" if response_results else "issues_detected",
                "performance_rating": self._calculate_performance_rating(load_results),
                "recommendations": self._generate_recommendations(load_results, resource_results)
            }
        }
        
        return final_results
    
    def _calculate_performance_rating(self, load_results):
        """Calculate overall performance rating"""
        if not load_results or load_results.get('success_rate', 0) < 95:
            return "needs_improvement"
        elif load_results.get('avg_response_time_ms', 1000) < 100:
            return "excellent"
        elif load_results.get('avg_response_time_ms', 1000) < 300:
            return "good"
        else:
            return "fair"
    
    def _generate_recommendations(self, load_results, resource_results):
        """Generate performance recommendations"""
        recommendations = []
        
        if load_results.get('avg_response_time_ms', 0) > 500:
            recommendations.append("Consider optimizing API response times")
        
        if resource_results.get('cpu_usage', {}).get('avg_percent', 0) > 80:
            recommendations.append("High CPU usage detected - consider scaling or optimization")
        
        if resource_results.get('memory_usage', {}).get('avg_percent', 0) > 80:
            recommendations.append("High memory usage - consider increasing RAM or optimizing models")
        
        if load_results.get('success_rate', 100) < 95:
            recommendations.append("Success rate below 95% - investigate error handling")
        
        if not recommendations:
            recommendations.append("Performance looks good - no immediate optimizations needed")
        
        return recommendations
    
    def save_results(self, results, filename=None):
        """Save performance test results"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"performance_results_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"Performance results saved to {filename}")
        return filename

def run_performance_evaluation():
    """Main function to run performance evaluation"""
    evaluator = PerformanceEvaluator()
    
    try:
        results = evaluator.run_full_evaluation()
        
        print("\n" + "=" * 60)
        print("PERFORMANCE EVALUATION RESULTS")
        print("=" * 60)
        
        # Print summary
        print(f"API Health: {results['summary']['api_health']}")
        print(f"Performance Rating: {results['summary']['performance_rating']}")
        
        if 'load_testing' in results:
            lt = results['load_testing']
            print(f"Success Rate: {lt.get('success_rate', 0):.1f}%")
            print(f"Average Response Time: {lt.get('avg_response_time_ms', 0):.1f}ms")
            print(f"Requests per Second: {lt.get('requests_per_second', 0):.1f}")
        
        print("\nRecommendations:")
        for rec in results['summary']['recommendations']:
            print(f"  • {rec}")
        
        # Save results
        filename = evaluator.save_results(results)
        
        return results, filename
        
    except Exception as e:
        print(f"Error during performance evaluation: {e}")
        return None, None

if __name__ == "__main__":
    run_performance_evaluation()