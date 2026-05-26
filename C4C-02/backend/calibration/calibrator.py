import cv2
import numpy as np


class SpatialCalibrator:

    def __init__(self):

        self.points = []


    def mouse_callback(self, event, x, y, flags, param):

        if event == cv2.EVENT_LBUTTONDOWN:

            if len(self.points) < 2:

                self.points.append((x, y))

                print(f"Point Selected: ({x}, {y})")


    def calibrate(self, frame, physical_distance_meters=2.0):

        clone = frame.copy()

        window_name = "Spatial Calibration"


        cv2.namedWindow(window_name)

        cv2.setMouseCallback(window_name, self.mouse_callback)


        while True:

            display = clone.copy()


            # -----------------------------------
            # DRAW SELECTED POINTS
            # -----------------------------------

            for point in self.points:

                cv2.circle(display, point, 8, (0, 0, 255), -1)


            # -----------------------------------
            # DRAW LINE
            # -----------------------------------

            if len(self.points) == 2:

                cv2.line(
                    display,
                    self.points[0],
                    self.points[1],
                    (0, 255, 0),
                    2
                )


            cv2.putText(
                display,
                "Click Two Floor Markers",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (255, 255, 255),
                2
            )


            cv2.imshow(window_name, display)


            key = cv2.waitKey(1)


            # -----------------------------------
            # COMPLETE CALIBRATION
            # -----------------------------------

            if len(self.points) == 2:

                break


            # -----------------------------------
            # EXIT
            # -----------------------------------

            if key == ord('q'):

                cv2.destroyWindow(window_name)

                return None


        cv2.destroyWindow(window_name)


        # -----------------------------------
        # PIXEL DISTANCE
        # -----------------------------------

        p1 = np.array(self.points[0])

        p2 = np.array(self.points[1])

        pixel_distance = np.linalg.norm(p2 - p1)


        # -----------------------------------
        # SCALE FACTOR
        # -----------------------------------

        scale_factor = physical_distance_meters / pixel_distance


        print(f"Pixel Distance: {pixel_distance:.2f}")

        print(f"Scale Factor (m/pixel): {scale_factor:.6f}")


        return scale_factor