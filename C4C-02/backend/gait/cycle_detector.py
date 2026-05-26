import time


class GaitCycleDetector:

    def __init__(self):

        self.previous_value = None

        self.previous_slope = None

        self.last_peak_time = None

        self.gait_intervals = []

        self.min_peak_distance = 0.3


    def update(self, signal_value):

        current_time = time.time()

        peak_detected = False

        gait_interval = None


        # -----------------------------------
        # INITIALIZATION
        # -----------------------------------

        if self.previous_value is None:

            self.previous_value = signal_value

            return {
                "peak_detected": False,
                "gait_interval": None
            }


        # -----------------------------------
        # SLOPE
        # -----------------------------------

        slope = signal_value - self.previous_value


        # -----------------------------------
        # PEAK DETECTION
        # -----------------------------------

        if self.previous_slope is not None:

            # Peak occurs when:
            # positive slope -> negative slope

            if self.previous_slope > 0 and slope < 0:

                if (
                    self.last_peak_time is None
                    or
                    (current_time - self.last_peak_time)
                    > self.min_peak_distance
                ):

                    peak_detected = True


                    # -----------------------------------
                    # GAIT INTERVAL
                    # -----------------------------------

                    if self.last_peak_time is not None:

                        gait_interval = (
                            current_time - self.last_peak_time
                        )

                        self.gait_intervals.append(
                            gait_interval
                        )


                    self.last_peak_time = current_time


        # -----------------------------------
        # UPDATE STATE
        # -----------------------------------

        self.previous_value = signal_value

        self.previous_slope = slope


        return {
            "peak_detected": peak_detected,
            "gait_interval": gait_interval
        }