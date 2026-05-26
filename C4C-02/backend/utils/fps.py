import time

class FPSCounter:
    def __init__(self):
        self.prev_time = time.time()

    def update(self):
        current_time = time.time()

        fps = 1 / (current_time - self.prev_time)

        self.prev_time = current_time

        return int(fps)