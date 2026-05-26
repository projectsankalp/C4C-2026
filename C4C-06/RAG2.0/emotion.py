import cv2
import mediapipe as mp
import numpy as np
import math
import time

# Mediapipe face mesh config
mp_face_mesh = mp.solutions.face_mesh

LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]
TOP_LIP = 13
BOTTOM_LIP = 14
LEFT_MOUTH = 61
RIGHT_MOUTH = 291
NOSE_TIP = 1
LEFT_EYE_CENTER = 33
RIGHT_EYE_CENTER = 263

def distance(p1, p2):
    return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)

def get_point(landmarks, index, w, h):
    point = landmarks[index]
    return (int(point.x * w), int(point.y * h))

def calculate_ear(landmarks, eye_indices, w, h):
    p1 = get_point(landmarks, eye_indices[0], w, h)
    p2 = get_point(landmarks, eye_indices[1], w, h)
    p3 = get_point(landmarks, eye_indices[2], w, h)
    p4 = get_point(landmarks, eye_indices[3], w, h)
    p5 = get_point(landmarks, eye_indices[4], w, h)
    p6 = get_point(landmarks, eye_indices[5], w, h)
    
    vertical1 = distance(p2, p6)
    vertical2 = distance(p3, p5)
    horizontal = distance(p1, p4)
    
    if horizontal == 0:
        return 0
    return (vertical1 + vertical2) / (2.0 * horizontal)

def calculate_mar(landmarks, w, h):
    top = get_point(landmarks, TOP_LIP, w, h)
    bottom = get_point(landmarks, BOTTOM_LIP, w, h)
    left = get_point(landmarks, LEFT_MOUTH, w, h)
    right = get_point(landmarks, RIGHT_MOUTH, w, h)
    
    vertical = distance(top, bottom)
    horizontal = distance(left, right)
    
    if horizontal == 0:
        return 0
    return vertical / horizontal

def calculate_smile_score(landmarks, w, h):
    left_mouth = get_point(landmarks, LEFT_MOUTH, w, h)
    right_mouth = get_point(landmarks, RIGHT_MOUTH, w, h)
    return distance(left_mouth, right_mouth)

def detect_head_down(landmarks, w, h):
    nose = get_point(landmarks, NOSE_TIP, w, h)
    left_eye = get_point(landmarks, LEFT_EYE_CENTER, w, h)
    right_eye = get_point(landmarks, RIGHT_EYE_CENTER, w, h)
    
    eye_y = (left_eye[1] + right_eye[1]) / 2
    if nose[1] - eye_y > 45:
        return True
    return False

