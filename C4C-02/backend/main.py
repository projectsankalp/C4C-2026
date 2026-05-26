import cv2
import numpy as np

from acquisition.pose_runtime import PoseRuntime
from utils.fps import FPSCounter
from storage.csv_logger import CSVLogger

from processing.smoother import ExponentialSmoother
from processing.validators import SignalValidator

from biomechanics.kinematics import KinematicsEngine

from gait.cadence_engine import CadenceEngine
from gait.cycle_detector import GaitCycleDetector

from calibration.calibrator import SpatialCalibrator


# -----------------------------------
# INITIALIZE RUNTIME COMPONENTS
# -----------------------------------

pose_runtime = PoseRuntime()

fps_counter = FPSCounter()

csv_logger = CSVLogger()

kinematics_engine = KinematicsEngine()

cadence_engine = CadenceEngine()

cycle_detector = GaitCycleDetector()

calibrator = SpatialCalibrator()

signal_validator = SignalValidator()


# -----------------------------------
# INITIALIZE SMOOTHERS
# -----------------------------------

ankle_x_smoother = ExponentialSmoother(alpha=0.3)

ankle_y_smoother = ExponentialSmoother(alpha=0.3)

heel_y_smoother = ExponentialSmoother(alpha=0.3)


# -----------------------------------
# INITIALIZE CAMERA
# -----------------------------------

cap = cv2.VideoCapture(0)

if not cap.isOpened():

    print("ERROR: Webcam not accessible.")

    exit()


# -----------------------------------
# READ FIRST FRAME FOR CALIBRATION
# -----------------------------------

success, calibration_frame = cap.read()

if not success:

    print("ERROR: Could not read calibration frame.")

    exit()


# -----------------------------------
# SPATIAL CALIBRATION
# -----------------------------------

print("\n--- SPATIAL CALIBRATION ---")
print("Place two floor markers exactly 2 meters apart.")
print("Click both markers on the calibration window.\n")

scale_factor = calibrator.calibrate(
    calibration_frame,
    physical_distance_meters=2.0
)

if scale_factor is None:

    print("Calibration cancelled.")

    cap.release()

    exit()


# -----------------------------------
# FRAME COUNTER
# -----------------------------------

frame_id = 0


# -----------------------------------
# PREVIOUS ANKLE POSITION
# -----------------------------------

previous_ankle_position = None


# -----------------------------------
# TOTAL DISTANCE
# -----------------------------------

total_distance_meters = 0


# -----------------------------------
# MAIN RUNTIME LOOP
# -----------------------------------

