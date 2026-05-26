import numpy as np


class KinematicsEngine:

    def __init__(self):

        pass


    # -----------------------------------
    # JOINT ANGLE CALCULATION
    # -----------------------------------

    def calculate_angle(
        self,
        point_a,
        point_b,
        point_c
    ):

        a = np.array(point_a)

        b = np.array(point_b)

        c = np.array(point_c)


        # -----------------------------------
        # CREATE VECTORS
        # -----------------------------------

        ba = a - b

        bc = c - b


        # -----------------------------------
        # COSINE RULE
        # -----------------------------------

        cosine_angle = np.dot(
            ba,
            bc
        ) / (
            np.linalg.norm(ba)
            *
            np.linalg.norm(bc)
        )


        cosine_angle = np.clip(
            cosine_angle,
            -1.0,
            1.0
        )


        angle = np.arccos(
            cosine_angle
        )


        return np.degrees(angle)