def get_user_emotion(max_runtime=10, show_window=True):
    face_mesh = mp_face_mesh.FaceMesh(
        static_image_mode=False,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.6,
        min_tracking_confidence=0.6
    )
    
    # Try multiple capture devices and backends (CAP_DSHOW is highly optimized for Windows)
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)
    if not cap.isOpened():
        cap = cv2.VideoCapture(1)
        
    if not cap.isOpened():
        print("[EMOTION] Webcam could not be opened on index 0 or 1.")
        return "NEUTRAL", 0, "No webcam detected."
        
    blink_counter = 0
    blink_timestamps = []
    ear_history = []
    mar_history = []
    smile_history = []
    baseline_smile = []
    
    START_TIME = time.time()
    emotional_state = "NEUTRAL"
    wellness_score = 0
    intro = "You seem emotionally stable."
    
    while True:
        current_runtime = time.time() - START_TIME
        if current_runtime >= max_runtime:
            print(f"[EMOTION] {max_runtime} seconds completed.")
            break
            
        success, frame = cap.read()
        if not success:
            break
            
        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb)
        
        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                landmarks = face_landmarks.landmark
                
                # EAR
                left_ear = calculate_ear(landmarks, LEFT_EYE, w, h)
                right_ear = calculate_ear(landmarks, RIGHT_EYE, w, h)
                ear = (left_ear + right_ear) / 2
                
                # MAR
                mar = calculate_mar(landmarks, w, h)
                
                # Smile Score
                smile_score = calculate_smile_score(landmarks, w, h)
                
                # Smile Baseline
                if current_runtime < 1.5:
                    baseline_smile.append(smile_score)
                    calibrated_baseline = np.mean(baseline_smile)
                else:
                    calibrated_baseline = np.mean(baseline_smile)
                    
                # Blink Detection
                if ear < 0.20:
                    blink_counter += 1
                else:
                    if blink_counter >= 2:
                        blink_timestamps.append(time.time())
                    blink_counter = 0
                    
                # Blink Rate (last 60s)
                blink_timestamps = [t for t in blink_timestamps if time.time() - t < 60]
                blink_rate = len(blink_timestamps)
                
                # History lists
                ear_history.append(ear)
                mar_history.append(mar)
                smile_history.append(smile_score)
                
                ear_history = ear_history[-30:]
                mar_history = mar_history[-30:]
                smile_history = smile_history[-30:]
                
                avg_ear = np.mean(ear_history)
                avg_mar = np.mean(mar_history)
                avg_smile = np.mean(smile_history)
                
                # Smile Drop
                smile_drop = calibrated_baseline - avg_smile
                
                # Wellness Score
                wellness_score = 0
                if avg_ear < 0.22:
                    wellness_score += 20
                if blink_rate > 18:
                    wellness_score += 10
                if avg_mar > 0.32:
                    wellness_score += 10
                if detect_head_down(landmarks, w, h):
                    wellness_score += 15
                if smile_drop > 10:
                    wellness_score += 20
                if avg_smile > calibrated_baseline + 12:
                    wellness_score -= 10
                    
                wellness_score = max(0, min(100, wellness_score))
                
                # Classification
                if avg_smile > calibrated_baseline + 18 and avg_ear > 0.24 and wellness_score < 20:
                    emotional_state = "POSITIVE"
                elif wellness_score > 55:
                    emotional_state = "HIGH FATIGUE"
                elif wellness_score > 30:
                    emotional_state = "MILD FATIGUE"
                else:
                    emotional_state = "NEUTRAL"
                    
                # Message
                if emotional_state == "POSITIVE":
                    intro = "You seem relaxed and positive."
                elif emotional_state == "MILD FATIGUE":
                    intro = "You seem slightly tired or stressed."
                elif emotional_state == "HIGH FATIGUE":
                    intro = "You may be mentally fatigued."
                else:
                    intro = "You seem emotionally stable."
                    
                # Draw facial landmarks
                for lm in landmarks:
                    x = int(lm.x * w)
                    y = int(lm.y * h)
                    cv2.circle(frame, (x, y), 1, (0, 255, 0), -1)
                    
                # HUD Display
                cv2.putText(frame, f"State: {emotional_state}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
                cv2.putText(frame, f"Wellness Score: {wellness_score}", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                cv2.putText(frame, f"Blink Rate: {blink_rate}", (20, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
                cv2.putText(frame, intro, (20, 170), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
                remaining = int(max_runtime - current_runtime)
                cv2.putText(frame, f"Analyzing: {remaining}s left", (20, 220), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
                
        if show_window:
            cv2.imshow("Aura Neural Emotion Core", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        else:
            time.sleep(0.03) # Match 30 FPS pacing headlessly
            
    cap.release()
    if show_window:
        cv2.destroyAllWindows()
    return emotional_state, wellness_score, intro

if __name__ == "__main__":
    print("[EMOTION] Starting standalone facial scanning session...")
    state, score, msg = get_user_emotion(max_runtime=20)
    print(f"\n[SUMMARY] Detected State: {state}")
    print(f"[SUMMARY] Wellness Score: {score}")
    print(f"[SUMMARY] Support Message: {msg}")