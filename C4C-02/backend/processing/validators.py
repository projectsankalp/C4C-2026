import numpy as np


class SignalValidator:

    def __init__(self):

        self.previous_position = None

        self.max_jump_threshold = 120


    def is_valid_frame(
        self,
        frame_id,
        confidence,
        ankle_position
    ):

        # -----------------------------------
        # WARMUP REJECTION
        # -----------------------------------

        if frame_id < 60:

            return False


        # -----------------------------------
        # CONFIDENCE FILTER
        # -----------------------------------

        if confidence < 0.7:

            return False


        # -----------------------------------
        # OUTLIER DETECTION
        # -----------------------------------

        if self.previous_position is not None:

            displacement = np.linalg.norm(
                ankle_position - self.previous_position
            )

            if displacement > self.max_jump_threshold:

                return False


        self.previous_position = ankle_position

        return True