while True:

    success, frame = cap.read()

    if not success:
        break


    # -----------------------------------
    # TIMESTAMP
    # -----------------------------------

    timestamp_ms = cap.get(cv2.CAP_PROP_POS_MSEC)


    # -----------------------------------
    # PROCESS POSE
    # -----------------------------------

    results = pose_runtime.process_frame(frame)


    # -----------------------------------
    # DRAW LANDMARKS
    # -----------------------------------

    pose_runtime.draw_landmarks(frame, results)


    # -----------------------------------
    # EXTRACT LOWER BODY
    # -----------------------------------

    lower_body = pose_runtime.extract_lower_body(results)


    # -----------------------------------
    # FPS CALCULATION
    # -----------------------------------

    fps = fps_counter.update()


    # -----------------------------------
    # DISPLAY FPS
    # -----------------------------------

    cv2.putText(
        frame,
        f"FPS: {fps}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )


    # -----------------------------------
    # LOWER BODY PROCESSING
    # -----------------------------------

    if lower_body:

        # -----------------------------------
        # LANDMARK EXTRACTION
        # -----------------------------------

        hip = lower_body["right_hip"]

        knee = lower_body["right_knee"]

        ankle = lower_body["right_ankle"]

        heel = lower_body["right_heel"]


        # -----------------------------------
        # CONFIDENCE
        # -----------------------------------

        confidence = ankle.visibility


        # -----------------------------------
        # CURRENT ANKLE POSITION
        # -----------------------------------

        current_ankle_position = np.array([
            ankle.x * frame.shape[1],
            ankle.y * frame.shape[0]
        ])


        # -----------------------------------
        # SIGNAL VALIDATION
        # -----------------------------------

        valid_frame = signal_validator.is_valid_frame(
            frame_id,
            confidence,
            current_ankle_position
        )


        # -----------------------------------
        # DISPLAY VALIDITY
        # -----------------------------------

        validity_text = "VALID FRAME"

        validity_color = (0, 255, 0)

        if not valid_frame:

            validity_text = "INVALID FRAME"

            validity_color = (0, 0, 255)


        cv2.putText(
            frame,
            validity_text,
            (20, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            validity_color,
            2
        )


        # -----------------------------------
        # SKIP INVALID FRAMES
        # -----------------------------------

        if not valid_frame:

            cv2.imshow("Gait AI Runtime V1.0", frame)

            key = cv2.waitKey(1)

            if key == ord('q'):
                break

            frame_id += 1

            continue


        # -----------------------------------
        # REAL-TIME SMOOTHING
        # -----------------------------------

        smoothed_ankle_x = ankle_x_smoother.update(
            ankle.x
        )

        smoothed_ankle_y = ankle_y_smoother.update(
            ankle.y
        )

        smoothed_heel_y = heel_y_smoother.update(
            heel.y
        )


        # -----------------------------------
        # KNEE ANGLE CALCULATION
        # -----------------------------------

        knee_angle = kinematics_engine.calculate_angle(
            (hip.x, hip.y),
            (knee.x, knee.y),
            (ankle.x, ankle.y)
        )


        # -----------------------------------
        # CADENCE ENGINE
        # -----------------------------------
        gait_metrics = cadence_engine.update(smoothed_ankle_x)

        step_count = gait_metrics["step_count"]

        cadence = gait_metrics["cadence"]

        step_detected = gait_metrics["step_detected"]


        # -----------------------------------
        # GAIT CYCLE DETECTION
        # -----------------------------------

        cycle_metrics = cycle_detector.update(
            smoothed_heel_y
        )

        peak_detected = cycle_metrics["peak_detected"]

        gait_interval = cycle_metrics["gait_interval"]


        # -----------------------------------
        # APPROXIMATE DISTANCE ESTIMATION
        # -----------------------------------

        if previous_ankle_position is not None:

            pixel_displacement = np.linalg.norm(
                current_ankle_position
                -
                previous_ankle_position
            )

            displacement_meters = (
                pixel_displacement
                *
                scale_factor
            )

            total_distance_meters += (
                displacement_meters
            )


        previous_ankle_position = (
            current_ankle_position
        )


        # -----------------------------------
        # DISPLAY CONFIDENCE
        # -----------------------------------

        cv2.putText(
            frame,
            f"Confidence: {confidence:.2f}",
            (20, 120),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 255),
            2
        )


        # -----------------------------------
        # DISPLAY KNEE ANGLE
        # -----------------------------------

        cv2.putText(
            frame,
            f"Knee Angle: {knee_angle:.1f}",
            (20, 160),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 128, 255),
            2
        )


        # -----------------------------------
        # DISPLAY STEP COUNT
        # -----------------------------------

        cv2.putText(
            frame,
            f"Step Count: {step_count}",
            (20, 200),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )


        # -----------------------------------
        # DISPLAY CADENCE
        # -----------------------------------

        cv2.putText(
            frame,
            f"Cadence: {cadence:.1f} steps/min",
            (20, 240),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 100, 100),
            2
        )


        # -----------------------------------
        # DISPLAY DISTANCE
        # -----------------------------------

        cv2.putText(
            frame,
            f"Distance: {total_distance_meters:.2f} m",
            (20, 280),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (100, 255, 100),
            2
        )


        # -----------------------------------
        # DISPLAY GAIT INTERVAL
        # -----------------------------------

        if gait_interval is not None:

            cv2.putText(
                frame,
                f"Gait Interval: "
                f"{gait_interval:.2f}s",
                (20, 320),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (255, 0, 255),
                2
            )


        # -----------------------------------
        # STEP EVENT VISUALIZATION
        # -----------------------------------

        if step_detected:

            cv2.putText(
                frame,
                "STEP DETECTED",
                (20, 380),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255),
                3
            )


        # -----------------------------------
        # PEAK DETECTED
        # -----------------------------------

        if peak_detected:

            cv2.putText(
                frame,
                "GAIT PEAK DETECTED",
                (20, 430),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (255, 0, 0),
                3
            )


        # -----------------------------------
        # LOG CSV DATA
        # -----------------------------------

        csv_logger.log_frame(

            frame_id=frame_id,

            timestamp_ms=timestamp_ms,

            lower_body=lower_body,

            knee_angle=knee_angle,

            cadence=cadence,

            gait_interval=gait_interval,

            confidence=confidence,

            distance_meters=total_distance_meters
        )


    # -----------------------------------
    # DISPLAY WINDOW
    # -----------------------------------

    cv2.imshow(
        "Gait AI Runtime V1.0",
        frame
    )


    # -----------------------------------
    # EXIT KEY
    # -----------------------------------

    key = cv2.waitKey(1)

    if key == ord('q'):
        break


    # -----------------------------------
    # FRAME COUNTER
    # -----------------------------------

    frame_id += 1


# -----------------------------------
# CLEANUP
# -----------------------------------

csv_logger.close()

cap.release()

cv2.destroyAllWindows()