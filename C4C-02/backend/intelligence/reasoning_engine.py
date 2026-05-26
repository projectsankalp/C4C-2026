import numpy as np


class BiomechanicalReasoningEngine:

    def __init__(self):

        # -----------------------------------
        # APPROXIMATE NORMATIVE RANGES
        # -----------------------------------

        self.reference_ranges = {

            "cadence": (100, 120),

            "walking_speed": (1.0, 1.4),

            "knee_rom": (55, 70),

            "gait_interval_cv": (0, 5)
        }


    # -----------------------------------
    # COEFFICIENT OF VARIATION
    # -----------------------------------

    def calculate_cv(self, values):

        if len(values) < 2:
            return None

        mean = np.mean(values)

        std = np.std(values)

        if mean == 0:
            return None

        return (std / mean) * 100


    # -----------------------------------
    # RANGE COMPARISON
    # -----------------------------------

    def compare_range(
        self,
        metric_name,
        value
    ):

        low, high = self.reference_ranges[metric_name]

        if value < low:

            return "below_normal"

        elif value > high:

            return "above_normal"

        else:

            return "within_normal"


    # -----------------------------------
    # MAIN ANALYSIS ENGINE
    # -----------------------------------

    def analyze_session(
        self,
        cadence_values,
        knee_angles,
        gait_intervals,
        walking_speed
    ):

        report = {}

        observations = []


        # -----------------------------------
        # CADENCE
        # -----------------------------------

        mean_cadence = np.mean(cadence_values)

        cadence_status = self.compare_range(
            "cadence",
            mean_cadence
        )

        report["mean_cadence"] = round(
            mean_cadence,
            2
        )

        report["cadence_status"] = cadence_status


        if cadence_status == "below_normal":

            observations.append(
                "Observed cadence is below normative adult walking ranges."
            )


        # -----------------------------------
        # KNEE ROM
        # -----------------------------------

        knee_rom = (
            np.max(knee_angles)
            -
            np.min(knee_angles)
        )

        knee_status = self.compare_range(
            "knee_rom",
            knee_rom
        )

        report["knee_rom"] = round(
            knee_rom,
            2
        )

        report["knee_rom_status"] = knee_status


        if knee_status == "below_normal":

            observations.append(
                "Reduced knee range of motion observed during gait."
            )


        # -----------------------------------
        # GAIT VARIABILITY
        # -----------------------------------

        gait_cv = self.calculate_cv(
            gait_intervals
        )

        if gait_cv is not None:

            gait_cv_status = self.compare_range(
                "gait_interval_cv",
                gait_cv
            )

            report["gait_interval_cv"] = round(
                gait_cv,
                2
            )

            report["gait_interval_cv_status"] = (
                gait_cv_status
            )


            if gait_cv_status == "above_normal":

                observations.append(
                    "Elevated gait interval variability detected."
                )


        # -----------------------------------
        # WALKING SPEED
        # -----------------------------------

        speed_status = self.compare_range(
            "walking_speed",
            walking_speed
        )

        report["walking_speed"] = round(
            walking_speed,
            2
        )

        report["walking_speed_status"] = (
            speed_status
        )


        if speed_status == "below_normal":

            observations.append(
                "Walking speed is below typical healthy adult ranges."
            )


        # -----------------------------------
        # OVERALL SUMMARY
        # -----------------------------------

        if len(observations) == 0:

            summary = (
                "Observed gait metrics fall "
                "within approximate normative ranges."
            )

        else:

            summary = " ".join(observations)


        report["summary"] = summary

        return report