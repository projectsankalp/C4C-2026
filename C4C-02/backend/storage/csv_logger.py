import csv
import os
from datetime import datetime


class CSVLogger:

    def __init__(self):

        timestamp = datetime.now().strftime(
            "%Y%m%d_%H%M%S"
        )

        self.filename = (
            f"data/session_logs/"
            f"session_{timestamp}.csv"
        )

        os.makedirs(
            "data/session_logs",
            exist_ok=True
        )

        self.file = open(
            self.filename,
            mode="w",
            newline=""
        )

        self.writer = csv.writer(
            self.file
        )


        # -----------------------------------
        # CSV HEADER
        # -----------------------------------

        self.writer.writerow([

            "frame",
            "timestamp_ms",

            "hip_x",
            "hip_y",
            "hip_visibility",

            "knee_x",
            "knee_y",
            "knee_visibility",

            "ankle_x",
            "ankle_y",
            "ankle_visibility",

            "heel_x",
            "heel_y",
            "heel_visibility",

            # -----------------------------------
            # DERIVED BIOMECHANICAL METRICS
            # -----------------------------------

            "knee_angle",

            "cadence",

            "gait_interval",

            "confidence",

            "distance_meters"
        ])


    # -----------------------------------
    # LOG FRAME
    # -----------------------------------

    def log_frame(
        self,
        frame_id,
        timestamp_ms,
        lower_body,

        knee_angle,
        cadence,
        gait_interval,
        confidence,
        distance_meters
    ):

        hip = lower_body["right_hip"]

        knee = lower_body["right_knee"]

        ankle = lower_body["right_ankle"]

        heel = lower_body["right_heel"]


        self.writer.writerow([

            frame_id,
            timestamp_ms,

            hip.x,
            hip.y,
            hip.visibility,

            knee.x,
            knee.y,
            knee.visibility,

            ankle.x,
            ankle.y,
            ankle.visibility,

            heel.x,
            heel.y,
            heel.visibility,

            # -----------------------------------
            # DERIVED METRICS
            # -----------------------------------

            knee_angle,

            cadence,

            gait_interval,

            confidence,

            distance_meters
        ])


    # -----------------------------------
    # CLOSE FILE
    # -----------------------------------

    def close(self):

        self.file.close()