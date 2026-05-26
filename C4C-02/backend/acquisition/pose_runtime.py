import cv2
import mediapipe as mp


class PoseRuntime:

    def __init__(self):

        self.mp_pose = mp.solutions.pose

        self.mp_draw = mp.solutions.drawing_utils

        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def process_frame(self, frame):

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        results = self.pose.process(rgb)

        return results

    def draw_landmarks(self, frame, results):

        if results.pose_landmarks:

            self.mp_draw.draw_landmarks(
                frame,
                results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS
            )

    def extract_lower_body(self, results):

        if not results.pose_landmarks:
            return None

        landmarks = results.pose_landmarks.landmark

        lower_body = {
            "right_hip": landmarks[24],
            "right_knee": landmarks[26],
            "right_ankle": landmarks[28],
            "right_heel": landmarks[30],
            "right_foot_index": landmarks[32]
        }

        return lower_body