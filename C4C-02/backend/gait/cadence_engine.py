import time


class CadenceEngine:

    def __init__(self):

        # -----------------------------------
        # PREVIOUS VALUES
        # -----------------------------------

        self.previous_x = None

        self.previous_velocity = None


        # -----------------------------------
        # STEP METRICS
        # -----------------------------------

        self.step_count = 0

        self.cadence = 0

        self.last_step_time = None


        # -----------------------------------
        # STABILITY CONTROL
        # -----------------------------------

        self.minimum_velocity = 0.003

        self.step_cooldown = 0.4


    # -----------------------------------
    # UPDATE ENGINE
    # -----------------------------------

    def update(self, ankle_x):

        current_time = time.time()

        detected = False


        # -----------------------------------
        # INITIALIZATION
        # -----------------------------------

        if self.previous_x is None:

            self.previous_x = ankle_x

            return {

                "step_detected": False,

                "step_count": self.step_count,

                "cadence": self.cadence
            }


        # -----------------------------------
        # VELOCITY
        # -----------------------------------

        velocity = ankle_x - self.previous_x


        # -----------------------------------
        # DIRECTION CHANGE DETECTION
        # -----------------------------------

        if self.previous_velocity is not None:

            direction_changed = (

                self.previous_velocity > 0
                and
                velocity < 0
            )


            sufficient_motion = (

                abs(self.previous_velocity)
                >
                self.minimum_velocity
            )


            cooldown_complete = (

                self.last_step_time is None
                or
                (
                    current_time
                    -
                    self.last_step_time
                )
                >
                self.step_cooldown
            )


            # -----------------------------------
            # STEP EVENT
            # -----------------------------------

            if (
                direction_changed
                and
                sufficient_motion
                and
                cooldown_complete
            ):

                self.step_count += 1

                detected = True


                # -----------------------------------
                # CADENCE
                # -----------------------------------

                if self.last_step_time is not None:

                    interval = (
                        current_time
                        -
                        self.last_step_time
                    )

                    if interval > 0:

                        self.cadence = (

                            60 / interval
                        )


                self.last_step_time = current_time


        # -----------------------------------
        # STORE VALUES
        # -----------------------------------

        self.previous_velocity = velocity

        self.previous_x = ankle_x


        return {

            "step_detected": detected,

            "step_count": self.step_count,

            "cadence": self.cadence
        }